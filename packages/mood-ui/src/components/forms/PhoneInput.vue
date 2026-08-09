<template>
  <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']">
    <!-- Label -->
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

    <!-- Unified field wrapper -->
    <div
      ref="wrapperEl"
      :class="[
        'modo-field-wrapper flex items-center overflow-hidden',
        wrapperVariantClasses,
        wrapperHeightClass,
        radiusClasses,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed' : '',
      ]"
    >
      <!-- Country selector trigger -->
      <button
        ref="triggerRef"
        type="button"
        :disabled="isDisabled || readonly"
        :aria-label="loc.phoneInput.selectCountry"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :class="[
          'flex items-center self-stretch shrink-0 select-none',
          'transition-colors duration-fast ease-standard',
          triggerPaddingClass,
          isDisabled || readonly ? 'cursor-not-allowed' : 'cursor-pointer',
        ]"
        @click="onTriggerClick"
        @keydown="onTriggerKeydown"
      >
        <span
          aria-hidden="true"
          :class="['leading-none shrink-0', flagSizeClass]"
        >
          {{ selectedCountry ? countryFlag(selectedCountry.iso) : "🌐" }}
        </span>
        <span
          :class="[
            'tabular-nums text-muted-foreground font-medium shrink-0',
            triggerTextClass,
          ]"
        >
          +{{ selectedCountry?.dial ?? "?" }}
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          :class="[
            'shrink-0 transition-transform duration-base ease-standard',
            affordanceIconClass,
            chevronSizeClass,
            isOpen ? 'rotate-180' : '',
          ]"
        />
      </button>

      <!-- Vertical divider -->
      <div aria-hidden="true" class="w-px self-stretch bg-border shrink-0" />

      <!-- Phone number input -->
      <input
        :id="fieldId"
        ref="inputRef"
        type="tel"
        inputmode="tel"
        :value="localNumber"
        :placeholder="placeholder ?? ''"
        :disabled="isDisabled"
        :readonly="readonly"
        :required="required"
        :name="name ? `${name}-local` : undefined"
        :autocomplete="autocomplete ?? 'tel-national'"
        :autofocus="autofocus"
        :aria-label="!label ? (ariaLabel ?? undefined) : undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="describedBy"
        :aria-required="required || undefined"
        :class="[
          'modo-field-native flex-1 min-w-0 bg-transparent',
          'text-foreground placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed',
          inputTextClass,
          inputPaddingClass,
        ]"
        @input="onInput"
        @change="onChange"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Loading spinner -->
      <Loader
        v-if="loading"
        :size="resolvedSize === 'large' ? 'medium' : 'small'"
        :class="['shrink-0', affordanceIconClass]"
      />
    </div>

    <!-- Hidden input carrying the full formatted value for form submission -->
    <input v-if="name" type="hidden" :name="name" :value="currentFormValue" />

    <!-- Error / helper text -->
    <div v-if="errorText || helperText" class="flex items-start gap-2">
      <Typography
        v-if="errorText"
        :id="errorId"
        variant="caption"
        size="medium"
        color="danger"
        as="p"
      >
        {{ errorText }}
      </Typography>
      <Typography
        v-else-if="helperText"
        :id="helperId"
        variant="caption"
        size="medium"
        color="muted"
        as="p"
      >
        {{ helperText }}
      </Typography>
    </div>

    <!-- Country dropdown -->
    <PopoverPanel
      :open="isOpen"
      :style="mergedPanelStyle"
      :radius="radius"
      role="listbox"
      :labelledBy="fieldId"
      @update:panelRef="panelRef = $event"
    >
      <div style="max-height: 296px" class="flex flex-col">
        <!-- Search input -->
        <div class="px-3 border-b border-border shrink-0">
          <div class="flex items-center gap-2 h-7">
            <MagnifyingGlassIcon
              class="w-4 h-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref="searchEl"
              v-model="searchQuery"
              type="text"
              autocomplete="off"
              spellcheck="false"
              :placeholder="loc.phoneInput.searchCountry"
              class="modo-field-native flex-1 min-w-0 bg-transparent p-0 text-caption text-foreground placeholder:text-muted-foreground"
              @keydown="onSearchKeydown"
            />
            <Button
              v-if="searchQuery"
              variant="text"
              size="xs"
              radius="full"
              :icon="XMarkIcon"
              :ariaLabel="loc.common.clear"
              tabindex="-1"
              :class="['shrink-0', affordanceActionClass]"
              @click="searchQuery = ''"
            />
          </div>
        </div>

        <!-- Countries list -->
        <ul
          ref="listEl"
          role="listbox"
          class="modo-stagger flex-1 overflow-y-auto w-full"
          style="min-height: 2.5rem"
          tabindex="-1"
        >
          <li
            v-if="filteredCountries.length === 0"
            class="px-3 py-4 text-caption text-muted-foreground text-center"
          >
            {{ loc.phoneInput.noResults }}
          </li>
          <li
            v-for="(c, i) in filteredCountries"
            :key="c.iso"
            :id="optionId(c.iso)"
            role="option"
            :aria-selected="c.iso === activeIso"
            :class="[
              'flex items-center gap-2.5 px-3 py-2 text-body cursor-pointer select-none',
              'transition-colors duration-fast ease-standard',
              ['text-foreground', optionHover],
              i === activeIndex ? optionSurface : '',
              c.iso === activeIso ? 'font-medium' : '',
            ]"
            @pointerenter="activeIndex = i"
            @click="selectCountry(c)"
          >
            <span aria-hidden="true" class="text-base leading-none shrink-0">
              {{ countryFlag(c.iso) }}
            </span>
            <span class="flex-1 min-w-0 truncate text-foreground">{{
              c.name
            }}</span>
            <span
              class="shrink-0 tabular-nums text-muted-foreground text-[11px]"
            >
              +{{ c.dial }}
            </span>
            <CheckIcon
              v-if="c.iso === activeIso"
              :class="['w-4 h-4 shrink-0', checkColorClass]"
              aria-hidden="true"
            />
          </li>
        </ul>
      </div>
    </PopoverPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from "vue";
