<template>
  <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']">
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

    <div
      ref="wrapperEl"
      :class="[
        'modo-field-wrapper flex items-center gap-2',
        wrapperVariantClasses,
        wrapperSizeClasses,
        radiusClasses,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed' : '',
      ]"
      role="combobox"
      :aria-haspopup="'listbox'"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-owns="listboxId"
    >
      <component
        :is="iconLeft"
        v-if="iconLeft"
        aria-hidden="true"
        :class="['shrink-0', affordanceIconClass, iconSizeClasses]"
      />

      <input
        :id="fieldId"
        ref="inputEl"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :autofocus="autofocus"
        :maxlength="maxLength"
        :aria-label="!label ? ariaLabel : undefined"
        :aria-invalid="hasError || undefined"
        :aria-describedby="describedBy"
        :aria-required="required || undefined"
        :aria-autocomplete="'list'"
        :aria-controls="listboxId"
        :aria-expanded="isOpen"
        :aria-activedescendant="isOpen && activeId ? activeId : undefined"
        :class="[
          'modo-field-native flex-1 min-w-0 bg-transparent p-0',
          'text-foreground placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed',
          inputTextClasses,
        ]"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <Loader
        v-if="loading || isLoadingAsync"
        :size="size === 'large' ? 'medium' : 'small'"
        :class="['shrink-0', affordanceIconClass]"
      />

      <Button
        v-else-if="clearable && hasValue && !isDisabled && !readonly"
        variant="text"
        size="xs"
        radius="full"
        :icon="XMarkIcon"
        :ariaLabel="loc.combobox.clear"
        tabindex="-1"
        :class="['shrink-0', affordanceActionClass]"
        @click="clear"
      />

      <Button
        variant="text"
        size="xs"
        radius="full"
        :icon="ChevronDownIcon"
        :ariaLabel="loc.combobox.toggleOptions"
        tabindex="-1"
        :class="[
          'shrink-0',
          affordanceActionClass,
          'transition-transform duration-base ease-standard',
          isOpen ? 'rotate-180' : '',
        ]"
        @mousedown.prevent
        @click="onToggleClick"
      />
    </div>

    <PopoverPanel
      :open="isOpen"
      :style="panelStyle"
      :radius="radius"
      role="listbox"
      :labelledBy="label ? fieldId : undefined"
      @update:panelRef="panelRef = $event"
    >
      <div class="flex flex-col max-h-72">
        <ul
          :id="listboxId"
          role="listbox"
          class="modo-stagger flex-1 overflow-y-auto"
          tabindex="-1"
        >
          <li
            v-if="isLoadingAsync && displayedOptions.length === 0"
            class="px-3 py-4 text-caption text-muted-foreground text-center"
          >
            {{ loadingText }}
          </li>
          <li
            v-else-if="displayedOptions.length === 0"
            class="px-3 py-4 text-caption text-muted-foreground text-center"
          >
            {{ emptyText }}
          </li>

          <template
            v-for="(group, gi) in groupedOptions"
            :key="group.name ?? gi"
          >
            <li
              v-if="group.name"
              class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              role="presentation"
            >
              {{ group.name }}
            </li>
            <!--
              `mousedown.prevent` keeps focus in the input while an option is
              picked. There is deliberately no `touchstart.prevent` alongside
              it: cancelling touchstart tells the browser to suppress the
              compatibility mouse events *and* the click for that tap, so on a
              touch device the option became impossible to select at all.
            -->
            <li
              v-for="opt in group.items"
              :id="optionDomId(String(opt.value))"
              :key="String(opt.value)"
              role="option"
              :aria-selected="matchedOption?.value === opt.value"
              :aria-disabled="opt.disabled || undefined"
              :class="[
                'flex items-center gap-2 px-3 py-2 text-body cursor-pointer select-none',
                'transition-colors duration-fast ease-standard',
                opt.disabled
                  ? 'text-muted-foreground/60 cursor-not-allowed'
                  : ['text-foreground', optionHover],
                activeValue === opt.value && !opt.disabled ? optionSurface : '',
                matchedOption?.value === opt.value ? 'font-medium' : '',
              ]"
              @pointerenter="setActive(opt.value)"
              @mousedown.prevent
              @click="selectOption(opt)"
            >
              <component
                :is="opt.icon"
                v-if="opt.icon"
                aria-hidden="true"
                :class="['w-4 h-4 shrink-0', affordanceIconClass]"
              />
              <div class="flex-1 min-w-0">
                <div class="truncate">
                  <Highlight :text="opt.label" :query="modelValue ?? ''" />
                </div>
                <div
                  v-if="opt.description"
                  class="text-caption text-muted-foreground truncate"
                >
                  {{ opt.description }}
                </div>
              </div>
              <CheckIcon
                v-if="matchedOption?.value === opt.value"
                :class="['w-4 h-4 shrink-0', checkColorClass]"
                aria-hidden="true"
              />
            </li>
          </template>
        </ul>
        <slot name="footer" />
      </div>
    </PopoverPanel>

    <div
      v-if="errorText || helperText || showCounterEffective"
      class="flex items-start gap-2"
    >
      <Typography
        v-if="errorText"
        :id="errorId"
        variant="caption"
        size="medium"
        color="danger"
        as="p"
        class="flex-1"
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
        class="flex-1"
      >
        {{ helperText }}
      </Typography>
      <p
        v-if="showCounterEffective"
        :id="counterId"
        :class="[
          'text-caption ml-auto tabular-nums',
          counterOverflow ? 'text-destructive' : 'text-muted-foreground',
        ]"
      >
        {{ currentLength }}/{{ maxLength }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, ref, useId, watch } from "vue";
