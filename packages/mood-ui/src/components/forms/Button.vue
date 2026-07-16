<template>
  <!-- Skeleton placeholder — mirrors the real button's footprint (size, 
         radius, fullWidth). Useful for action rows that load after the 
         page paints. -->
  <Skeleton
    v-if="skeleton"
    shape="button"
    :size="forwardSize"
    :radius="radius"
    :fullWidth="fullWidth"
  />

  <component
    :is="rootTag"
    v-else
    :type="isLink ? undefined : type"
    :href="linkHref"
    :target="isLink ? target : undefined"
    :rel="isLink ? rel : undefined"
    :disabled="isLink ? undefined : isDisabled || loading"
    :aria-disabled="isLink && isEffectivelyDisabled ? 'true' : undefined"
    :tabindex="isLink && isEffectivelyDisabled ? -1 : undefined"
    :aria-busy="loading || undefined"
    :aria-label="resolvedAriaLabel"
    :class="[
      baseClasses,
      variantClasses,
      colorClasses,
      haloClasses,
      sizeClasses,
      radiusClasses,
      fullWidth ? 'w-full' : '',
      isLink && isEffectivelyDisabled
        ? 'opacity-40 pointer-events-none cursor-not-allowed'
        : '',
    ]"
  >
    <Loader
      v-if="loading && iconPosition === 'left'"
      :variant="variant"
      :size="forwardSize"
    />
    <component
      :is="icon"
      v-if="icon && !loading && iconPosition === 'left'"
      :class="iconSizeClasses"
    />

    <template v-if="loading">{{
      loadingText || label || "Loading..."
    }}</template>
    <template v-else>
      <slot>{{ label }}</slot>
    </template>
    <Loader
      v-if="loading && iconPosition === 'right'"
      :variant="variant"
      :size="forwardSize"
    />
    <component
      :is="icon"
      v-if="icon && !loading && iconPosition === 'right'"
      :class="iconSizeClasses"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, inject, useSlots } from "vue";
import type { Button } from "../../interfaces/forms/Button.interface";
import type { ModoSize } from "../../config/ModoConfig";
import {
  useResolvedColor,
  useResolvedHalo,
  useResolvedRadius,
  useModoConfig,
  useSizeTokens,
} from "../../composables/useModoConfig";
import { CONTROL_FOCUS_RING } from "../../composables/useField";
import Loader from "../feedback/Loader.vue";
import Skeleton from "../feedback/Skeleton.vue";

const groupProps = inject<{
  variant?: string;
  color?: string;
  size?: string;
  radius?: string;
  disabled?: boolean;
  gradient?: boolean;
  fullWidth?: boolean;
}>("buttonGroup", {});
const isInGroup = computed(() => Object.keys(groupProps).length > 0);

const props = withDefaults(defineProps<Button>(), {
  disabled: false,
  loading: false,
  variant: "normal",
  color: "default",
  gradient: false,
  type: "button",
  as: "button",
  fullWidth: false,
  iconPosition: "left",
  skeleton: false,
});

// Render as a real anchor when `as="a"` (navigation links). A `<button>` can't
// carry `href`, and an `<a>` can't carry `type`/`disabled` — so we swap the root
// tag and route the tag-specific attributes accordingly.
const isLink = computed(() => props.as === "a");
const isEffectivelyDisabled = computed(() => isDisabled.value || props.loading);
const rootTag = computed(() => (isLink.value ? "a" : "button"));
// A disabled link drops its href (so it isn't navigable) and relies on
// aria-disabled + pointer-events-none for the disabled affordance.
const linkHref = computed(() =>
  isLink.value && !isEffectivelyDisabled.value ? props.href : undefined,
);

