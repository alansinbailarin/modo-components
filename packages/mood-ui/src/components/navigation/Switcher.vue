<template>
  <div class="modo-switcher inline-flex" :class="{ 'w-full': fullWidth }">
    <span ref="triggerWrapEl" class="inline-flex" :class="{ 'w-full': fullWidth }">
    <slot
      name="trigger"
      :activeItem="activeItem"
      :isOpen="isOpen"
      :toggle="onTriggerClick"
    >
    <button
      ref="triggerEl"
      type="button"
      data-modo-switcher-trigger
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-label="resolvedAriaLabel"
      :disabled="disabled"
      :class="[
        'inline-flex items-center gap-3 px-3 py-2 text-left transition-colors',
        'border bg-card text-card-foreground border-border',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        radiusClass,
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <span v-if="activeItem?.avatar" class="shrink-0">
        <Avatar
          :src="activeItem.avatar.src"
          :initials="activeItem.avatar.initials"
          :name="activeItem.title"
          size="small"
        />
      </span>
      <span
        v-else-if="activeItem?.icon"
        :class="[
          'shrink-0 inline-flex items-center justify-center w-9 h-9 bg-accent/60 text-foreground',
          radiusClass,
        ]"
      >
        <component :is="activeItem.icon" class="w-5 h-5" aria-hidden="true" />
      </span>
      <span class="flex flex-col min-w-0 flex-1">
        <span class="truncate text-body font-medium">
          {{ activeItem ? activeItem.title : resolvedPlaceholder }}
        </span>
        <span
          v-if="!compactTrigger && activeItem?.subtitle"
          class="truncate text-caption text-muted-foreground"
        >
          {{ activeItem.subtitle }}
        </span>
      </span>
      <ChevronUpDownIcon
        v-if="chevron === 'updown'"
        class="w-4 h-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <ChevronDownIcon
        v-else-if="chevron === 'down'"
        class="w-4 h-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
    </slot>
    </span>

    <PopoverPanel
      :open="isOpen"
      :style="mergedPanelStyle"
      :radius="resolvedRadius"
      role="dialog"
      :aria-label="resolvedAriaLabel"
      @update:panelRef="panelRef = $event"
    >
      <div
        data-modo-switcher-panel
        class="modo-switcher-panel overflow-y-auto"
        :style="{ maxHeight: panelMaxHeightStyle }"
      >
        <div
          v-if="panelTitle"
          class="px-3 pt-3 pb-2 text-caption text-muted-foreground uppercase tracking-wider"
        >
          {{ panelTitle }}
        </div>

        <div v-if="searchable" class="px-2 pt-2 pb-1">
          <input
            ref="searchInputEl"
            v-model="searchQuery"
            role="searchbox"
            type="text"
            :placeholder="resolvedSearchPlaceholder"
            :aria-controls="listboxId"
            :aria-activedescendant="activeDescendantId"
            class="w-full px-2 py-1.5 text-body bg-background border border-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            @keydown="onSearchKeydown"
          />
        </div>

        <template v-if="loading">
          <slot name="loading">
            <div class="p-2 flex flex-col gap-1">
              <div
                v-for="i in 3"
                :key="i"
                data-modo-switcher-skeleton
              >
                <Skeleton height="44px" />
              </div>
            </div>
          </slot>
        </template>

        <template v-else-if="items.length === 0">
          <slot name="empty">
            <div class="px-3 py-6 text-center text-muted-foreground text-body">
              {{ resolvedEmptyText }}
            </div>
          </slot>
        </template>

        <template v-else-if="displayedItems.length === 0">
          <div class="px-3 py-6 text-center text-muted-foreground text-body">
            {{ resolvedNoResults }}
          </div>
        </template>

        <ul
          v-else
          role="listbox"
          :id="listboxId"
          class="flex flex-col"
          @keydown="onListKeydown"
        >
          <li
            v-for="(item, idx) in displayedItems"
            :key="item.value"
            :ref="(el) => setOptionRef(el as HTMLElement | null, idx)"
            role="option"
            :id="`${listboxId}-opt-${idx}`"
            :aria-selected="item.value === modelValue"
            :aria-current="item.value === modelValue ? 'true' : undefined"
            :aria-disabled="item.disabled || undefined"
            :data-active="item.value === modelValue || undefined"
            :tabindex="-1"
            class="modo-switcher-item flex items-center gap-3 px-3 py-2 cursor-pointer"
            :class="[
              item.value === modelValue ? 'bg-accent/40' : '',
              searchable && idx === highlightedIdx ? 'bg-accent' : 'hover:bg-accent',
              item.disabled ? 'opacity-50 cursor-not-allowed' : '',
            ]"
            @click="selectItem(item)"
            @mouseenter="searchable ? (highlightedIdx = idx) : null"
          >
            <span v-if="item.avatar" class="shrink-0">
              <Avatar
                :src="item.avatar.src"
                :initials="item.avatar.initials"
                :name="item.title"
                size="small"
              />
            </span>
            <span
              v-else-if="item.icon"
              data-modo-switcher-iconwrap
              :class="[
                'shrink-0 inline-flex items-center justify-center w-9 h-9 bg-accent/60 text-foreground',
                radiusClass,
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
            </span>
            <span class="flex flex-col min-w-0 flex-1">
              <span class="truncate text-body font-medium">{{ item.title }}</span>
              <span
                v-if="item.subtitle"
                class="truncate text-caption text-muted-foreground"
              >{{ item.subtitle }}</span>
            </span>
            <slot
              name="item-trailing"
              :item="item"
              :active="item.value === modelValue"
              :close="close"
            >
              <CheckIcon
                v-if="item.value === modelValue"
                class="w-4 h-4 shrink-0"
                aria-hidden="true"
              />
            </slot>
          </li>
        </ul>

        <template v-if="$slots.footer">
          <hr
            data-modo-switcher-footer-sep
            role="separator"
            class="my-1 border-t border-border"
          />
          <div class="p-1">
            <slot name="footer" :close="close" />
          </div>
        </template>
      </div>
    </PopoverPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch, watchEffect } from "vue";
