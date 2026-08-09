<template> 
    <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']"> 
        <label 
            v-if="label" 
            :for="fieldId" 
            class="text-caption font-medium text-foreground" 
        > 
            {{ label }} 
            <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
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
        >
            <MagnifyingGlassIcon 
                aria-hidden="true" 
                :class="['shrink-0', affordanceIconClass, iconSizeClasses]" 
            /> 
 
            <input 
                :id="fieldId" 
                ref="inputRef" 
                type="search" 
                :value="modelValue ?? ''" 
                :placeholder="placeholder" 
                :disabled="isDisabled" 
                :readonly="readonly" 
                :required="required" 
                :name="name" 
                :maxlength="maxLength" 
                :autofocus="autofocus" 
                autocomplete="off" 
                spellcheck="false" 
                role="searchbox"
                :aria-label="!label ? ariaLabel : undefined"
                :aria-invalid="hasError || undefined"
                :aria-describedby="describedBy"
                :aria-required="required || undefined"
                :aria-expanded="hasDropdown ? isOpen : undefined"
                :aria-controls="hasDropdown && isOpen ? `${fieldId}-results` : undefined"
                :aria-activedescendant="isOpen && highlightedIdx >= 0 ? `${fieldId}-opt-${highlightedIdx}` : undefined"
                :class="[ 
                    'modo-field-native flex-1 min-w-0 bg-transparent p-0', 
                    'text-foreground placeholder:text-muted-foreground', 
                    'disabled:cursor-not-allowed', 
                    inputTextClasses, 
                ]" 
                @input="onInput" 
                @keydown="onKeydown" 
                @focus="onFocus" 
                @blur="onBlur" 
            /> 
 
            <Loader 
                v-if="loading" 
                :size="size === 'large' ? 'medium' : 'small'" 
                :class="['shrink-0', affordanceIconClass]" 
            /> 
 
            <Button 
                v-else-if="hasValue && !isDisabled && !readonly" 
                variant="text" 
                size="xs" 
                radius="full" 
                :icon="XMarkIcon" 
                :ariaLabel="loc.searchInput.clear" 
                tabindex="-1" 
                :class="['shrink-0', affordanceActionClass]" 
                @click="onClear" 
            /> 
 
            <!-- The shortcut hint stays while the field is empty (focused or not)
                 so focusing never removes it and reflows the width. It yields to
                 the clear button as soon as there is a value. -->
            <kbd
                v-else-if="shortcut"
                aria-hidden="true"
                :class="[ 
                    'shrink-0 select-none rounded-md px-1.5 py-0.5', 
                    'text-[11px] leading-none font-sans font-medium tabular-nums', 
                    'bg-muted text-muted-foreground border border-border', 
                ]" 
            > 
                {{ shortcutLabel }}
            </kbd>
        </div>

        <!-- RESULTS DROPDOWN -->
        <PopoverPanel
            v-if="hasDropdown"
            :open="isOpen"
            :style="panelStyle"
            :radius="resolvedRadius"
            role="presentation"
            @update:panelRef="panelRef = $event"
        >
            <!-- mousedown.prevent keeps focus in the input while clicking a row -->
            <div class="modo-search-results" @mousedown.prevent>
                <slot
                    name="results"
                    :items="resultItems"
                    :query="String(modelValue ?? '')"
                    :highlighted="highlightedIdx"
                    :select="selectResult"
                    :close="closePopover"
                >
                    <!--
                        The panel loader only takes over when there is nothing
                        to show yet. Swapping a populated list for a spinner on
                        every keystroke makes the dropdown collapse and reopen
                        as the user types; the affordance spinner in the field
                        already signals the in-flight request.
                    -->
                    <div v-if="loading && !resultItems.length" class="px-3 py-6 flex items-center justify-center">
                        <slot name="loading"><Loader size="small" /></slot>
                    </div>
                    <div
                        v-else-if="!resultItems.length"
                        class="px-3 py-6 text-center text-muted-foreground text-body"
                    >
                        <slot name="empty">{{ emptyText }}</slot>
                    </div>
                    <ul
                        v-else
                        :id="`${fieldId}-results`"
                        role="listbox"
                        :aria-busy="loading || undefined"
                        class="flex flex-col"
                    >
                        <template v-for="row in renderRows" :key="row.key">
                            <li
                                v-if="row.kind === 'header'"
                                role="presentation"
                                class="px-3 pt-2 pb-1 text-caption font-medium text-muted-foreground select-none"
                            >
                                {{ row.label }}
                            </li>
                            <li
                                v-else
                                :id="`${fieldId}-opt-${row.index}`"
                                role="option"
                                :aria-selected="row.index === highlightedIdx"
                                :aria-disabled="row.item.disabled || undefined"
                            >
                                <component
                                    :is="row.item.href && !row.item.disabled ? 'a' : 'div'"
                                    :href="row.item.href && !row.item.disabled ? row.item.href : undefined"
                                    :target="row.item.external ? '_blank' : undefined"
                                    :rel="row.item.external ? 'noopener noreferrer' : undefined"
                                    class="flex items-center gap-2.5 px-3 py-2 text-body transition-colors duration-fast ease-standard"
                                    :class="[
                                        row.item.disabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'cursor-pointer',
                                        row.index === highlightedIdx && !row.item.disabled ? 'bg-accent' : '',
                                    ]"
                                    @mouseenter="row.item.disabled ? null : (highlightedIdx = row.index)"
                                    @click="selectResult(row.item)"
                                >
                                    <slot name="item" :item="row.item" :active="row.index === highlightedIdx">
                                        <component
                                            :is="row.item.icon"
                                            v-if="row.item.icon"
                                            class="size-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <span class="flex flex-col min-w-0 flex-1">
                                            <span class="truncate">{{ row.item.label }}</span>
                                            <span
                                                v-if="row.item.description"
                                                class="text-caption text-muted-foreground truncate"
                                            >{{ row.item.description }}</span>
                                        </span>
                                        <span
                                            v-if="row.item.shortcut"
                                            class="ml-2 text-caption text-muted-foreground tabular-nums shrink-0"
                                            aria-hidden="true"
                                        >{{ row.item.shortcut }}</span>
                                    </slot>
                                </component>
                            </li>
                        </template>
                    </ul>
                </slot>
            </div>
        </PopoverPanel>

        <div
            v-if="errorText || helperText || showCounterEffective" 
            class="flex items-start justify-between gap-2" 
        > 
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
            <span v-else class="flex-1" /> 
 
            <span 
                v-if="showCounterEffective" 
                :id="counterId" 
                :class="[ 
                    'text-caption shrink-0 tabular-nums', 
                    counterOverflow ? 'text-destructive' : 'text-muted-foreground', 
                ]" 
            > 
                {{ currentLength }}/{{ maxLength }} 
            </span> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch, nextTick } from 'vue';
