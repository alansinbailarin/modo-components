<template>
    <div
        ref="trackEl"
        role="radiogroup"
        :aria-label="ariaLabel"
        :aria-disabled="disabled || undefined"
        :class="[
            'relative inline-flex items-center p-1 bg-muted gap-0.5',
            trackSizeClass,
            radiusClasses,
            fullWidth ? 'w-full' : '',
            disabled ? 'opacity-60 pointer-events-none' : '',
        ]"
    >
        <!-- Sliding indicator — same technique as Tabs -->
        <span
            ref="indicatorEl"
            class="segmented-indicator absolute pointer-events-none"
            :class="[innerRadiusClasses, 'bg-card shadow-sm']"
            :style="indicatorStyle"
            aria-hidden="true"
        />

        <button
            v-for="(item, idx) in items"
            :key="item.value"
            :ref="(el: any) => setItemRef(el, idx)"
            type="button"
            role="radio"
            :aria-checked="isActive(item) ? 'true' : 'false'"
            :aria-label="item.ariaLabel ?? item.label"
            :aria-disabled="item.disabled || undefined"
            :disabled="item.disabled || disabled"
            :tabindex="isActive(item) ? 0 : -1"
            :class="[
                'relative z-10 inline-flex items-center justify-center gap-1.5 font-medium select-none whitespace-nowrap',
                'transition-colors duration-150 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                sizeClasses,
                innerRadiusClasses,
                fullWidth ? 'flex-1' : '',
                item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                isActive(item) ? activeTextClass : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="onSelect(item)"
            @keydown="onKeydown($event, item)"
        >
            <component :is="item.icon" v-if="item.icon" :class="iconSizeClasses" aria-hidden="true" />
            <span v-if="item.label">{{ item.label }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Segmented, SegmentedItem } from '../../interfaces/forms/Segmented.interface';
import { useResolvedColor, useResolvedRadius, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Segmented>(), {
    color: 'primary',
    fullWidth: false,
    disabled: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: string | number];
    'change': [value: string | number];
}>();

const resolvedSize = useResolvedSize(() => props.size);
const resolvedRadius = useResolvedRadius(() => props.radius);
const resolvedColor = useResolvedColor(() => props.color);
const sz = useSizeTokens(() => props.size);

// ── DOM refs ──────────────────────────────────────────────────────────────
const trackEl = ref<HTMLElement | null>(null);
const indicatorEl = ref<HTMLElement | null>(null);
const itemRefs = ref<(HTMLElement | null)[]>([]);
function setItemRef(el: HTMLElement | null, idx: number) {
    itemRefs.value[idx] = el;
}

// ── Sliding indicator ─────────────────────────────────────────────────────
const indicatorStyle = ref<Record<string, string>>({
    transform: 'translate3d(0,0,0)',
    width: '0px',
    height: '0px',
    opacity: '0',
});
let _firstMeasureDone = false;

function measureIndicator(animated = true) {
    const idx = props.items.findIndex((i) => i.value === props.modelValue);
    const el = itemRefs.value[idx];
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 && h === 0) return;

    const node = indicatorEl.value;
    if (!animated && node) {
        node.classList.add('segmented-indicator--no-anim');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => node.classList.remove('segmented-indicator--no-anim'));
        });
    }

    indicatorStyle.value = {
        transform: `translate3d(${el.offsetLeft}px, ${el.offsetTop}px, 0)`,
        width: `${w}px`,
        height: `${h}px`,
        top: '0',
        opacity: '1',
    };
    _firstMeasureDone = true;
}

let _ro: ResizeObserver | null = null;
onMounted(() => {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => measureIndicator(false));
    });
    if (typeof ResizeObserver !== 'undefined' && trackEl.value) {
        _ro = new ResizeObserver(() => measureIndicator(_firstMeasureDone));
        _ro.observe(trackEl.value);
    }
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', onWindowResize);
    }
});
onBeforeUnmount(() => {
    _ro?.disconnect();
    _ro = null;
    if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onWindowResize);
    }
});
function onWindowResize() {
    measureIndicator(false);
}

watch(
    () => [props.modelValue, resolvedSize.value, resolvedRadius.value, resolvedColor.value, props.fullWidth, props.items.length],
    () => nextTick(() => measureIndicator(_firstMeasureDone)),
);

// ── Selection & keyboard ──────────────────────────────────────────────────
function isActive(item: SegmentedItem): boolean {
    return props.modelValue === item.value;
}

function onSelect(item: SegmentedItem) {
    if (item.disabled || props.disabled) return;
    if (isActive(item)) return;
    emit('update:modelValue', item.value);
    emit('change', item.value);
}

function onKeydown(e: KeyboardEvent, item: SegmentedItem) {
    if (props.disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveFocus(item, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveFocus(item, -1);
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onSelect(item);
    }
}

function moveFocus(current: SegmentedItem, dir: 1 | -1) {
    const enabled = props.items.filter((i) => !i.disabled);
    if (enabled.length === 0) return;
    const idx = enabled.findIndex((i) => i.value === current.value);
    const next = enabled[(idx + dir + enabled.length) % enabled.length];
    if (next) {
        onSelect(next);
        nextTick(() => {
            const i = props.items.findIndex((it) => it.value === next.value);
            itemRefs.value[i]?.focus();
        });
    }
}

// ── Class maps ────────────────────────────────────────────────────────────
// The OUTER track owns the control height; the segments fill the padded area
// (`h-full`). This keeps a Segmented the exact same box height as a Button /
// Input at the same size (previously it ran +8px taller because of the track
// padding), so it lines up in a toolbar with no height override.
const trackSizeClass = computed(() => sz.value.control);
const sizeClasses = computed(() => `h-full ${sz.value.padX} ${sz.value.text}`);

const iconSizeClasses = computed(() => sz.value.icon);

const radiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded';
        case 'large':  return 'rounded-xl';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded-lg';
    }
});

const innerRadiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded-[3px]';
        case 'large':  return 'rounded-lg';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded-md';
    }
});

// Text color for active item — background comes from the indicator
const activeTextClass = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'text-primary font-medium';
        case 'danger':  return 'text-destructive font-medium';
        case 'success': return 'text-success font-medium';
        case 'warning': return 'text-warning font-medium';
        case 'default':
        default:        return 'text-foreground font-medium';
    }
});

</script>

<style scoped>
.segmented-indicator {
    top: 0;
    left: 0;
    will-change: transform, width;
    transition-property: transform, width, height, opacity;
    transition-duration: 280ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.segmented-indicator--no-anim {
    transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
    .segmented-indicator {
        transition: opacity 120ms linear !important;
    }
}
</style>
