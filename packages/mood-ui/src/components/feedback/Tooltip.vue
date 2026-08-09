<template>
  <span
    ref="triggerRef"
    :class="['inline-flex', wrapperClass]"
    :aria-describedby="isOpen ? tooltipId : undefined"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
    @focusin="onTriggerFocus"
    @focusout="onTriggerBlur"
    @click="onTriggerClick"
    @touchmove.passive="onTouchScroll"
  >
    <slot />
  </span>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-fast ease-standard"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-fast ease-standard"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen && !disabled"
        :id="tooltipId"
        ref="panelRef"
        role="tooltip"
        :data-modo-theme="scopedTheme || undefined"
        :class="[
          'modo-tooltip fixed pointer-events-none select-none shadow-md',
          colorClasses,
          sizeClasses,
          radiusClasses,
        ]"
        :style="panelStyle"
        @mouseenter="onPanelEnter"
        @mouseleave="onPanelLeave"
      >
        <slot name="content">{{ content }}</slot>

        <span
          v-if="arrow"
          aria-hidden="true"
          :class="[
            'absolute w-2 h-2 rotate-45',
            arrowColorClass,
            arrowBorderClass,
          ]"
          :style="arrowStyle"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from "vue";
import type {
  Tooltip,
  TooltipPlacement,
  TooltipTrigger,
} from "../../interfaces/feedback/Tooltip.interface";
import {
  useResolvedColor,
  useResolvedRadius,
  useResolvedTheme,
  useModoConfig,
  useResolvedSize,
} from "../../composables/useModoConfig";
import { resolveColorMode } from "../../composables/useColorMode";
import {
  palettesToCssVars,
  semanticTokensFromPalettes,
} from "../../config/palettes";
import {
  hexToOklchString,
  pickForegroundOklch,
} from "../../config/colorPrimitives";
import { surfacesToCssVars } from "../../config/surfaces";
import {
  TOOLTIP_ARROW_SIZE,
  tooltipArrowCross,
  tooltipArrowInset,
} from "../../utils/tooltipArrow";
import type { ModoColor, ModoRadius } from "../../config/ModoConfig";

const props = withDefaults(defineProps<Tooltip>(), {
  placement: "top",
  offset: 8,
  trigger: () => ["hover", "focus"] as TooltipTrigger[],
  openDelay: 200,
  closeDelay: 100,
  arrow: true,
  color: "default",
  disabled: false,
  open: undefined,
  maxWidth: 260,
});

const resolvedSize = useResolvedSize(() => props.size);

const emit = defineEmits<{
  "update:open": [open: boolean];
  show: [];
  hide: [];
}>();

// Resolver color y radius desde ModoProvider (cascade).
// 'inverted' es especial del Tooltip y no forma parte de ModoColor.
const isInverted = computed(() => props.color === "inverted");
const resolvedColor = useResolvedColor(() =>
  isInverted.value ? undefined : (props.color as ModoColor | undefined),
);
const resolvedRadius = useResolvedRadius(
  () => props.radius as ModoRadius | undefined,
);

// Forward provider palette + theme to teleported panel.
const cfg = useModoConfig();
const theme = useResolvedTheme();
const scopedTheme = computed(() => resolveColorMode(theme.value));

const autoId = useId();
const tooltipId = computed(() => props.id ?? `modo-tooltip-${autoId}`);

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const internalOpen = ref(false);
const isControlled = computed(() => props.open !== undefined);
const isOpen = computed(() =>
  isControlled.value ? !!props.open : internalOpen.value,
);

const triggers = computed<TooltipTrigger[]>(() =>
  Array.isArray(props.trigger) ? props.trigger : [props.trigger],
);
const hasHover = computed(() => triggers.value.includes("hover"));
const hasFocus = computed(() => triggers.value.includes("focus"));
const hasClick = computed(() => triggers.value.includes("click"));

/* ---------- open/close with delays ---------- */