import type { SearchInput, SearchResultItem } from '../../interfaces/forms/SearchInput.interface';
import {
    useFieldState,
    useFieldClasses,
    FIELD_AFFORDANCE_ACTION_BY_COLOR,
    FIELD_AFFORDANCE_ICON_BY_COLOR,
} from '../../composables/useField';
import Loader from '../feedback/Loader.vue';
import Button from './Button.vue';
import PopoverPanel from '../layout/PopoverPanel.vue';
import { usePopover } from '../../composables/usePopover';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import Typography from '../data-display/Typography.vue';
import { useModoLocale, useResolvedRadius, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig';

const loc = useModoLocale();
const slots = useSlots();

const emit = defineEmits<{
    'update:modelValue': [value: string];
    change: [value: string];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
    clear: [];
    /** Se emite al presionar Enter o tras el debounce. */
    search: [value: string];
    /** A result row was chosen (click / Enter on the highlighted row). */
    select: [item: SearchResultItem];
    /** Results popover open state (for `v-model:open`). */
    'update:open': [value: boolean];
}>();

const props = withDefaults(defineProps<SearchInput>(), {
    variant: 'outline',
    color: 'default',
    disabled: false,
    readonly: false,
    required: false,
    loading: false,
    fullWidth: false,
    showCounter: false,
    autofocus: false,
    debounce: 0,
    placeholder: 'Search…',
    resultsPlacement: 'bottom-start',
});
 
const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size);

const inputRef = ref<HTMLInputElement | null>(null); 
const focused = ref(false); 
 
const { 
    fieldId, 
    radius, 
    stateColor, 
    hasError, 
    hasValue, 
    currentLength,
    showCounterEffective, 
    counterOverflow, 
    errorId, 
    helperId, 
    counterId, 
    describedBy, 
} = useFieldState(props, { componentName: 'SearchInput', idPrefix: 'modo-search' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, 
    hasError, 
    radius, 
    halo: () => props.halo, 
}); 

// Deliberately NOT `useFieldState`'s `isDisabled`, which also reports true
// while `loading`. That is right for a field being submitted, but fatal for a
// search box: the results are what load, not the input. Disabling it mid-query
// makes the browser blur the element the user is typing in — focus is lost, the
// results popover closes, and the next keystroke is dropped. For SearchInput,
// only an explicit `disabled` disables.
const isDisabled = computed(() => !!props.disabled);