import { ChevronUpDownIcon, ChevronDownIcon, CheckIcon } from "@heroicons/vue/24/outline";
import PopoverPanel from "../layout/PopoverPanel.vue";
import Avatar from "../data-display/avatar/Avatar.vue";
import Skeleton from "../feedback/Skeleton.vue";
import { usePopover } from "../../composables/usePopover";
import {
  useResolvedRadius,
  useModoLocale,
} from "../../composables/useModoConfig";
import type {
  Switcher as SwitcherProps,
  SwitcherEmits,
  SwitcherItem,
  SwitcherValue,
} from "../../interfaces/navigation/Switcher.interface";

const props = withDefaults(defineProps<SwitcherProps>(), {
  modelValue: null,
  chevron: "updown",
  triggerVariant: "outline",
  compactTrigger: false,
  fullWidth: false,
  panelWidth: "trigger",
  panelMinWidth: "15rem",
  panelMaxHeight: 320,
  placement: "bottom-start",
  searchable: false,
  loading: false,
  disabled: false,
});

const emit = defineEmits<SwitcherEmits>();

const locale = useModoLocale();
const resolvedRadius = useResolvedRadius(() => props.radius);
const listboxId = useId();

const resolvedPlaceholder = computed(
  () => props.placeholder ?? locale.value.switcher.placeholder,
);
const resolvedAriaLabel = computed(
  () => props.ariaLabel ?? locale.value.switcher.ariaLabel,
);
const resolvedEmptyText = computed(
  () => props.emptyText ?? locale.value.switcher.empty,
);
const resolvedSearchPlaceholder = computed(
  () => props.searchPlaceholder ?? locale.value.switcher.searchPlaceholder,
);
const resolvedNoResults = computed(
  () => props.noResultsText ?? locale.value.switcher.noResults,
);

