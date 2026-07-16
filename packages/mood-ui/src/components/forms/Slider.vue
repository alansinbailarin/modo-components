<template>
  <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']">
    <div
      v-if="label || showValue"
      class="flex items-center justify-between gap-2"
    >
      <label
        v-if="label"
        :for="fieldId"
        class="text-caption font-medium text-foreground"
      >
        {{ label }}
        <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5"
          >*</span
        >
      </label>
      <span
        v-if="showValue"
        class="text-caption tabular-nums text-muted-foreground"
      >
        {{ displayValue }}
      </span>
    </div>

    <div
      ref="trackEl"
      :class="[
        'relative w-full select-none touch-none',
        trackHeightClass,
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @pointerdown="onPointerDown"
    >
      <!-- Track bg -->
      <div
        :class="[
          'absolute inset-x-0 top-1/2 -translate-y-1/2 bg-muted',
          trackRadiusClass,
          trackThicknessClass,
        ]"
      />
      <!-- Filled -->
      <div
        :class="[
          'absolute top-1/2 -translate-y-1/2 transition-colors duration-base ease-standard',
          trackRadiusClass,
          trackThicknessClass,
          fillColorClass,
        ]"
        :style="{ left: '0%', width: `${percent}%` }"
      />

      <!-- Marks -->
      <template v-if="resolvedMarks.length">
        <div
          v-for="mark in resolvedMarks"
          :key="mark.value"
          class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          :style="{ left: `${valueToPercent(mark.value)}%` }"
        >
          <span
            :class="[
              'block rounded-full',
              markSizeClass,
              mark.value <= modelValueSafe
                ? fillColorClass
                : 'bg-muted-foreground',
            ]"
          />
          <span
            v-if="mark.label"
            class="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[11px] text-muted-foreground whitespace-nowrap"
          >
            {{ mark.label }}
          </span>
        </div>
      </template>

      <!-- Thumb -->
      <button
        :id="fieldId"
        ref="thumbEl"
        type="button"
        role="slider"
        :aria-label="ariaLabel ?? label ?? loc.slider.aria"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="modelValueSafe"
        :aria-valuetext="displayValue"
        :aria-disabled="isDisabled || undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="describedBy"
        :disabled="isDisabled"
        :class="[
          'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background border-2',
          'transition-[transform,box-shadow,--tw-ring-color] duration-fast ease-standard',
          thumbSizeClass,
          thumbBorderColorClass,
          thumbHaloClass,
          'shadow-sm hover:scale-110 focus:outline-none',
          isDisabled
            ? 'cursor-not-allowed'
            : 'cursor-grab active:cursor-grabbing',
        ]"
        :style="{ left: `${percent}%` }"
        @keydown="onThumbKeydown"
      />
    </div>

    <input v-if="name" type="hidden" :name="name" :value="modelValueSafe" />

    <div v-if="errorText || helperText" class="flex items-start gap-2">
      <Typography
        v-if="errorText"
        :id="errorId"
        variant="caption"
        size="medium"
        color="danger"
        as="p"
        >{{ errorText }}</Typography
      >
      <Typography
        v-else-if="helperText"
        :id="helperId"
        variant="caption"
        size="medium"
        color="muted"
        as="p"
        >{{ helperText }}</Typography
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Slider } from "../../interfaces/forms/Slider.interface";
import { useFieldState } from "../../composables/useField";
import {
  useModoLocale,
  useResolvedRadius,
  useResolvedSize,
  useSizeTokens,
} from "../../composables/useModoConfig";

const loc = useModoLocale();
import Typography from "../data-display/Typography.vue";

const props = withDefaults(defineProps<Slider>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  showValue: false,
  marks: false,
  orientation: "horizontal",
  color: "default",
  disabled: false,
  readonly: false,
  required: false,
  fullWidth: true,
});

const sz = useSizeTokens(() => props.size);
const resolvedSize = useResolvedSize(() => props.size);
// Slider track defaults to a pill (full). Thumb is always round regardless
// of this prop — a non-circular thumb is no longer recognisable.
const resolvedRadius = useResolvedRadius(() => props.radius ?? "full");
const trackRadiusClass = computed(() => {
  switch (resolvedRadius.value) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-sm";
    case "medium":
      return "rounded-md";
    case "large":
      return "rounded-lg";
    case "full":
    default:
      return "rounded-full";
  }
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
  change: [value: number];
}>();

const {
  fieldId,
  hasError,
  isDisabled,
  errorId,
  helperId,
  describedBy,
  stateColor,
} = useFieldState(props, { componentName: "Slider", idPrefix: "modo-slider" });

const trackEl = ref<HTMLElement | null>(null);
const thumbEl = ref<HTMLButtonElement | null>(null);

const modelValueSafe = computed(() => {
  const v = props.modelValue ?? props.min;
  return Math.min(Math.max(v, props.min), props.max);
});

const percent = computed(() => valueToPercent(modelValueSafe.value));

function valueToPercent(v: number) {
  if (props.max === props.min) return 0;
  return ((v - props.min) / (props.max - props.min)) * 100;
}

function percentToValue(pct: number) {
  const raw = props.min + (pct / 100) * (props.max - props.min);
  return clampToStep(raw);
}

function clampToStep(v: number) {
  const steps = Math.round((v - props.min) / props.step);
  const snapped = props.min + steps * props.step;
  const clamped = Math.min(Math.max(snapped, props.min), props.max);
  // Fix floating precision
  const precision = String(props.step).includes(".")
    ? String(props.step).split(".")[1].length
    : 0;
  return Number(clamped.toFixed(precision));
}