const variant = computed(
  () => (groupProps.variant as Button["variant"]) ?? props.variant,
);
const color = useResolvedColor(() => {
  // Child button can override group color when explicitly set
  if (props.color !== "default") return props.color;
  return (groupProps.color as Button["color"]) ?? props.color;
});
// Inside a ButtonGroup the group's radius wins over the provider default
// so all corners (including the buttons' outer ones) match.
const radius = useResolvedRadius(
  () => (groupProps.radius as Button["radius"]) ?? props.radius,
);
const halo = useResolvedHalo();
const cfg = useModoConfig();
const size = computed<Button["size"]>(
  () =>
    (groupProps.size as Button["size"]) ??
    props.size ??
    cfg?.value.size ??
    "medium",
);
const sz = useSizeTokens(
  () => {
    const s = (groupProps.size as Button["size"]) ?? props.size ?? cfg?.value.size ?? "medium";
    // normalizeSize handles the legacy 'xs' alias — cast to satisfy useSizeTokens signature
    return s === "xs" ? "small" : s as ModoSize;
  },
);
// Loader/Skeleton don't have an 'xs'/'xsmall' size — collapse to 'small' when
// forwarding so the visual footprint of `<Button size="xs" loading>` stays compact.
const forwardSize = computed<"xsmall" | "small" | "medium" | "large">(() =>
  size.value === "xs" ? "small" : (size.value as "xsmall" | "small" | "medium" | "large"),
);
const isDisabled = computed(() => groupProps.disabled ?? props.disabled);
const gradient = computed(() => groupProps.gradient ?? props.gradient);
const fullWidth = computed(() => groupProps.fullWidth ?? props.fullWidth);

// Accessible name resolution:
// - explicit `ariaLabel` wins
// - else fall back to visible `label`
// - icon-only buttons without either will emit a dev warning so consumers notice
const slots = useSlots();

const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  if (props.label) return undefined; // visible text via prop
  if (slots.default) return undefined; // visible text via slot
  if (import.meta.env.DEV && props.icon) {
    console.warn(
      "[mood-ui] <Button> is icon-only but has no `ariaLabel` — add one for screen readers.",
    );
  }
  return undefined;
});

const baseClasses =
  `${CONTROL_FOCUS_RING} transition-colors duration-300 ease-in-out inline-flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed`;

const variantClasses = computed(() => {
  switch (variant.value) {
    case "outline":
      return "border font-medium";
    case "ghost":
      return "font-medium";
    case "text":
      return "font-medium";
    default:
      return "font-medium";
  }
});

const haloClasses = computed(() => {
  // Persistent (idle) halo, opt-in via 'neutral'/'tinted'. The FOCUS ring is
  // handled uniformly by `baseClasses` (CONTROL_FOCUS_RING), so these maps only
  // describe the resting + hover ring — no per-component focus ring here.
  // Suppressed inside a ButtonGroup (adjacent buttons would overlap rings).
  if (isInGroup.value) return "";
  if (variant.value !== "normal" && variant.value !== "outline") return "";

  const haloMode = halo.value;

  // 'off' (default): no idle/hover halo. Focus still shows the unified ring.
  if (haloMode === "off") return "";

  // 'neutral': idle grey ring.
  if (haloMode === "neutral") {
    return "ring-[3px] ring-foreground/10 hover:ring-foreground/15";
  }

  // 'tinted' (legacy): idle ring tinted to the color.
  const map: Record<string, string> = {
    default: "ring-[3px] ring-foreground/10 hover:ring-foreground/15",
    primary: "ring-[3px] ring-primary/15 hover:ring-primary/25",
    danger: "ring-[3px] ring-destructive/15 hover:ring-destructive/25",
    success: "ring-[3px] ring-success/15 hover:ring-success/25",
    warning: "ring-[3px] ring-warning/15 hover:ring-warning/25",
  };
  return map[color.value] ?? map.default;
});