const affordanceIconClass = computed(() => FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? 'text-muted-foreground');
const affordanceActionClass = computed(() => FIELD_AFFORDANCE_ACTION_BY_COLOR[stateColor.value] ?? 'text-muted-foreground hover:text-foreground');

/* ---------- Results dropdown ---------- */
const resolvedRadius = useResolvedRadius(() => props.radius);

// The dropdown is active when the host passes `items` (even empty) or a custom
// `#results` slot. Filtering/async stays with the host — this only renders.
const hasDropdown = computed(() => props.items !== undefined || !!slots.results);
const resultItems = computed<SearchResultItem[]>(() => props.items ?? []);

const highlightedIdx = ref(-1);
const {
    triggerRef: popoverTrigger,
    panelRef,
    isOpen,
    panelStyle,
    open: openPopover,
    close: closePopover,
} = usePopover({
    placement: () => props.resultsPlacement,
    matchTriggerWidth: true,
    closeOnEscape: false, // handled on the input so focus stays in the field
    closeOnScroll: false, // reposition on scroll; focusing the input can auto-scroll it into view
    onOpen: () => emit('update:open', true),
    onClose: () => { emit('update:open', false); highlightedIdx.value = -1; },
});

const wrapperEl = ref<HTMLElement | null>(null);
watch(wrapperEl, (el) => { popoverTrigger.value = el; });

// Flat render list with a group header inserted whenever `group` changes.
type RenderRow =
    | { kind: 'header'; label: string; key: string }
    | { kind: 'option'; item: SearchResultItem; index: number; key: string };
const renderRows = computed<RenderRow[]>(() => {
    const rows: RenderRow[] = [];
    let prevGroup: string | undefined;
    resultItems.value.forEach((item, index) => {
        if (item.group && item.group !== prevGroup) {
            rows.push({ kind: 'header', label: item.group, key: `h-${index}` });
            prevGroup = item.group;
        }
        rows.push({ kind: 'option', item, index, key: `o-${item.id ?? index}` });
    });
    return rows;
});

const enabledIndices = computed(() =>
    resultItems.value.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i !== -1),
);

// Show the popover only while focused and there is something to render.
const shouldShowResults = computed(() =>
    hasDropdown.value && focused.value &&
    (resultItems.value.length > 0 || props.loading || !!props.emptyText || !!slots.empty),
);

function syncOpen() {
    if (shouldShowResults.value) { if (!isOpen.value) openPopover(); }
    else if (isOpen.value) closePopover();
}
watch(shouldShowResults, syncOpen);
watch(() => resultItems.value.length, () => { if (isOpen.value || shouldShowResults.value) nextTick(syncOpen); });

// Optional external control via `v-model:open`.
watch(() => props.open, (v) => {
    if (v === undefined) return;
    if (v && shouldShowResults.value) openPopover();
    else if (!v) closePopover();
});

function moveHighlight(delta: 1 | -1) {
    const order = enabledIndices.value;
    if (!order.length) return;
    const cur = order.indexOf(highlightedIdx.value);
    highlightedIdx.value = cur === -1
        ? (delta > 0 ? order[0] : order[order.length - 1])
        : order[(cur + delta + order.length) % order.length];
}

function selectResult(item: SearchResultItem) {
    if (item.disabled) return;
    emit('select', item);
    closePopover();
}

/* ---------- Debounce ---------- */
let debounceTimer: number | null = null; 
function scheduleSearch(value: string) { 
    if (!props.debounce || props.debounce <= 0) return; 
    if (debounceTimer !== null) clearTimeout(debounceTimer); 
    debounceTimer = window.setTimeout(() => { 
        emit('search', value); 
        debounceTimer = null; 
    }, props.debounce); 
} 
function cancelDebounce() { 
    if (debounceTimer !== null) { 
        clearTimeout(debounceTimer); 
        debounceTimer = null; 
    } 
} 
 
/* ---------- Events ---------- */ 
function onInput(e: Event) { 
    const target = e.target as HTMLInputElement; 
    emit('update:modelValue', target.value); 
    scheduleSearch(target.value); 
} 
 
function onKeydown(e: KeyboardEvent) {
    // Arrow keys drive the results dropdown when it is available.
    if (hasDropdown.value && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        if (!isOpen.value && shouldShowResults.value) openPopover();
        moveHighlight(e.key === 'ArrowDown' ? 1 : -1);
        return;
    }
    if (e.key === 'Enter') {
        // Enter picks the highlighted result if the dropdown is open; otherwise
        // it keeps the existing "submit search" behaviour.
        if (isOpen.value && highlightedIdx.value >= 0) {
            const item = resultItems.value[highlightedIdx.value];
            if (item && !item.disabled) {
                e.preventDefault();
                selectResult(item);
                return;
            }
        }
        e.preventDefault();
        cancelDebounce();
        emit('search', String(props.modelValue ?? ''));
        return;
    }
    if (e.key === 'Escape') {
        // First Escape closes the dropdown; a second (or when closed) clears.
        if (isOpen.value) {
            e.preventDefault();
            closePopover();
            return;
        }
        if (hasValue.value) {
            e.preventDefault();
            onClear();
        }
    }
}
 