import type {
  Combobox as ComboboxProps,
  SelectOption,
} from "../../interfaces/forms/Combobox.interface";
import {
  useFieldState,
  useFieldClasses,
  FIELD_AFFORDANCE_ACTION_BY_COLOR,
  FIELD_AFFORDANCE_ICON_BY_COLOR,
} from "../../composables/useField";
import { usePopover } from "../../composables/usePopover";
import PopoverPanel from "../layout/PopoverPanel.vue";
import Typography from "../data-display/Typography.vue";
import Loader from "../feedback/Loader.vue";
import {
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
import Button from "./Button.vue";
import {
  useModoLocale,
  useSizeTokens,
} from "../../composables/useModoConfig";

const loc = useModoLocale();

const props = withDefaults(defineProps<ComboboxProps>(), {
  modelValue: "",
  options: () => [],
  debounce: 250,
  minChars: 0,
  freeSolo: false,
  variant: "outline",
  color: "default",
  disabled: false,
  readonly: false,
  required: false,
  loading: false,
  fullWidth: false,
  clearable: false,
  placeholder: "Type to search…",
  emptyText: "No results.",
  loadingText: "Loading…",
  autofocus: false,
});

const sz = useSizeTokens(() => props.size);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string, option: SelectOption | null];
  select: [option: SelectOption];
  open: [];
  close: [];
  clear: [];
  search: [query: string];
}>();

const {
  fieldId,
  radius,
  stateColor,
  hasError,
  hasValue,
  isDisabled,
  currentLength,
  showCounterEffective,
  counterOverflow,
  errorId,
  helperId,
  counterId,
  describedBy,
} = useFieldState(props, {
  componentName: "Combobox",
  idPrefix: "modo-combobox",
});

const { wrapperVariantClasses, radiusClasses } = useFieldClasses({
  variant: () => props.variant,
  stateColor,
  hasError,
  radius,
  forceFocus: () => isOpen.value,
  halo: () => props.halo,
});

/* ---------- IDs ---------- */
const autoListboxId = useId();
const listboxId = computed(() => `modo-combobox-listbox-${autoListboxId}`);
const optionDomId = (v: string) => `${listboxId.value}-opt-${v}`;

/* ---------- Options source (sync or async) ---------- */

const asyncOptions = ref<SelectOption[]>([]);
const isLoadingAsync = ref(false);
let loadTimer: number | null = null;
let loadRequestId = 0;

