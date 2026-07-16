<template> 
    <div :class="['flex flex-col', fullWidth ? 'w-full' : '']"> 
        <!-- Tablist --> 
        <div 
            :class="[ 
                'modo-tabs-scroll', 
                'relative flex', 
                isSegmented ? '' : 'overflow-x-auto', 
                isLine ? 'border-b border-border' : '', 
                isSegmented ? `${segmentedTrackRadius} bg-muted p-1 gap-1` : '', 
                isLine || isPill ? 'gap-1' : '', 
                fullWidth ? 'w-full' : '', 
            ]" 
        > 
            <div 
                ref="tablistEl" 
                role="tablist" 
                :aria-label="ariaLabel" 
                aria-orientation="horizontal" 
                :class="[ 
                    'relative flex', 
                    isSegmented ? 'gap-1 w-full' : 'gap-1', 
                    fullWidth ? 'w-full' : '', 
                ]" 
            > 
                <!-- Sliding indicator --> 
                <span 
                    ref="indicatorEl" 
                    class="modo-tab-indicator absolute pointer-events-none" 
                    :class="indicatorClasses" 
                    :style="indicatorStyle" 
                    aria-hidden="true" 
                /> 
 
                <component 
                    :is="resolveItemTag(item)" 
                    v-for="(item, idx) in items" 
                    :key="item.value" 
                    :ref="(el: any) => setItemRef(el, idx)" 
                    role="tab" 
                    :id="`${tabsId}-tab-${item.value}`" 
                    :aria-controls="`${tabsId}-panel-${item.value}`" 
                    :aria-selected="isActive(item) ? 'true' : 'false'" 
                    :aria-disabled="item.disabled || undefined" 
                    :aria-label="item.ariaLabel" 
                    :tabindex="getTabIndex(item)" 
                    :type="item.to ? undefined : 'button'" 
                    :href="item.to && !item.disabled ? item.to : undefined" 
                    :disabled="!item.to && item.disabled" 
                    :class="[ 
                        'modo-tab relative z-10', 
                        'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap', 
                        sizeClasses, 
                        itemRadiusClasses, 
                        fullWidth ? 'flex-1' : '', 
                        'transition-colors duration-base ease-standard', 
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', 
                        focusRingClass, 
                        item.disabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'cursor-pointer', 
                        ...itemStateClasses(item), 
                    ]" 
                    @click="onItemClick($event, item)" 
                    @keydown="onKeydown" 
                > 
                    <component 
                        v-if="item.icon" 
                        :is="item.icon" 
                        aria-hidden="true" 
                        :class="iconSizeClass" 
                    /> 
                    <span class="text-inherit">{{ item.label }}</span> 
                    <span 
                        v-if="item.badge !== undefined && item.badge !== null && item.badge !== ''" 
                        :class="[ 
                            'inline-flex items-center justify-center rounded-full text-caption font-medium px-1.5 min-w-5 h-5', 
                            badgeStateClass(item), 
                        ]" 
                        aria-hidden="true" 
                    >{{ item.badge }}</span> 
                </component> 
            </div> 
        </div> 
 
        <!-- Panels --> 
        <div :class="['modo-tabs-panels', panelsContainerClass]"> 
            <template v-for="item in items" :key="`panel-${item.value}`"> 
                <div 
                    v-if="shouldRenderPanel(item)" 
                    v-show="!keepMounted || isActive(item)" 
                    role="tabpanel" 
                    :id="`${tabsId}-panel-${item.value}`" 
                    :aria-labelledby="`${tabsId}-tab-${item.value}`" 
                    :hidden="!isActive(item) || undefined" 
                    :tabindex="0" 
                    class="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md" 
                > 
                    <slot :name="`panel-${item.value}`" :item="item" :active="isActive(item)"> 
                        <slot name="panel" :item="item" :active="isActive(item)" /> 
                    </slot> 
                </div> 
            </template> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Tabs as TabsProps, TabItem, TabsEmits } from '../../interfaces/navigation/Tabs.interface';
import { useResolvedColor, useResolvedRadius, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<TabsProps>(), { 
    variant: 'line', 
    fullWidth: false, 
    lazy: false, 
    keepMounted: true, 
    linkComponent: 'a', 
}); 
 
const emit = defineEmits<TabsEmits>(); 
 
const resolvedColor = useResolvedColor(() => props.color);
const resolvedRadius = useResolvedRadius(() => props.radius);
const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size); 
 