function setValue(v: number) {
  if (props.readonly || isDisabled.value) return;
  const next = clampToStep(v);
  if (next === modelValueSafe.value) return;
  emit("update:modelValue", next);
  emit("change", next);
}

/* ---------- Pointer drag ---------- */

let activePointer: number | null = null;

function onPointerDown(e: PointerEvent) {
  if (isDisabled.value || props.readonly) return;
  if (!trackEl.value) return;
  activePointer = e.pointerId;
  thumbEl.value?.focus();
  updateFromEvent(e);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}
function onPointerMove(e: PointerEvent) {
  if (activePointer === null || e.pointerId !== activePointer) return;
  updateFromEvent(e);
}
function onPointerUp(e: PointerEvent) {
  if (activePointer === null || e.pointerId !== activePointer) return;
  activePointer = null;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
}

function updateFromEvent(e: PointerEvent) {
  if (!trackEl.value) return;
  const rect = trackEl.value.getBoundingClientRect();
  const pct = Math.min(
    Math.max(((e.clientX - rect.left) / rect.width) * 100, 0),
    100,
  );
  setValue(percentToValue(pct));
}

/* ---------- Keyboard ---------- */

function onThumbKeydown(e: KeyboardEvent) {
  if (isDisabled.value || props.readonly) return;
  const bigStep = props.step * 10;
  switch (e.key) {
    case "ArrowRight":
    case "ArrowUp":
      e.preventDefault();
      setValue(modelValueSafe.value + (e.shiftKey ? bigStep : props.step));
      break;
    case "ArrowLeft":
    case "ArrowDown":
      e.preventDefault();
      setValue(modelValueSafe.value - (e.shiftKey ? bigStep : props.step));
      break;
    case "PageUp":
      e.preventDefault();
      setValue(modelValueSafe.value + bigStep);
      break;
    case "PageDown":
      e.preventDefault();
      setValue(modelValueSafe.value - bigStep);
      break;
    case "Home":
      e.preventDefault();
      setValue(props.min);
      break;
    case "End":
      e.preventDefault();
      setValue(props.max);
      break;
  }
}

/* ---------- Marks ---------- */

const resolvedMarks = computed<{ value: number; label?: string }[]>(() => {
  if (!props.marks) return [];
  if (props.marks === true) {
    const out: { value: number }[] = [];
    for (let v = props.min; v <= props.max; v += props.step)
      out.push({ value: v });
    return out;
  }
  if (Array.isArray(props.marks)) {
    return props.marks.map((m) => (typeof m === "number" ? { value: m } : m));
  }
  return [];
});

/* ---------- Display ---------- */

const displayValue = computed(() => {
  if (props.formatValue) return props.formatValue(modelValueSafe.value);
  return String(modelValueSafe.value);
});

/* ---------- Style maps ---------- */

const trackHeightClass = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "h-5";
    case "large":
      return "h-8";
    default:
      return "h-6";
  }
});

const trackThicknessClass = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "h-1";
    case "large":
      return "h-2";
    default:
      return "h-1.5";
  }
});

const thumbSizeClass = computed(() => {
  switch (sz.value.box) {
    case 'h-4 w-4':           return 'w-4 h-4';        // xsmall
    case 'h-[18px] w-[18px]': return 'w-[18px] h-[18px]'; // small
    case 'h-6 w-6':           return 'w-6 h-6';        // large
    case 'h-5 w-5':                                      // medium (default)
    default:                   return 'w-5 h-5';
  }
});

const markSizeClass = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "w-1 h-1";
    case "large":
      return "w-2 h-2";
    default:
      return "w-1.5 h-1.5";
  }
});

const FILL_BY_COLOR: Record<string, string> = {
  default: "bg-foreground",
  primary: "bg-primary",
  danger: "bg-destructive",
  success: "bg-success",
  warning: "bg-warning",
};
const BORDER_BY_COLOR: Record<string, string> = {
  default: "border-foreground",
  primary: "border-primary",
  danger: "border-destructive",
  success: "border-success",
  warning: "border-warning",
};
const fillColorClass = computed(
  () =>
    FILL_BY_COLOR[hasError.value ? "danger" : stateColor.value] ??
    "bg-foreground",
);
const thumbBorderColorClass = computed(
  () =>
    BORDER_BY_COLOR[hasError.value ? "danger" : stateColor.value] ??
    "border-foreground",
);

// Halo persistente tintado según color. Tenue en idle,
// intensifica en hover/focus-visible. Sigue la misma filosofía que Button/ButtonGroup.
const THUMB_HALO_BY_COLOR: Record<string, string> = {
  // Idle/hover halo stays tinted per color; focus uses the unified ring.
  default:
    "ring-[3px] ring-foreground/10 hover:ring-foreground/20 focus-visible:ring-ring/60",
  primary:
    "ring-[3px] ring-primary/15 hover:ring-primary/25 focus-visible:ring-ring/60",
  danger:
    "ring-[3px] ring-destructive/15 hover:ring-destructive/25 focus-visible:ring-ring/60",
  success:
    "ring-[3px] ring-success/15 hover:ring-success/25 focus-visible:ring-ring/60",
  warning:
    "ring-[3px] ring-warning/15 hover:ring-warning/25 focus-visible:ring-ring/60",
};
const thumbHaloClass = computed(
  () =>
    THUMB_HALO_BY_COLOR[hasError.value ? "danger" : stateColor.value] ??
    THUMB_HALO_BY_COLOR.default,
);
</script>