const searchQuery = ref("");
const searchInputEl = ref<HTMLInputElement | null>(null);

const displayedItems = computed<SwitcherItem[]>(() => {
  if (!props.searchable) return props.items;
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.items;
  const fields = props.searchFields ?? ["title", "subtitle"];
  return props.items.filter((it) =>
    fields.some((f) => {
      const v = it[f];
      return typeof v === "string" && v.toLowerCase().includes(q);
    }),
  );
});

watch(searchQuery, (q) => {
  emit("search", q);
});

const radiusClass = computed(() => {
  switch (resolvedRadius.value) {
    case "none": return "rounded-none";
    case "small": return "rounded-sm";
    case "large": return "rounded-lg";
    case "full": return "rounded-[999px]";
    default: return "rounded-md";
  }
});

const panelMaxHeightStyle = computed(() => {
  const v = props.panelMaxHeight;
  return typeof v === "number" ? `${v}px` : v;
});

const panelMinWidthStyle = computed(() => {
  const v = props.panelMinWidth;
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
});

// The popover composable sizes the panel to the trigger width when
// `panelWidth='trigger'`. A narrow trigger (e.g. an avatar-only custom
// trigger) would otherwise crush the panel — `minWidth` floors it.
const mergedPanelStyle = computed(() => ({
  ...panelStyle.value,
  ...(panelMinWidthStyle.value ? { minWidth: panelMinWidthStyle.value } : {}),
}));

const activeItem = computed<SwitcherItem | null>(() => {
  if (props.modelValue == null) return null;
  return props.items.find((i) => i.value === props.modelValue) ?? null;
});

const {
  triggerRef,
  panelRef,
  isOpen,
  panelStyle,
  open,
  close,
  toggle,
} = usePopover({
  placement: () => props.placement,
  matchTriggerWidth: () => props.panelWidth === "trigger",
  closeOnEscape: false,
  onOpen: () => emit("open"),
  onClose: () => {
    searchQuery.value = "";
    emit("close");
  },
});

const triggerEl = ref<HTMLElement | null>(null);
const triggerWrapEl = ref<HTMLElement | null>(null);
watch([triggerEl, triggerWrapEl], ([btn, wrap]) => {
  triggerRef.value = (btn as HTMLElement | null) ?? (wrap as HTMLElement | null);
});

function focusTrigger() {
  const el = triggerEl.value ?? triggerWrapEl.value;
  el?.focus?.();
}

function onTriggerClick() {
  if (props.disabled) return;
  toggle();
}

function selectItem(item: SwitcherItem) {
  if (item.disabled || props.disabled) return;
  emit("update:modelValue", item.value);
  emit("change", item.value, item);
  close();
}

function focusableIndices(): number[] {
  return displayedItems.value
    .map((it, i) => (it.disabled ? -1 : i))
    .filter((i) => i !== -1);
}

const optionRefs = new Map<number, HTMLElement>();
function setOptionRef(el: HTMLElement | null, idx: number) {
  if (el) optionRefs.set(idx, el);
  else optionRefs.delete(idx);
}

function focusOptionByIdx(idx: number) {
  optionRefs.get(idx)?.focus();
}

async function openAndFocusActive() {
  if (props.disabled) return;
  if (!isOpen.value) open();
  await nextTick();
  if (props.searchable) {
    searchInputEl.value?.focus();
    return;
  }
  const order = focusableIndices();
  if (!order.length) return;
  const activeIdx = displayedItems.value.findIndex(
    (it) => it.value === props.modelValue,
  );
  const usable =
    activeIdx >= 0 && !displayedItems.value[activeIdx].disabled
      ? activeIdx
      : order[0];
  focusOptionByIdx(usable);
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
    e.preventDefault();
    openAndFocusActive();
  } else if (e.key === "Escape" && isOpen.value) {
    e.preventDefault();
    close();
  }
}