// Stable id for ARIA wiring. 
let _id = 0; 
const tabsId = `modo-tabs-${++_id}-${Math.random().toString(36).slice(2, 7)}`; 
 
const isLine = computed(() => props.variant === 'line'); 
const isPill = computed(() => props.variant === 'pill'); 
const isSegmented = computed(() => props.variant === 'segmented'); 
 
const internalActive = ref<string | number | null>( 
    props.modelValue ?? props.items.find(i => !i.disabled)?.value ?? null, 
); 
 
watch( 
    () => props.modelValue, 
    v => { 
        if (v !== undefined && v !== internalActive.value) internalActive.value = v; 
    }, 
); 
 
function isActive(item: TabItem) { 
    return internalActive.value === item.value; 
} 
 
// Track which panels have been mounted (for `lazy`). 
const mounted = ref<Set<string | number>>(new Set()); 
function shouldRenderPanel(item: TabItem) { 
    if (!props.lazy) return true; 
    if (isActive(item)) { 
        if (!mounted.value.has(item.value)) mounted.value.add(item.value); 
        return true; 
    } 
    return props.keepMounted && mounted.value.has(item.value); 
} 
 
// --- DOM refs for keyboard navigation & scroll-into-view ---------------- 
const tablistEl = ref<HTMLElement | null>(null); 
const indicatorEl = ref<HTMLElement | null>(null); 
const itemRefs = ref<(HTMLElement | null)[]>([]); 
function setItemRef(el: HTMLElement | null, idx: number) { 
    itemRefs.value[idx] = el; 
} 
 
// --- Sliding indicator -------------------------------------------------- 
// A single absolutely-positioned element that travels between tabs and 
// morphs its width/height. Replaces the per-item bg/border for the active 
// state, so the change feels continuous instead of "snapping". 
// 
// Initial state is invisible (opacity 0) so it doesn't fly in from the 
// top-left on first render. After the first synchronous measurement we 
// flip opacity to 1 with the animation suppressed for that one frame. 
const indicatorStyle = ref<Record<string, string>>({ 
    transform: 'translate3d(0, 0, 0)', 
    width: '0px', 
    height: '0px', 
    opacity: '0', 
}); 
let _firstMeasureDone = false; 
 
function measureIndicator(animated = true) { 
    const idx = props.items.findIndex(i => i.value === internalActive.value); 
    const el = itemRefs.value[idx]; 
    if (!el) return; 
 
    const left = el.offsetLeft; 
    const top = el.offsetTop; 
    const width = el.offsetWidth; 
    const height = el.offsetHeight; 
 
    // Width === 0 means the layout isn't ready yet (e.g. measuring before 
    // mount/paint). Bail; the next animation frame will retry. 
    if (width === 0 && height === 0) return; 
 
    const node = indicatorEl.value; 
    if (!animated && node) { 
        // Skip the transition for this one frame so the indicator can 
        // "appear" at its measured position without flying in. 
        node.classList.add('modo-tab-indicator--no-anim'); 
        requestAnimationFrame(() => { 
            requestAnimationFrame(() => { 
                node.classList.remove('modo-tab-indicator--no-anim'); 
            }); 
        }); 
    } 
 
    if (isLine.value) { 
        // Bottom 2px bar; sits on top of the wrapper's `border-b` line. 
        indicatorStyle.value = { 
            transform: `translate3d(${left}px, 0, 0)`, 
            width: `${width}px`, 
            height: '2px', 
            bottom: '-1px', 
            top: 'auto', 
            opacity: '1', 
        }; 
    } else { 
        // Pill / segmented: full footprint of the tab. 
        indicatorStyle.value = { 
            transform: `translate3d(${left}px, ${top}px, 0)`, 
            width: `${width}px`, 
            height: `${height}px`, 
            top: '0', 
            opacity: '1', 
        }; 
    } 
 
    _firstMeasureDone = true; 
} 
 
let _ro: ResizeObserver | null = null; 
onMounted(() => { 
    // Wait two frames: one for Vue to commit DOM, one for layout/fonts. 
    requestAnimationFrame(() => { 
        requestAnimationFrame(() => measureIndicator(false)); 
    }); 
    if (typeof ResizeObserver !== 'undefined' && tablistEl.value) { 
        _ro = new ResizeObserver(() => { 
            // Animation off during resize, on after first measure. 
            measureIndicator(_firstMeasureDone); 
        }); 
        _ro.observe(tablistEl.value); 
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
    () => [internalActive.value, props.variant, resolvedSize.value, props.fullWidth, props.items.length, resolvedRadius.value, resolvedColor.value], 
    () => { 
        nextTick(() => measureIndicator(_firstMeasureDone)); 
    }, 
); 
 
watch( 
    () => internalActive.value, 
    () => { 
        nextTick(() => { 
            const idx = props.items.findIndex(i => i.value === internalActive.value); 
            const el = itemRefs.value[idx]; 
            if (el && typeof el.scrollIntoView === 'function') { 
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }); 
            } 
        }); 
    }, 
); 
 