const colorClasses = computed(() => {
  const isGradient = gradient.value;
  const map: Record<string, Record<string, string>> = {
    default: {
      normal: isGradient
        ? "text-background bg-gradient-to-r from-foreground via-foreground/90 to-foreground/90 hover:from-foreground/90 hover:via-foreground/80 hover:to-foreground/80 active:from-foreground/80 active:via-foreground/70 active:to-foreground/70 disabled:opacity-40"
        : "text-background bg-foreground hover:bg-foreground/90 active:bg-foreground/80 disabled:opacity-40",
      outline:
        "border-border text-foreground hover:bg-muted active:bg-muted-hover disabled:text-muted-foreground disabled:border-border disabled:bg-muted/60",
      ghost:
        "text-foreground bg-muted hover:bg-muted-hover active:bg-accent-hover disabled:text-muted-foreground disabled:bg-muted/60",
      text: "text-foreground hover:bg-muted active:bg-muted-hover disabled:text-muted-foreground",
    },
    primary: {
      normal: isGradient
        ? "text-primary-foreground bg-gradient-to-r from-primary via-primary/90 to-primary/90 hover:from-primary-hover hover:via-primary-hover/90 hover:to-primary-hover/90 active:from-primary-active active:via-primary-active/90 active:to-primary-active/90 disabled:opacity-40"
        : "text-primary-foreground bg-primary hover:bg-primary-hover active:bg-primary-active disabled:opacity-40",
      outline:
        "border-primary/40 text-primary hover:bg-primary-subtle active:bg-primary/20 disabled:text-primary/50 disabled:border-primary/20 disabled:bg-primary/5",
      ghost:
        "text-primary bg-primary-subtle hover:bg-primary/20 active:bg-primary/25 disabled:text-primary/50 disabled:bg-primary/5",
      text: "text-primary hover:bg-primary-subtle active:bg-primary/20 disabled:text-primary/50",
    },
    danger: {
      normal: isGradient
        ? "text-destructive-foreground bg-gradient-to-r from-destructive via-destructive/90 to-destructive/90 hover:from-destructive-hover hover:via-destructive-hover/90 hover:to-destructive-hover/90 active:from-destructive-active active:via-destructive-active/90 active:to-destructive-active/90 disabled:opacity-40"
        : "text-destructive-foreground bg-destructive hover:bg-destructive-hover active:bg-destructive-active disabled:opacity-40",
      outline:
        "border-destructive/40 text-destructive hover:bg-destructive-subtle active:bg-destructive/20 disabled:text-destructive/50 disabled:border-destructive/20 disabled:bg-destructive/5",
      ghost:
        "text-destructive bg-destructive-subtle hover:bg-destructive/20 active:bg-destructive/25 disabled:text-destructive/50 disabled:bg-destructive/5",
      text: "text-destructive hover:bg-destructive-subtle active:bg-destructive/20 disabled:text-destructive/50",
    },
    success: {
      normal: isGradient
        ? "text-success-foreground bg-gradient-to-r from-success via-success/90 to-success/90 hover:from-success-hover hover:via-success-hover/90 hover:to-success-hover/90 active:from-success-active active:via-success-active/90 active:to-success-active/90 disabled:opacity-40"
        : "text-success-foreground bg-success hover:bg-success-hover active:bg-success-active disabled:opacity-40",
      outline:
        "border-success/40 text-success hover:bg-success-subtle active:bg-success/20 disabled:text-success/50 disabled:border-success/20 disabled:bg-success/5",
      ghost:
        "text-success bg-success-subtle hover:bg-success/20 active:bg-success/25 disabled:text-success/50 disabled:bg-success/5",
      text: "text-success hover:bg-success-subtle active:bg-success/20 disabled:text-success/50",
    },
    warning: {
      normal: isGradient
        ? "text-warning-foreground bg-gradient-to-r from-warning via-warning/90 to-warning/90 hover:from-warning-hover hover:via-warning-hover/90 hover:to-warning-hover/90 active:from-warning-active active:via-warning-active/90 active:to-warning-active/90 disabled:opacity-40"
        : "text-warning-foreground bg-warning hover:bg-warning-hover active:bg-warning-active disabled:opacity-40",
      outline:
        "border-warning/40 text-warning hover:bg-warning-subtle active:bg-warning/20 disabled:text-warning/50 disabled:border-warning/20 disabled:bg-warning/5",
      ghost:
        "text-warning bg-warning-subtle hover:bg-warning/20 active:bg-warning/25 disabled:text-warning/50 disabled:bg-warning/5",
      text: "text-warning hover:bg-warning-subtle active:bg-warning/20 disabled:text-warning/50",
    },
  };
  return map[color.value]?.[variant.value] ?? map.default.normal;
});

const sizeClasses = computed(() => {
  if (!props.label && !slots.default && props.icon) {
    // icon-only button: square, height = control height
    return `${sz.value.control} aspect-square justify-center ${sz.value.text}`;
  }
  // text button: fixed control height (the anchor) + horizontal padding from tokens
  return `${sz.value.control} ${sz.value.text} ${sz.value.padX}`;
});

const radiusClasses = computed(() => {
  switch (radius.value) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-sm";
    case "large":
      return "rounded-lg";
    case "full":
      return "rounded-[999px]";
    default:
      return "rounded-md";
  }
});

const iconSizeClasses = computed(() => sz.value.icon);
</script>

<style scoped>
button,
a {
  transition-property:
    background-color, border-color, color, box-shadow, --tw-ring-color,
    --tw-ring-shadow;
  transition-duration: 220ms;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
}
@media (prefers-reduced-motion: reduce) {
  button,
  a {
    transition: none;
  }
}
</style>