import type { PhoneInput } from "../../interfaces/forms/PhoneInput.interface";
import {
  PHONE_COUNTRIES,
  countryFlag,
  findCountryByIso,
  type PhoneCountry,
} from "../../data/phoneCountries";
import {
  useFieldState,
  useFieldClasses,
  FIELD_AFFORDANCE_ICON_BY_COLOR,
  FIELD_AFFORDANCE_ACTION_BY_COLOR,
} from "../../composables/useField";
import { usePopover } from "../../composables/usePopover";
import {
  useResolvedSize,
  useSizeTokens,
  useModoLocale,
} from "../../composables/useModoConfig";
import PopoverPanel from "../layout/PopoverPanel.vue";
import Typography from "../data-display/Typography.vue";
import Loader from "../feedback/Loader.vue";
import Button from "./Button.vue";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";

const loc = useModoLocale();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:country": [iso: string];
  change: [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const props = withDefaults(defineProps<PhoneInput>(), {
  defaultCountry: "US",
  format: "national",
  variant: "outline",
  color: "default",
  disabled: false,
  readonly: false,
  required: false,
  loading: false,
  fullWidth: false,
  autofocus: false,
});

const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size);

// ── Refs ──────────────────────────────────────────────────────────────────────
const inputRef = ref<HTMLInputElement | null>(null);
const searchEl = ref<HTMLInputElement | null>(null);
const listEl = ref<HTMLElement | null>(null);
const wrapperEl = ref<HTMLElement | null>(null);
const dropdownWidth = ref("");

// ── Internal state ────────────────────────────────────────────────────────────
const localNumber = ref("");
const internalCountry = ref((props.defaultCountry ?? "US").toUpperCase());

// ── Field state ───────────────────────────────────────────────────────────────
const {
  fieldId,
  radius,
  stateColor,
  hasError,
  isDisabled,
  errorId,
  helperId,
  describedBy,
} = useFieldState(props, {
  componentName: "PhoneInput",
  idPrefix: "modo-phone",
});