// --- Interaction -------------------------------------------------------- 
function activate(item: TabItem) { 
    if (item.disabled || isActive(item)) return; 
    internalActive.value = item.value; 
    emit('update:modelValue', item.value); 
    emit('change', item.value, item); 
} 
 
function onItemClick(e: MouseEvent, item: TabItem) { 
    if (item.disabled) { 
        e.preventDefault(); 
        return; 
    } 
    activate(item); 
} 
 
function onKeydown(e: KeyboardEvent) { 
    const key = e.key; 
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(key)) return; 
 
    const enabled = props.items 
        .map((it, i) => ({ it, i })) 
        .filter(({ it }) => !it.disabled); 
    if (enabled.length === 0) return; 
 
    const currentIdx = enabled.findIndex(({ it }) => it.value === internalActive.value); 
 
    if (key === 'Enter' || key === ' ') { 
        e.preventDefault(); 
        // Activate currently focused tab (already handled by click on Enter for buttons, 
        // but we do it explicitly to support `<a>` rendering as well). 
        const focused = document.activeElement; 
        const idx = itemRefs.value.findIndex(r => r === focused); 
        const item = idx >= 0 ? props.items[idx] : null; 
        if (item) activate(item); 
        return; 
    } 
 
    e.preventDefault(); 
    let next = currentIdx; 
    if (key === 'ArrowRight') next = (currentIdx + 1 + enabled.length) % enabled.length; 
    else if (key === 'ArrowLeft') next = (currentIdx - 1 + enabled.length) % enabled.length; 
    else if (key === 'Home') next = 0; 
    else if (key === 'End') next = enabled.length - 1; 
 
    const target = enabled[next]; 
    if (!target) return; 
    activate(target.it); 
    nextTick(() => itemRefs.value[target.i]?.focus()); 
} 
 
function getTabIndex(item: TabItem) { 
    if (item.disabled) return -1; 
    // Roving tabindex: only the active tab is in the tab order. 
    return isActive(item) ? 0 : -1; 
} 
 
function resolveItemTag(item: TabItem) { 
    if (item.to) return props.linkComponent ?? 'a'; 
    return 'button'; 
} 
 
// --- Class maps ---------------------------------------------------------
const sizeClasses = computed(() => `${sz.value.control} ${sz.value.padX} ${sz.value.text}`);

const iconSizeClass = computed(() => sz.value.icon); 
 
const itemRadiusClasses = computed(() => { 
    if (isLine.value) return 'rounded-none'; 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-full'; 
        case 'medium': 
        default: return 'rounded-md'; 
    } 
}); 
 
const segmentedTrackRadius = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-md'; 
        case 'large': return 'rounded-2xl'; 
        case 'full': return 'rounded-full'; 
        case 'medium': 
        default: return 'rounded-lg'; 
    } 
}); 
 
// Unified focus ring across the system — colour-agnostic.
const focusRingClass = computed(() => 'focus-visible:ring-ring/60');
 
// Active text/border color tokens by `color` prop. 
function activeBrandText() { 
    switch (resolvedColor.value) { 
        case 'primary': return 'text-primary'; 
        case 'danger': return 'text-destructive'; 
        case 'success': return 'text-success'; 
        case 'warning': return 'text-warning'; 
        case 'default': 
        default: return 'text-foreground'; 
    } 
} 
 
function pillActiveClasses() { 
    // Item-level active classes for `pill`. The indicator paints the fill; 
    // here we only set the foreground so text reads against it. 
    switch (resolvedColor.value) { 
        case 'primary': return 'text-primary-foreground'; 
        case 'danger': return 'text-destructive-foreground'; 
        case 'success': return 'text-success-foreground'; 
        case 'warning': return 'text-warning-foreground'; 
        case 'default': 
        default: return 'text-accent-foreground'; 
    } 
} 
 