let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function scheduleOpen() {
  if (props.disabled || isControlled.value) return;
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  if (internalOpen.value) return;
  openTimer = setTimeout(() => {
    internalOpen.value = true;
    emit("update:open", true);
    emit("show");
  }, props.openDelay);
}
function scheduleClose() {
  if (isControlled.value) return;
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (!internalOpen.value) return;
  closeTimer = setTimeout(() => {
    internalOpen.value = false;
    emit("update:open", false);
    emit("hide");
  }, props.closeDelay);
}

/* ---------- Trigger events ---------- */

function onTriggerEnter() {
  if (hasHover.value) scheduleOpen();
}
function onTriggerLeave() {
  if (hasHover.value) scheduleClose();
}
function onTriggerFocus() {
  if (hasFocus.value) scheduleOpen();
}
function onTriggerBlur() {
  if (hasFocus.value) scheduleClose();
}
function onTriggerClick() {
  if (!hasClick.value) return;
  if (props.disabled || isControlled.value) return;
  if (internalOpen.value) {
    internalOpen.value = false;
    emit("update:open", false);
    emit("hide");
  } else {
    internalOpen.value = true;
    emit("update:open", true);
    emit("show");
  }
}
function onPanelEnter() {
  if (hasHover.value && closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}
function onPanelLeave() {
  if (hasHover.value) scheduleClose();
}

/* ---------- Positioning ---------- */

interface Pos {
  top: number;
  left: number;
  placement: TooltipPlacement;
  arrowCross?: number;
}
const position = ref<Pos>({ top: 0, left: 0, placement: props.placement });

function measure() {
  const panel = panelRef.value;
  if (!panel) return;

  // Anchor mode: position against a virtual point instead of the trigger box.
  const a = props.anchor;
  const tRect: DOMRect = a
    ? ({ top: a.y, bottom: a.y, left: a.x, right: a.x, width: 0, height: 0, x: a.x, y: a.y, toJSON() { return this; } } as DOMRect)
    : (triggerRef.value?.getBoundingClientRect() as DOMRect);
  if (!tRect) return;
  // Usar offsetWidth/Height (ignoran el transform de la transición scale).
  const panelW = panel.offsetWidth;
  const panelH = panel.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 8;
  const off = props.offset;

  let placement = props.placement;
  const axis = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
  const side = (placement.split("-")[1] ?? "center") as
    | "start"
    | "end"
    | "center";

  // Auto-flip vertical/horizontal if not enough room
  if (axis === "top" && tRect.top - panelH - off < margin) {
    placement = placement.replace("top", "bottom") as TooltipPlacement;
  } else if (axis === "bottom" && tRect.bottom + panelH + off > vh - margin) {
    placement = placement.replace("bottom", "top") as TooltipPlacement;
  } else if (axis === "left" && tRect.left - panelW - off < margin) {
    placement = placement.replace("left", "right") as TooltipPlacement;
  } else if (axis === "right" && tRect.right + panelW + off > vw - margin) {
    placement = placement.replace("right", "left") as TooltipPlacement;
  }

  const axis2 = placement.split("-")[0] as "top" | "bottom" | "left" | "right";

  let top = 0;
  let left = 0;

  if (axis2 === "top" || axis2 === "bottom") {
    top = axis2 === "top" ? tRect.top - panelH - off : tRect.bottom + off;
    if (side === "start") left = tRect.left;
    else if (side === "end") left = tRect.right - panelW;
    else left = tRect.left + tRect.width / 2 - panelW / 2;
  } else {
    left = axis2 === "left" ? tRect.left - panelW - off : tRect.right + off;
    if (side === "start") top = tRect.top;
    else if (side === "end") top = tRect.bottom - panelH;
    else top = tRect.top + tRect.height / 2 - panelH / 2;
  }

  // Clamp al viewport
  if (left + panelW > vw - margin) left = vw - panelW - margin;
  if (left < margin) left = margin;
  if (top + panelH > vh - margin) top = vh - panelH - margin;
  if (top < margin) top = margin;

  // Arrow centre (apuntando al centro del trigger, dentro del panel).
  const isVerticalAxis = axis2 === "top" || axis2 === "bottom";
  const edgeSize = isVerticalAxis ? panelW : panelH;
  const arrowCross = tooltipArrowCross(
    isVerticalAxis
      ? tRect.left + tRect.width / 2 - left
      : tRect.top + tRect.height / 2 - top,
    edgeSize,
    tooltipArrowInset(resolvedRadius.value, edgeSize),
  );

  position.value = { top, left, placement, arrowCross };
}

const panelStyle = computed(() => {
  const providerVars = cfg?.value.palettes
    ? {
        ...palettesToCssVars(cfg.value.palettes),
        ...semanticTokensFromPalettes(
          cfg.value.palettes,
          hexToOklchString,
          pickForegroundOklch,
        ),
      }
    : {};
  const surfaceVars = cfg?.value.surfaces
    ? surfacesToCssVars(cfg.value.surfaces)
    : {};
  const darkSurfaceVars =
    scopedTheme.value === "dark" && cfg?.value.darkSurfaces
      ? surfacesToCssVars(cfg.value.darkSurfaces)
      : {};
  return {
    ...providerVars,
    ...surfaceVars,
    ...darkSurfaceVars,
    top: `${position.value.top}px`,
    left: `${position.value.left}px`,
    maxWidth: `${props.maxWidth}px`,
    zIndex: "1400",
    transformOrigin: transformOriginFromPlacement(position.value.placement),
  };
});

function transformOriginFromPlacement(pl: TooltipPlacement): string {
  const axis = pl.split("-")[0];
  const side = pl.split("-")[1] ?? "center";
  switch (axis) {
    case "top":
      return side === "start"
        ? "left bottom"
        : side === "end"
          ? "right bottom"
          : "center bottom";
    case "bottom":
      return side === "start"
        ? "left top"
        : side === "end"
          ? "right top"
          : "center top";
    case "left":
      return side === "start"
        ? "right top"
        : side === "end"
          ? "right bottom"
          : "right center";
    case "right":
      return side === "start"
        ? "left top"
        : side === "end"
          ? "left bottom"
          : "left center";
  }
  return "center center";
}

const arrowStyle = computed(() => {
  const { arrowCross, placement } = position.value;
  if (arrowCross === undefined) return {};
  const axis = placement.split("-")[0];
  // `arrowCross` is where the arrow's centre goes; `left`/`top` place its
  // leading edge, hence the half-size shift.
  const cross = `${arrowCross - TOOLTIP_ARROW_SIZE / 2}px`;
  const out = `-${TOOLTIP_ARROW_SIZE / 2}px`;
  switch (axis) {
    case "top": // panel above trigger → arrow on panel bottom
      return { left: cross, bottom: out };
    case "bottom": // panel below trigger → arrow on panel top
      return { left: cross, top: out };
    case "left": // panel left of trigger → arrow on panel right
      return { top: cross, right: out };
    case "right": // panel right of trigger → arrow on panel left
      return { top: cross, left: out };
  }
  return {};
});

function onScrollOrResize() {
  if (isOpen.value) measure();
}

// Anchor mode: reposition as the virtual point moves (e.g. chart hover).
watch(
  () => props.anchor,
  () => { if (isOpen.value) measure(); },
  { deep: true },
);

let resizeObserver: ResizeObserver | null = null;

function dismiss() {
  if (!internalOpen.value) return;
  internalOpen.value = false;
  emit("update:open", false);
  emit("hide");
}

function onOutsideTouch(e: Event) {
  if (!internalOpen.value) return;
  const target = e.target as Node | null;
  if (triggerRef.value?.contains(target)) return;
  if (panelRef.value?.contains(target)) return;
  dismiss();
}

/**
 * A touch drag is the page being scrolled. On a pointer device the tooltip
 * follows the trigger because the cursor stays put and `mouseleave` ends it;
 * on touch there is no cursor and no `mouseleave`, so repositioning on scroll
 * left the tooltip riding the screen indefinitely. Cancel a pending open too:
 * a tap that turns into a drag must not pop a tooltip mid-scroll.
 *
 * Gestures that start on the trigger never reach the document listener — touch
 * events stay targeted at the element the finger landed on — which is why the
 * trigger binds this as well.
 */
function onTouchScroll() {
  clearTimers();
  dismiss();
}

watch(isOpen, (open) => {
  if (open) {
    requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    if (triggerRef.value && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(onScrollOrResize);
      resizeObserver.observe(triggerRef.value);
      if (panelRef.value) resizeObserver.observe(panelRef.value);
    }
    // On touch devices there is no cursor to move away: nothing dismisses the
    // tooltip on its own, whichever trigger opened it. An outside tap ends it,
    // and so does scrolling the page.
    document.addEventListener("touchstart", onOutsideTouch, { passive: true });
    document.addEventListener("touchmove", onTouchScroll, { passive: true });
  } else {
    window.removeEventListener("scroll", onScrollOrResize, true);
    window.removeEventListener("resize", onScrollOrResize);
    resizeObserver?.disconnect();
    resizeObserver = null;
    document.removeEventListener("touchstart", onOutsideTouch);
    document.removeEventListener("touchmove", onTouchScroll);
  }
});

onBeforeUnmount(() => {
  clearTimers();
  window.removeEventListener("scroll", onScrollOrResize, true);
  window.removeEventListener("resize", onScrollOrResize);
  resizeObserver?.disconnect();
  document.removeEventListener("touchstart", onOutsideTouch);
  document.removeEventListener("touchmove", onTouchScroll);
});

/* ---------- Style maps ---------- */

const COLOR_CLASSES: Record<string, string> = {
  default: "bg-foreground text-background",
  inverted: "bg-background text-foreground border border-border",
  primary: "bg-primary text-primary-foreground",
  danger: "bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};
const ARROW_COLOR_CLASSES: Record<string, string> = {
  default: "bg-foreground",
  // No `border` here — borders are applied only on the two outer-facing
  // sides via `arrowBorderClass`, to avoid rendering a full diamond outline.
  inverted: "bg-background",
  primary: "bg-primary",
  danger: "bg-destructive",
  success: "bg-success",
  warning: "bg-warning",
};

const colorClasses = computed(() => {
  if (isInverted.value) return COLOR_CLASSES.inverted;
  return COLOR_CLASSES[resolvedColor.value] ?? COLOR_CLASSES.default;
});
const arrowColorClass = computed(() => {
  if (isInverted.value) return ARROW_COLOR_CLASSES.inverted;
  return (
    ARROW_COLOR_CLASSES[resolvedColor.value] ?? ARROW_COLOR_CLASSES.default
  );
});

// The rotated square exposes only its two outer-facing sides past the panel
// edge. We render borders on just those sides so the arrow tip reads as a
// triangle instead of a diamond. Only applied to the `inverted` variant,
// which is the only one that uses a visible border on the tooltip body.
const arrowBorderClass = computed(() => {
  if (!isInverted.value) return "";
  const axis = position.value.placement.split("-")[0];
  switch (axis) {
    case "top":
      return "border-r border-b border-border";
    case "bottom":
      return "border-t border-l border-border";
    case "left":
      return "border-t border-r border-border";
    case "right":
      return "border-b border-l border-border";
    default:
      return "";
  }
});

const sizeClasses = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "px-2 py-1 text-[11px]";
    case "large":
      return "px-3.5 py-2 text-body";
    default:
      return "px-2.5 py-1.5 text-caption";
  }
});

const radiusClasses = computed(() => {
  switch (resolvedRadius.value) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-sm";
    case "large":
      return "rounded-lg";
    case "full":
      return "rounded-full";
    default:
      return "rounded-md";
  }
});
</script>