watch(
  () => props.modelValue,
  (q) => {
    if (!props.loadOptions) return;
    if (!isOpen.value) return;
    if ((q ?? "").length < props.minChars) {
      asyncOptions.value = [];
      return;
    }
    if (loadTimer !== null) clearTimeout(loadTimer);
    isLoadingAsync.value = true;
    const reqId = ++loadRequestId;
    loadTimer = window.setTimeout(async () => {
      try {
        const result = await props.loadOptions!(q ?? "");
        if (reqId === loadRequestId) asyncOptions.value = result;
      } finally {
        if (reqId === loadRequestId) isLoadingAsync.value = false;
      }
      emit("search", q ?? "");
    }, props.debounce);
  },
);

const sourceOptions = computed(() =>
  props.loadOptions ? asyncOptions.value : props.options,
);

const displayedOptions = computed(() => {
  const q = (props.modelValue ?? "").trim().toLowerCase();
  // Si hay loadOptions, no filtramos localmente (confiamos en el backend).
  if (props.loadOptions) return sourceOptions.value;
  if (!q) return sourceOptions.value;
  return sourceOptions.value.filter(
    (o) =>
      o.label.toLowerCase().includes(q) ||
      (o.description ? o.description.toLowerCase().includes(q) : false),
  );
});

interface OptionGroup {
  name?: string;
  items: SelectOption[];
}

const groupedOptions = computed<OptionGroup[]>(() => {
  const list = displayedOptions.value;
  if (!list.some((o) => o.group)) {
    return list.length ? [{ items: list }] : [];
  }
  const map = new Map<string | undefined, SelectOption[]>();
  for (const opt of list) {
    const key = opt.group;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(opt);
  }
  const groups: OptionGroup[] = [];
  for (const [name, items] of map) groups.push({ name, items });
  return groups;
});

const flatOptions = computed<SelectOption[]>(() =>
  groupedOptions.value.flatMap((g) => g.items),
);

/** Si el texto actual coincide exactamente (case-insensitive) con alguna opción, la devuelve. */
const matchedOption = computed<SelectOption | null>(() => {
  const v = (props.modelValue ?? "").trim().toLowerCase();
  if (!v) return null;
  return sourceOptions.value.find((o) => o.label.toLowerCase() === v) ?? null;
});

/* ---------- Color ---------- */
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

/* ---------- Popover ---------- */

const inputEl = ref<HTMLInputElement | null>(null);
const wrapperEl = ref<HTMLElement | null>(null);
const activeValue = ref<string | number | null>(null);
const activeId = computed(() =>
  activeValue.value !== null ? optionDomId(String(activeValue.value)) : "",
);

const {
  triggerRef,
  panelRef,
  isOpen,
  panelStyle,
  open: openPopover,
  close: closePopover,
} = usePopover({
  placement: "bottom-start",
  matchTriggerWidth: true,
  // Reposition on scroll instead of closing. Focus is what opens this panel,
  // and focusing a text field is itself a scroll trigger: on mobile the virtual
  // keyboard appears and the browser scrolls the field into view a few frames
  // after the panel opened, which closed the dropdown before the user could
  // ever see it. Typing reopened it — by then the keyboard was already up and
  // no further scroll followed — which is why the list only appeared after the
  // first keystroke. Same reasoning as SearchInput.
  closeOnScroll: false,
  onOpen: () => {
    emit("open");
    const initial =
      matchedOption.value ?? flatOptions.value.find((o) => !o.disabled);
    activeValue.value = initial ? initial.value : null;
    nextTick(scrollActiveIntoView);
  },
  onClose: () => {
    emit("close");
  },
});

watch(wrapperEl, (el) => (triggerRef.value = el));

function setActive(v: string | number) {
  activeValue.value = v;
}

function scrollActiveIntoView() {
  if (activeValue.value === null) return;
  const el = document.getElementById(optionDomId(String(activeValue.value)));
  el?.scrollIntoView({ block: "nearest" });
}

/* ---------- Actions ---------- */

function onInput(e: Event) {
  const next = (e.target as HTMLInputElement).value;
  emit("update:modelValue", next);
  if (!isOpen.value) openPopover();
  // Activar la primera opción tras filtrar
  nextTick(() => {
    const first = flatOptions.value.find((o) => !o.disabled);
    activeValue.value = first ? first.value : null;
  });
}