function onFocus(e: FocusEvent) {
    focused.value = true;
    emit('focus', e);
    // Open the results popover on focus if there is anything to show. Done
    // explicitly (not only via the watcher) so it fires on the very first focus.
    if (hasDropdown.value) nextTick(syncOpen);
}
 
function onBlur(e: FocusEvent) {
    focused.value = false;
    emit('blur', e);
}
 
function onClear() { 
    cancelDebounce(); 
    emit('update:modelValue', ''); 
    emit('clear'); 
    emit('search', ''); 
    inputRef.value?.focus(); 
} 
 
/* ---------- Shortcut ---------- */
// Stays `false` on SSR and on the first client paint to keep them
// identical, then flips to the real platform value in onMounted. Without
// this guard the server would render `Ctrl+K` and the client would
// immediately replace it with `⌘K`, triggering a hydration warning.
const isMac = ref(false);
onMounted(() => {
    isMac.value = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
});
 
interface ParsedShortcut { 
    key: string; 
    ctrl: boolean; 
    meta: boolean; 
    shift: boolean; 
    alt: boolean; 
} 
 
const parsedShortcut = computed<ParsedShortcut | null>(() => { 
    if (!props.shortcut) return null; 
    const parts = props.shortcut.toLowerCase().split('+').map((p) => p.trim()); 
    const result: ParsedShortcut = { key: '', ctrl: false, meta: false, shift: false, alt: false }; 
    for (const part of parts) { 
        if (part === 'cmd' || part === 'meta' || part === 'command') { 
            if (isMac.value) result.meta = true; 
            else result.ctrl = true; 
        } else if (part === 'ctrl' || part === 'control') { 
            result.ctrl = true; 
        } else if (part === 'shift') { 
            result.shift = true; 
        } else if (part === 'alt' || part === 'option') { 
            result.alt = true; 
        } else { 
            result.key = part; 
        } 
    } 
    return result.key ? result : null; 
}); 
 
const shortcutLabel = computed(() => { 
    const s = parsedShortcut.value; 
    if (!s) return ''; 
    const segs: string[] = []; 
    if (s.meta) segs.push(isMac.value ? '⌘' : 'Ctrl');
    else if (s.ctrl) segs.push(isMac.value ? '⌃' : 'Ctrl');
    if (s.alt) segs.push(isMac.value ? '⌥' : 'Alt');
    if (s.shift) segs.push(isMac.value ? '⇧' : 'Shift');
    segs.push(s.key.length === 1 ? s.key.toUpperCase() : s.key); 
    return segs.join(isMac.value ? '' : '+'); 
}); 
 
function onGlobalKeydown(e: KeyboardEvent) { 
    const s = parsedShortcut.value; 
    if (!s) return; 
 
    // No robar atajos mientras el usuario escribe en otro campo (a menos que sea una combinación con modificador). 
    const target = e.target as HTMLElement | null; 
    const typingElsewhere = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable); 
    const hasModifier = s.meta || s.ctrl || s.alt; 
    if (typingElsewhere && !hasModifier && target !== inputRef.value) return; 
 
    if ( 
        e.key.toLowerCase() === s.key && 
        e.metaKey === s.meta && 
        e.ctrlKey === s.ctrl && 
        e.shiftKey === s.shift && 
        e.altKey === s.alt 
    ) { 
        e.preventDefault(); 
        inputRef.value?.focus(); 
        inputRef.value?.select(); 
    } 
} 
 
onMounted(() => { 
    if (parsedShortcut.value) { 
        window.addEventListener('keydown', onGlobalKeydown); 
    } 
}); 
 
onBeforeUnmount(() => { 
    cancelDebounce(); 
    window.removeEventListener('keydown', onGlobalKeydown); 
}); 
 
/* ---------- Classes ---------- */ 
 
const wrapperSizeClasses = computed(() => `${sz.value.control} ${sz.value.padX}`);

const inputTextClasses = computed(() => sz.value.text);

const iconSizeClasses = computed(() => sz.value.icon); 
 
defineExpose({ 
    focus: () => inputRef.value?.focus(), 
    blur: () => inputRef.value?.blur(), 
    select: () => inputRef.value?.select(), 
    clear: onClear, 
    inputRef, 
}); 
</script>