function itemStateClasses(item: TabItem): string[] { 
    const active = isActive(item); 
    const disabled = !!item.disabled; 
 
    if (isLine.value) { 
        // Reserve 2px at the bottom on every item so heights stay aligned — 
        // the indicator paints the colored bar. 
        const base = 'border-b-2 border-transparent -mb-px'; 
        if (active) { 
            return [base, activeBrandText(), 'font-medium']; 
        } 
        return [ 
            base, 
            'text-muted-foreground', 
            !disabled ? 'hover:text-foreground' : '', 
        ]; 
    } 
 
    if (isPill.value) { 
        if (active) { 
            return ['font-medium', pillActiveClasses()]; 
        } 
        return [ 
            'text-muted-foreground', 
            !disabled ? `hover:text-foreground hover:bg-accent/50 ${itemRadiusClasses.value}` : '', 
        ]; 
    } 
 
    // segmented 
    if (active) { 
        return [ 
            'font-medium', 
            resolvedColor.value === 'default' ? 'text-card-foreground' : activeBrandText(), 
        ]; 
    } 
    return [ 
        'text-muted-foreground', 
        !disabled ? 'hover:text-foreground' : '', 
    ]; 
} 
 
// Indicator visual (variant + color aware). Position/size come from 
// `indicatorStyle`; classes describe the "skin". 
const indicatorClasses = computed(() => { 
    if (isLine.value) { 
        switch (resolvedColor.value) { 
            case 'primary': return 'bg-primary rounded-full'; 
            case 'danger': return 'bg-destructive rounded-full'; 
            case 'success': return 'bg-success rounded-full'; 
            case 'warning': return 'bg-warning rounded-full'; 
            case 'default': 
            default: return 'bg-foreground rounded-full'; 
        } 
    } 
    if (isPill.value) { 
        const radiusCls = itemRadiusClasses.value; 
        switch (resolvedColor.value) { 
            case 'primary': return `${radiusCls} bg-primary`; 
            case 'danger': return `${radiusCls} bg-destructive`; 
            case 'success': return `${radiusCls} bg-success`; 
            case 'warning': return `${radiusCls} bg-warning`; 
            case 'default': 
            default: return `${radiusCls} bg-accent`; 
        } 
    } 
    // segmented: card-style chip on the muted track. 
    return `${itemRadiusClasses.value} bg-card shadow-xs`; 
}); 
 
function badgeStateClass(item: TabItem): string { 
    const active = isActive(item); 
    if (isPill.value && active && resolvedColor.value !== 'default') { 
        // Inverted badge on a colored pill: alpha over the foreground. 
        return 'bg-white/25 text-current'; 
    } 
    if (active && resolvedColor.value !== 'default') { 
        return 'bg-current/15 text-current'; 
    } 
    return 'bg-muted text-muted-foreground'; 
} 
 
const panelsContainerClass = computed(() => { 
    return isLine.value || isPill.value || isSegmented.value ? 'pt-4' : ''; 
}); 
 
// DEV: warn when no items. 
if (import.meta.env.DEV) { 
    if (!props.items || props.items.length === 0) { 
        // eslint-disable-next-line no-console 
        console.warn('[mood-ui][Tabs] `items` prop is empty — nothing to render.'); 
    } 
} 
 
defineExpose({ 
    activate, 
}); 
</script> 
 
<style scoped> 
/* Hide scrollbar on the horizontal tablist scroll wrapper. */ 
.modo-tabs-scroll { 
    scrollbar-width: none; 
    -ms-overflow-style: none; 
} 
.modo-tabs-scroll::-webkit-scrollbar { 
    display: none; 
} 
 
/* Smooth ring color transitions for focus-visible. */ 
.modo-tab { 
    transition-property: color, --tw-ring-color, --tw-ring-shadow, box-shadow; 
    transition-duration: 220ms; 
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1); 
} 
 
/* Reset native anchor styles when an item renders as <a href>. */ 
.modo-tab[href] { 
    text-decoration: none; 
} 
 
/* Sliding indicator. Animates transform + width simultaneously so the 
 * background "travels" between tabs, morphing its size to match the new 
 * target instead of snapping. */ 
.modo-tab-indicator { 
    top: 0; 
    left: 0; 
    will-change: transform, width; 
    transition-property: transform, width, height, background-color, box-shadow, opacity; 
    transition-duration: 320ms; 
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); 
} 
 
/* On first paint we measure & position without animating, then re-enable. */ 
.modo-tab-indicator--no-anim { 
    transition: none !important; 
} 
 
@media (prefers-reduced-motion: reduce) { 
    .modo-tab-indicator { 
        transition: opacity 120ms linear !important; 
    } 
} 
</style>
