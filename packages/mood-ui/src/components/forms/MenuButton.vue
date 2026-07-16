<template>
    <!-- Root IS the trigger button so ButtonGroup's border-collapse reaches it. -->
    <Button
        ref="btnRef"
        :variant="variant"
        :color="color"
        :size="size"
        :radius="radius"
        :disabled="disabled"
        :ariaLabel="ariaLabel"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        :aria-activedescendant="isOpen && activeIndex >= 0 ? `${menuId}-opt-${activeIndex}` : undefined"
        @click="toggle"
        @keydown="onTriggerKeydown"
    >
        <component :is="icon" v-if="icon" :class="[iconSizeClass, 'shrink-0']" aria-hidden="true" />
        <span v-if="label">{{ label }}</span>
        <ChevronDownIcon
            v-if="chevron"
            :class="[iconSizeClass, 'shrink-0 transition-transform duration-fast', isOpen ? 'rotate-180' : '']"
            aria-hidden="true"
        />
    </Button>

    <PopoverPanel
        :open="isOpen"
        :style="panelStyle"
        :radius="resolvedRadius"
        role="menu"
        :aria-label="ariaLabel || label || 'Menu'"
        @update:panelRef="panelRef = $event"
    >
        <ul :id="menuId" class="flex flex-col" :style="{ minWidth }" @mousedown.prevent>
            <template v-for="(entry, idx) in entries" :key="idx">
                <li v-if="isDivider(entry)" role="separator" class="my-1 h-px bg-border" />
                <li
                    v-else-if="isHeader(entry)"
                    role="presentation"
                    class="px-3 pt-2 pb-1 text-caption font-semibold uppercase tracking-wider text-muted-foreground select-none"
                >
                    {{ entry.label }}
                </li>
                <li v-else role="none">
                    <component
                        :is="entry.href && !entry.disabled ? 'a' : 'button'"
                        :id="`${menuId}-opt-${idx}`"
                        :type="entry.href ? undefined : 'button'"
                        :href="entry.href && !entry.disabled ? entry.href : undefined"
                        :target="entry.external ? '_blank' : undefined"
                        :rel="entry.external ? 'noopener noreferrer' : undefined"
                        role="menuitem"
                        tabindex="-1"
                        :aria-disabled="entry.disabled || undefined"
                        :class="[
                            'w-full flex items-center gap-2.5 px-3 py-2 text-left text-body transition-colors duration-fast ease-standard',
                            entry.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : entry.danger
                                    ? 'text-destructive cursor-pointer'
                                    : 'text-foreground cursor-pointer',
                            !entry.disabled && idx === activeIndex
                                ? (entry.danger ? 'bg-destructive/10' : 'bg-accent')
                                : '',
                        ]"
                        @mouseenter="entry.disabled ? null : (activeIndex = idx)"
                        @click="onItemClick(entry)"
                    >
                        <component
                            :is="entry.icon"
                            v-if="entry.icon"
                            :class="[iconSizeClass, 'shrink-0', entry.danger ? 'text-destructive' : 'text-muted-foreground']"
                            aria-hidden="true"
                        />
                        <span class="flex flex-col min-w-0 flex-1">
                            <span class="truncate">{{ entry.label }}</span>
                            <span v-if="entry.description" class="text-caption text-muted-foreground truncate">{{ entry.description }}</span>
                        </span>
                        <span v-if="entry.shortcut" class="ml-2 text-caption text-muted-foreground tabular-nums shrink-0" aria-hidden="true">{{ entry.shortcut }}</span>
                    </component>
                </li>
            </template>
        </ul>
    </PopoverPanel>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch, type ComponentPublicInstance } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import Button from './Button.vue';
import PopoverPanel from '../layout/PopoverPanel.vue';
import { usePopover } from '../../composables/usePopover';
import { useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig';
import type { MenuButton, MenuButtonEmits } from '../../interfaces/forms/MenuButton.interface';
import type {
    DropdownMenuEntry,
    DropdownMenuItem,
    DropdownMenuDivider,
    DropdownMenuHeader,
} from '../../interfaces/navigation/DropdownMenu.interface';

const props = withDefaults(defineProps<MenuButton>(), {
    variant: 'outline',
    color: 'default',
    chevron: true,
    placement: 'bottom-start',
    minWidth: '12rem',
    disabled: false,
    closeOnSelect: true,
});

const emit = defineEmits<MenuButtonEmits>();

const menuId = useId();
const resolvedRadius = useResolvedRadius(() => props.radius);
const resolvedSize = useResolvedSize(() => props.size);

const entries = computed<DropdownMenuEntry[]>(() => props.items ?? []);
function isDivider(e: DropdownMenuEntry): e is DropdownMenuDivider { return (e as { type?: string }).type === 'divider'; }
function isHeader(e: DropdownMenuEntry): e is DropdownMenuHeader { return (e as { type?: string }).type === 'header'; }
function isItem(e: DropdownMenuEntry): e is DropdownMenuItem { return !isDivider(e) && !isHeader(e); }

const iconSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'xsmall':
        case 'small': return 'size-4';
        case 'large': return 'size-5';
        default: return 'size-[18px]';
    }
});

/* ---------- Popover ---------- */
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
    onOpen: () => { emit('update:open', true); primeActive(); },
    onClose: () => { emit('update:open', false); activeIndex.value = -1; },
});

// The trigger element for positioning is the Button's root <button>.
const btnRef = ref<ComponentPublicInstance | null>(null);
watch(btnRef, (inst) => { triggerRef.value = (inst?.$el as HTMLElement) ?? null; }, { immediate: true });

/* ---------- Active item + keyboard ---------- */
const activeIndex = ref(-1);
const itemIndices = computed(() =>
    entries.value.map((e, i) => (isItem(e) && !e.disabled ? i : -1)).filter((i) => i !== -1),
);
function primeActive() {
    const order = itemIndices.value;
    activeIndex.value = order.length ? order[0] : -1;
}
function moveActive(delta: 1 | -1) {
    const order = itemIndices.value;
    if (!order.length) return;
    const cur = order.indexOf(activeIndex.value);
    activeIndex.value = cur === -1
        ? (delta > 0 ? order[0] : order[order.length - 1])
        : order[(cur + delta + order.length) % order.length];
}

function onTriggerKeydown(e: KeyboardEvent) {
    if (props.disabled) return;
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (!isOpen.value) open(); else moveActive(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (!isOpen.value) open(); else moveActive(-1);
            break;
        case 'Enter':
        case ' ':
            if (isOpen.value && activeIndex.value >= 0) {
                const entry = entries.value[activeIndex.value];
                if (entry && isItem(entry) && !entry.disabled) {
                    e.preventDefault();
                    onItemClick(entry);
                }
            }
            break;
        case 'Escape':
            if (isOpen.value) { e.preventDefault(); close(); }
            break;
    }
}

function onItemClick(entry: DropdownMenuItem) {
    if (entry.disabled) return;
    entry.onClick?.(entry);
    emit('select', entry);
    if (props.closeOnSelect) close();
}

defineExpose({ open, close, toggle });
</script>