function onFocus() {
  if (isDisabled.value || props.readonly) return;
  if (!isOpen.value) openPopover();
}

function onBlur() {
  // Delay para permitir el click en la opción (mousedown.prevent también ayuda).
  setTimeout(() => {
    // Si no es freeSolo y no hay match, resetea al último match válido (o vacío)
    if (!props.freeSolo) {
      const current = (props.modelValue ?? "").trim();
      if (current && !matchedOption.value) {
        // Revertir al label de la opción previa si había una
        emit("update:modelValue", lastCommittedValue.value);
      }
    }
    closePopover();
  }, 120);
}

function onToggleClick() {
  if (isDisabled.value || props.readonly) return;
  if (isOpen.value) {
    closePopover();
    inputEl.value?.blur();
  } else {
    inputEl.value?.focus();
  }
}

const lastCommittedValue = ref<string>(props.modelValue ?? "");

function commit(value: string, opt: SelectOption | null) {
  lastCommittedValue.value = value;
  emit("update:modelValue", value);
  emit("change", value, opt);
}

function selectOption(opt: SelectOption) {
  if (opt.disabled) return;
  commit(opt.label, opt);
  emit("select", opt);
  closePopover();
  inputEl.value?.blur();
}

function clear() {
  commit("", null);
  emit("clear");
  inputEl.value?.focus();
}

/* ---------- Keyboard ---------- */

function moveActive(direction: 1 | -1) {
  const list = flatOptions.value.filter((o) => !o.disabled);
  if (list.length === 0) return;
  const currentIdx = list.findIndex((o) => o.value === activeValue.value);
  let nextIdx: number;
  if (currentIdx === -1) {
    nextIdx = direction > 0 ? 0 : list.length - 1;
  } else {
    nextIdx = (currentIdx + direction + list.length) % list.length;
  }
  activeValue.value = list[nextIdx].value;
  scrollActiveIntoView();
}

function onKeydown(e: KeyboardEvent) {
  if (isDisabled.value || props.readonly) return;
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      if (!isOpen.value) openPopover();
      moveActive(1);
      break;
    case "ArrowUp":
      e.preventDefault();
      if (!isOpen.value) openPopover();
      moveActive(-1);
      break;
    case "Enter": {
      if (!isOpen.value) return;
      const opt = flatOptions.value.find((o) => o.value === activeValue.value);
      if (opt && !opt.disabled) {
        e.preventDefault();
        selectOption(opt);
      } else if (props.freeSolo) {
        e.preventDefault();
        commit(props.modelValue ?? "", null);
        // Keep panel open so the user sees the new value added to the list.
        // closePopover();
      }
      break;
    }
    case "Escape":
      if (isOpen.value) {
        e.preventDefault();
        closePopover();
      }
      break;
    case "Tab":
      // Dejar que Tab cierre naturalmente vía blur.
      break;
  }
}

/* ---------- Size maps ---------- */

const wrapperSizeClasses = computed(() => `${sz.value.control} ${sz.value.padX}`);
const inputTextClasses = computed(() => sz.value.text);
const iconSizeClasses = computed(() => sz.value.icon);

/* ---------- Inline highlight helper ---------- */
const Highlight = defineComponent({
  name: "ComboboxHighlight",
  props: {
    text: { type: String, required: true },
    query: { type: String, required: true },
  },
  setup(p) {
    return () => {
      const q = (p.query ?? "").trim();
      if (!q) return h("span", p.text);
      const idx = p.text.toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return h("span", p.text);
      const before = p.text.slice(0, idx);
      const match = p.text.slice(idx, idx + q.length);
      const after = p.text.slice(idx + q.length);
      return h("span", [
        before,
        h(
          "span",
          {
            class:
              "font-semibold text-foreground bg-primary/10 rounded-sm px-0.5",
          },
          match,
        ),
        after,
      ]);
    };
  },
});

/* ---------- Sync committed value when controlling v-model externally ---------- */
watch(
  () => props.modelValue,
  (v) => {
    if (matchedOption.value) lastCommittedValue.value = v ?? "";
  },
);
</script>