const { wrapperVariantClasses, radiusClasses } = useFieldClasses({
  variant: () => props.variant,
  stateColor,
  hasError,
  radius,
  forceFocus: () => isOpen.value,
  halo: () => props.halo,
});

// ── Country resolution ────────────────────────────────────────────────────────
const activeIso = computed(() =>
  (props.country !== undefined
    ? props.country
    : internalCountry.value
  ).toUpperCase(),
);
const selectedCountry = computed(() => findCountryByIso(activeIso.value));

// ── Format helpers ────────────────────────────────────────────────────────────
function buildValue(local: string, dialCode: string): string {
  const fmt = props.format ?? "national";
  if (fmt === "e164") return `+${dialCode}${local.replace(/\D/g, "")}`;
  if (fmt === "international") return `+${dialCode}${local}`;
  return local;
}

function extractNational(v: string | undefined, dialCode: string): string {
  if (!v) return "";
  const prefix = `+${dialCode}`;
  if (v.startsWith(prefix)) return v.slice(prefix.length);
  return v;
}

const currentFormValue = computed(() =>
  selectedCountry.value
    ? buildValue(localNumber.value, selectedCountry.value.dial)
    : localNumber.value,
);

// Sync external modelValue → localNumber
watch(
  () => props.modelValue,
  (v) => {
    const dial = selectedCountry.value?.dial ?? "";
    const national = extractNational(v, dial);
    if (national !== localNumber.value) localNumber.value = national;
  },
  { immediate: true },
);

// ── Popover ───────────────────────────────────────────────────────────────────
const {
  triggerRef,
  panelRef,
  isOpen,
  panelStyle,
  open: openPopover,
  close: closePopover,
  toggle: togglePopover,
} = usePopover({
  placement: "bottom-start",
  onOpen: () => {
    dropdownWidth.value = wrapperEl.value
      ? `${wrapperEl.value.getBoundingClientRect().width}px`
      : "260px";
    searchQuery.value = "";
    activeIndex.value = Math.max(
      0,
      filteredCountries.value.findIndex((c) => c.iso === activeIso.value),
    );
    nextTick(() => {
      searchEl.value?.focus();
      scrollActiveIntoView();
    });
  },
  onClose: () => {
    searchQuery.value = "";
    activeIndex.value = -1;
  },
});

const mergedPanelStyle = computed(() => ({
  ...panelStyle.value,
  ...(dropdownWidth.value ? { width: dropdownWidth.value } : {}),
}));

// ── Search + filtered list ────────────────────────────────────────────────────
const searchQuery = ref("");
const activeIndex = ref(-1);
const autoListboxId = useId();

const optionId = (iso: string) =>
  `modo-phone-listbox-${autoListboxId}-opt-${iso}`;

const filteredCountries = computed<PhoneCountry[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return PHONE_COUNTRIES as unknown as PhoneCountry[];
  return (PHONE_COUNTRIES as unknown as PhoneCountry[]).filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.iso.toLowerCase().includes(q) ||
      c.dial.startsWith(q.replace(/^\+/, "")),
  );
});

watch(filteredCountries, (list) => {
  const idx = list.findIndex((c) => c.iso === activeIso.value);
  activeIndex.value = idx >= 0 ? idx : 0;
});

// ── Option styles ─────────────────────────────────────────────────────────────
const OPTION_SURFACE: Record<string, string> = {
  default: "bg-muted",
  primary: "bg-primary/10",
  danger: "bg-destructive/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
};
const OPTION_HOVER: Record<string, string> = {
  default: "hover:bg-muted",
  primary: "hover:bg-primary/10",
  danger: "hover:bg-destructive/10",
  success: "hover:bg-success/10",
  warning: "hover:bg-warning/10",
};
const optionSurface = computed(
  () => OPTION_SURFACE[stateColor.value] ?? "bg-muted",
);
const optionHover = computed(
  () => OPTION_HOVER[stateColor.value] ?? "hover:bg-muted",
);
const CHECK_COLOR_BY_STATE: Record<string, string> = {
  default: "text-foreground",
  primary: "text-primary",
  danger: "text-destructive",
  success: "text-success",
  warning: "text-warning",
};
const checkColorClass = computed(
  () => CHECK_COLOR_BY_STATE[stateColor.value] ?? "text-foreground",
);
const affordanceIconClass = computed(
  () =>
    FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? "text-muted-foreground",
);
const affordanceActionClass = computed(
  () =>
    FIELD_AFFORDANCE_ACTION_BY_COLOR[stateColor.value] ??
    "text-muted-foreground hover:text-foreground",
);