function currentFocusedIdx(): number {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return -1;
  for (const [idx, node] of optionRefs.entries()) {
    if (node === el) return idx;
  }
  return -1;
}

function moveFocus(delta: 1 | -1) {
  const order = focusableIndices();
  if (!order.length) return;
  const cur = currentFocusedIdx();
  let pos = order.indexOf(cur);
  if (pos === -1) {
    focusOptionByIdx(delta > 0 ? order[0] : order[order.length - 1]);
    return;
  }
  pos = (pos + delta + order.length) % order.length;
  focusOptionByIdx(order[pos]);
}

function onListKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    moveFocus(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    moveFocus(-1);
  } else if (e.key === "Home") {
    e.preventDefault();
    const order = focusableIndices();
    if (order.length) focusOptionByIdx(order[0]);
  } else if (e.key === "End") {
    e.preventDefault();
    const order = focusableIndices();
    if (order.length) focusOptionByIdx(order[order.length - 1]);
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const idx = currentFocusedIdx();
    if (idx >= 0) selectItem(displayedItems.value[idx]);
  } else if (e.key === "Escape") {
    e.preventDefault();
    close();
    focusTrigger();
  } else if (
    !props.searchable &&
    e.key.length === 1 &&
    /^[a-zA-Z0-9]$/.test(e.key)
  ) {
    const order = focusableIndices();
    const letter = e.key.toLowerCase();
    const match = order.find((i) =>
      displayedItems.value[i].title.toLowerCase().startsWith(letter),
    );
    if (match !== undefined) focusOptionByIdx(match);
  }
}

watch(isOpen, (open) => {
  if (!open) focusTrigger();
});

const highlightedIdx = ref<number>(-1);

const activeDescendantId = computed(() =>
  highlightedIdx.value >= 0
    ? `${listboxId}-opt-${highlightedIdx.value}`
    : undefined,
);

watch(displayedItems, () => {
  if (!props.searchable) return;
  const order = focusableIndices();
  highlightedIdx.value = order[0] ?? -1;
});

watch(isOpen, (open) => {
  if (!open) {
    highlightedIdx.value = -1;
    return;
  }
  if (!props.searchable) return;
  const idx = displayedItems.value.findIndex(
    (it) => it.value === props.modelValue && !it.disabled,
  );
  const order = focusableIndices();
  highlightedIdx.value = idx >= 0 ? idx : order[0] ?? -1;
});

function moveHighlight(delta: 1 | -1) {
  const order = focusableIndices();
  if (!order.length) return;
  const cur = order.indexOf(highlightedIdx.value);
  if (cur === -1) {
    highlightedIdx.value = delta > 0 ? order[0] : order[order.length - 1];
    return;
  }
  const next = (cur + delta + order.length) % order.length;
  highlightedIdx.value = order[next];
}

function onSearchKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    moveHighlight(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    moveHighlight(-1);
  } else if (e.key === "Home") {
    e.preventDefault();
    const order = focusableIndices();
    if (order.length) highlightedIdx.value = order[0];
  } else if (e.key === "End") {
    e.preventDefault();
    const order = focusableIndices();
    if (order.length) highlightedIdx.value = order[order.length - 1];
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (highlightedIdx.value >= 0) {
      selectItem(displayedItems.value[highlightedIdx.value]);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    close();
    focusTrigger();
  }
}

// Dev-only: warn once per offending item when both icon and avatar are set.
if (import.meta.env?.DEV ?? true) {
  const warned = new Set<SwitcherValue>();
  watchEffect(() => {
    for (const item of props.items) {
      if (item.icon && item.avatar && !warned.has(item.value)) {
        warned.add(item.value);
        console.warn(
          `[Switcher] item "${item.value}" declares both \`icon\` and \`avatar\`; \`avatar\` wins. Pick one.`,
        );
      }
    }
  });
}

defineExpose({ open, close, toggle });
</script>