// ── Size classes ──────────────────────────────────────────────────────────────
const wrapperHeightClass = computed(() => {
  // sz.value.padX is e.g. "px-2.5" — convert to pr-* for the wrapper right edge
  const pr = sz.value.padX.replace("px-", "pr-");
  return `${sz.value.control} ${pr}`;
});

const triggerPaddingClass = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "pl-2.5 pr-1.5 gap-1";
    case "large":
      return "pl-4 pr-2 gap-1.5";
    default:
      return "pl-3 pr-2 gap-1";
  }
});

const flagSizeClass = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "text-sm";
    case "large":
      return "text-xl";
    default:
      return "text-base";
  }
});

const triggerTextClass = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "text-[11px]";
    case "large":
      return "text-body";
    default:
      return "text-caption";
  }
});

const chevronSizeClass = computed(() => {
  switch (resolvedSize.value) {
    case "small":
      return "w-3 h-3";
    case "large":
      return "w-4 h-4";
    default:
      return "w-3.5 h-3.5";
  }
});

const inputTextClass = computed(() => sz.value.text);

const inputPaddingClass = computed(() => {
  // pr-3 leaves a comfortable gap on the right edge as well; the
  // legacy showroom relied on the field-native default padding which
  // we override here. Without pl-3 numbers visually butt up against
  // the country trigger divider.
  return "pl-3 pr-3";
});

// ── Event handlers ────────────────────────────────────────────────────────────
function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  localNumber.value = val;
  emit("update:modelValue", buildValue(val, selectedCountry.value?.dial ?? ""));
}

function onChange(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  emit("change", buildValue(val, selectedCountry.value?.dial ?? ""));
}

function selectCountry(c: PhoneCountry) {
  if (props.country === undefined) internalCountry.value = c.iso;
  emit("update:country", c.iso);
  emit("update:modelValue", buildValue(localNumber.value, c.dial));
  closePopover();
  nextTick(() => inputRef.value?.focus());
}

function onTriggerClick() {
  if (isDisabled.value || props.readonly) return;
  togglePopover();
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (isDisabled.value || props.readonly) return;
  if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (!isOpen.value) openPopover();
  } else if (e.key === "Escape") {
    e.preventDefault();
    closePopover();
  }
}

function onSearchKeydown(e: KeyboardEvent) {
  const list = filteredCountries.value;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, list.length - 1);
    scrollActiveIntoView();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    scrollActiveIntoView();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const c = list[activeIndex.value];
    if (c) selectCountry(c);
  } else if (e.key === "Escape") {
    e.preventDefault();
    closePopover();
    triggerRef.value?.focus?.();
  } else if (e.key === "Tab") {
    // The search field lives inside a panel teleported to <body>, i.e. at the
    // very end of the document. Letting the browser resolve Tab from there
    // walks *past* the whole field — the number input sits earlier in the DOM
    // and is never reached — so focus landed on whatever followed the panel
    // while the panel was unmounting. Drive the destination explicitly:
    // forwards continues into the number input, backwards returns to the flag
    // trigger, which is the order the field reads in.
    e.preventDefault();
    closePopover();
    if (e.shiftKey) triggerRef.value?.focus?.();
    else inputRef.value?.focus();
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    const c = filteredCountries.value[activeIndex.value];
    if (!c || !listEl.value) return;
    const el = document.getElementById(optionId(c.iso));
    el?.scrollIntoView({ block: "nearest" });
  });
}

// ── Expose ────────────────────────────────────────────────────────────────────
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  inputRef,
});
</script>
