<template> 
    <Teleport to="body"> 
        <Transition :css="false" @enter="onOverlayEnter" @leave="onOverlayLeave" appear> 
            <div 
                v-if="modelValue" 
                ref="overlayRef" 
                :class="[ 
                    'modo-drawer-overlay fixed inset-0 z-1200 flex opacity-0', 
                    positionClasses, 
                    overlayClasses, 
                ]" 
                :style="overlayStyle" 
                :data-modo-theme="scopedTheme || undefined" 
                @mousedown="onOverlayMouseDown" 
                @click="onOverlayClick" 
            > 
                <div 
                    ref="panelRef" 
                    data-modo-drawer-panel 
                    role="dialog" 
                    aria-modal="true" 
                    :aria-labelledby="title ? titleId : undefined" 
                    :aria-describedby="description ? descriptionId : undefined" 
                    :aria-label="!title ? ariaLabel : undefined" 
                    :class="[ 
                        'modo-drawer relative flex flex-col bg-card text-foreground', 
                        'dark:bg-card/85 dark:backdrop-blur-xl', 
                        'border-border shadow-xl', 
                        sideBorderClass, 
                        sizeClasses, 
                        radiusClasses, 
                    ]" 
                    tabindex="-1" 
                    @click.stop 
                    @keydown="onPanelKeydown" 
                > 
                    <!-- Inner border layer --> 
                    <span 
                        v-if="innerBorder" 
                        aria-hidden="true" 
                        :class="[ 
                            'pointer-events-none absolute inset-1 border border-border/40', 
                            innerBorderRadiusClass, 
                        ]" 
                    /> 
 
                    <!-- Close button --> 
                    <div v-if="showClose" class="absolute top-3 right-3 z-10"> 
                        <Button 
                            variant="text" 
                            size="small" 
                            :color="resolvedColor" 
                            :icon="XMarkIcon" 
                            ariaLabel="Close" 
                            @click="close" 
                        /> 
                    </div> 
 
                    <!-- Content wrapper --> 
                    <div ref="contentRef" data-modo-drawer-content class="flex flex-col min-h-0 flex-1 opacity-0"> 
                        <!-- Header --> 
                        <header 
                            v-if="$slots.header || title || description" 
                            :class="[ 
                                'relative flex flex-col gap-1 px-6 pt-6', 
                                showClose ? 'pr-12' : '', 
                                $slots.default || $slots.body || $slots.footer ? 'pb-4' : 'pb-6', 
                            ]" 
                        > 
                            <slot name="header"> 
                                <Typography 
                                    v-if="title" 
                                    :id="titleId" 
                                    variant="title" 
                                    size="medium" 
                                    as="h2" 
                                    weight="semibold" 
                                > 
                                    {{ title }} 
                                </Typography> 
                                <Typography 
                                    v-if="description" 
                                    :id="descriptionId" 
                                    variant="body" 
                                    size="small" 
                                    color="muted" 
                                > 
                                    {{ description }} 
                                </Typography> 
                            </slot> 
                        </header> 
 
                        <!-- Body --> 
                        <div 
                            v-if="$slots.default || $slots.body" 
                            :class="[ 
                                'relative flex-1 overflow-auto px-6', 
                                ($slots.header || title || description) ? '' : 'pt-6', 
                                $slots.footer ? 'pb-4' : 'pb-6', 
                            ]" 
                        > 
                            <slot name="body"> 
                                <slot /> 
                            </slot> 
                        </div> 
 
                        <!-- Footer --> 
                        <footer 
                            v-if="$slots.footer" 
                            class="relative flex items-center justify-end gap-2 px-6 py-4" 
                        > 
                            <span 
                                v-if="innerBorder" 
                                aria-hidden="true" 
                                class="pointer-events-none absolute top-0 left-1 right-1 h-px bg-border/40" 
                            /> 
                            <span 
                                v-else 
                                aria-hidden="true" 
                                class="pointer-events-none absolute top-0 left-0 right-0 h-px bg-border" 
                            /> 
                            <slot name="footer" :close="close" /> 
                        </footer> 
                    </div> 
                </div> 
            </div> 
        </Transition> 
    </Teleport> 
</template> 
 
<script setup lang="ts"> 
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'; 
import { gsap } from 'gsap'; 
import { XMarkIcon } from '@heroicons/vue/24/outline'; 
import Button from '../forms/Button.vue'; 
import Typography from '../data-display/Typography.vue'; 
import type { Drawer } from '../../interfaces/feedback/Drawer.interface'; 
import { 
    useResolvedColor, 
    useResolvedRadius, 
    useResolvedTheme, 
    useModoConfig, 
} from '../../composables/useModoConfig'; 
import { resolveColorMode } from '../../composables/useColorMode';
import { lockBodyScroll, unlockBodyScroll } from '../../composables/useBodyScrollLock';
import { palettesToCssVars, semanticTokensFromPalettes } from '../../config/palettes'; 
import { hexToOklchString, pickForegroundOklch } from '../../config/colorPrimitives'; 
import { surfacesToCssVars } from '../../config/surfaces';
import type { ModoColor, ModoRadius } from '../../config/ModoConfig'; 
 
const props = withDefaults(defineProps<Drawer>(), { 
    modelValue: false, 
    side: 'right', 
    size: 'medium', 
    closeOnOverlay: true, 
    closeOnEscape: true, 
    showClose: true, 
    lockScroll: true, 
    color: 'default', 
    overlay: 'blur', 
    innerBorder: false, 
}); 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: boolean]; 
    open: []; 
    close: []; 
    afterLeave: []; 
}>(); 
 
const autoId = useId(); 
const titleId = computed(() => `modo-drawer-${autoId}-title`); 
const descriptionId = computed(() => `modo-drawer-${autoId}-desc`); 
 
const overlayRef = ref<HTMLElement | null>(null); 
const panelRef = ref<HTMLElement | null>(null); 
const contentRef = ref<HTMLElement | null>(null); 
 
const resolvedColor = useResolvedColor(() => props.color as ModoColor | undefined); 
const resolvedRadius = useResolvedRadius(() => props.radius as ModoRadius | undefined); 
 
const cfg = useModoConfig(); 
const theme = useResolvedTheme(); 
const scopedTheme = computed(() => resolveColorMode(theme.value)); 
 
const overlayStyle = computed(() => { 
    const providerVars = cfg?.value.palettes 
        ? { 
            ...palettesToCssVars(cfg.value.palettes), 
            ...semanticTokensFromPalettes(cfg.value.palettes, hexToOklchString, pickForegroundOklch), 
        } 
        : {};
    const surfaceVars = cfg?.value.surfaces
        ? surfacesToCssVars(cfg.value.surfaces)
        : {};
    const darkSurfaceVars = (scopedTheme.value === 'dark' && cfg?.value.darkSurfaces)
        ? surfacesToCssVars(cfg.value.darkSurfaces)
        : {};
    return { ...providerVars, ...surfaceVars, ...darkSurfaceVars }; 
}); 
 
function close() { 
    if (!props.modelValue) return; 
    emit('update:modelValue', false); 
    emit('close'); 
} 
 
/* ---------- Click outside ---------- */ 
let mouseDownOnOverlay = false; 
function onOverlayMouseDown(e: MouseEvent) { 
    mouseDownOnOverlay = e.target === overlayRef.value; 
} 
function onOverlayClick(e: MouseEvent) { 
    if (!props.closeOnOverlay) return; 
    if (e.target !== overlayRef.value) return; 
    if (!mouseDownOnOverlay) return; 
    close(); 
} 
 
/* ---------- Keydown (Escape + focus trap) ---------- */ 
function onPanelKeydown(e: KeyboardEvent) { 
    if (props.closeOnEscape && e.key === 'Escape') { 
        e.preventDefault(); 
        close(); 
        return; 
    } 
    if (e.key === 'Tab' && panelRef.value) { 
        const focusables = getFocusable(panelRef.value); 
        if (focusables.length === 0) { 
            e.preventDefault(); 
            return; 
        } 
        const first = focusables[0]; 
        const last = focusables[focusables.length - 1]; 
        const active = document.activeElement as HTMLElement | null; 
        if (e.shiftKey && active === first) { 
            e.preventDefault(); 
            last.focus(); 
        } else if (!e.shiftKey && active === last) { 
            e.preventDefault(); 
            first.focus(); 
        } 
    } 
} 
 
const FOCUSABLE_SELECTOR = 
    'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'; 
 
function getFocusable(container: HTMLElement): HTMLElement[] { 
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) 
        .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null); 
} 
 
/* ---------- Animations (slide from edge) ---------- */ 
 
function prefersReducedMotion() { 
    return typeof window !== 'undefined' 
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches; 
} 
 
let activeTimeline: gsap.core.Timeline | null = null; 
 
function getEnterTransform() { 
    switch (props.side) { 
        case 'left': return { x: '-100%', y: 0 }; 
        case 'right': return { x: '100%', y: 0 }; 
        case 'top': return { x: 0, y: '-100%' }; 
        case 'bottom': return { x: 0, y: '100%' }; 
        default: return { x: '100%', y: 0 }; 
    } 
} 
 
function onOverlayEnter(el: Element, done: () => void) { 
    const overlay = (el as HTMLElement) ?? overlayRef.value; 
    const panel = 
        overlay?.querySelector<HTMLElement>('[data-modo-drawer-panel]') 
        ?? panelRef.value; 
    const content = 
        overlay?.querySelector<HTMLElement>('[data-modo-drawer-content]') 
        ?? contentRef.value; 
    if (!overlay || !panel || !content) { done(); return; } 
 
    activeTimeline?.kill(); 
 
    if (prefersReducedMotion()) { 
        gsap.set([overlay, panel, content], { opacity: 1, clearProps: 'transform' }); 
        done(); 
        return; 
    } 
 
    const enter = getEnterTransform(); 
    const tl = gsap.timeline({ onComplete: () => { activeTimeline = null; done(); } }); 
    activeTimeline = tl; 
 
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0); 
 
    tl.fromTo( 
        panel, 
        { x: enter.x, y: enter.y, opacity: 1 }, 
        { x: 0, y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, 
        0, 
    ); 
 
    tl.fromTo( 
        content, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.22, ease: 'power2.out' }, 
        0.18, 
    ); 
} 
 
function onOverlayLeave(el: Element, done: () => void) { 
    const overlay = el as HTMLElement; 
    const panel = 
        overlay.querySelector<HTMLElement>('[data-modo-drawer-panel]') 
        ?? panelRef.value; 
    const content = 
        overlay.querySelector<HTMLElement>('[data-modo-drawer-content]')
        ?? contentRef.value;
    // Bail out without animating, but never without releasing the lock.
    if (!overlay || !panel || !content) { releaseScrollLock(); done(); return; }
 
    activeTimeline?.kill(); 
 
    if (prefersReducedMotion()) { 
        gsap.to(overlay, { 
            opacity: 0, 
            duration: 0.12, 
            onComplete: () => { releaseScrollLock(); done(); }, 
        }); 
        return; 
    } 
 
    const enter = getEnterTransform(); 
    const tl = gsap.timeline({ 
        onComplete: () => { 
            activeTimeline = null; 
            releaseScrollLock(); 
            done(); 
        }, 
    }); 
    activeTimeline = tl; 
 
    tl.to(content, { opacity: 0, duration: 0.14, ease: 'power1.in' }, 0); 
    tl.to( 
        panel, 
        { x: enter.x, y: enter.y, duration: 0.32, ease: 'power3.in' }, 
        0.08, 
    ); 
    tl.to(overlay, { opacity: 0, duration: 0.28, ease: 'power2.in' }, 0.12); 
} 
 
/* ---------- Scroll lock + focus management ---------- */
let previouslyFocused: HTMLElement | null = null;
let scrollLocked = false;

function releaseScrollLock() {
    if (!scrollLocked) return;
    scrollLocked = false;
    unlockBodyScroll();
}

watch( 
    () => props.modelValue, 
    (open) => { 
        if (open) { 
            const active = document.activeElement as HTMLElement | null; 
            previouslyFocused = active; 
 
            if (props.lockScroll && !scrollLocked) {
                scrollLocked = true;
                lockBodyScroll();
            }
            emit('open'); 
            nextTick(() => { 
                if (!panelRef.value) return; 
                const focusables = getFocusable(panelRef.value); 
                (focusables[0] ?? panelRef.value).focus(); 
            }); 
        } else { 
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') { 
                previouslyFocused.focus(); 
            } 
            previouslyFocused = null; 
            emit('afterLeave'); 
        } 
    }, 
); 
 
onBeforeUnmount(() => { 
    activeTimeline?.kill(); 
    releaseScrollLock(); 
}); 
 
/* ---------- Style maps ---------- */ 
 
const isHorizontal = computed(() => props.side === 'left' || props.side === 'right'); 
 
const positionClasses = computed(() => { 
    switch (props.side) { 
        case 'left': return 'flex-row items-stretch justify-start'; 
        case 'right': return 'flex-row items-stretch justify-end'; 
        case 'top': return 'flex-col items-stretch justify-start'; 
        case 'bottom': return 'flex-col items-stretch justify-end'; 
        default: return 'flex-row items-stretch justify-end'; 
    } 
}); 
 
const sizeClasses = computed(() => { 
    if (isHorizontal.value) { 
        // Width + full height 
        const heightCls = 'h-full'; 
        switch (props.size) { 
            case 'small': return `${heightCls} w-[20rem] max-w-[90vw]`; 
            case 'large': return `${heightCls} w-[36rem] max-w-[95vw]`; 
            case 'full': return `${heightCls} w-screen`; 
            default: return `${heightCls} w-[28rem] max-w-[92vw]`; 
        } 
    } else { 
        // Height + full width 
        const widthCls = 'w-full'; 
        switch (props.size) { 
            case 'small': return `${widthCls} h-[18rem] max-h-[80vh]`; 
            case 'large': return `${widthCls} h-[32rem] max-h-[90vh]`; 
            case 'full': return `${widthCls} h-screen`; 
            default: return `${widthCls} h-[24rem] max-h-[85vh]`; 
        } 
    } 
}); 
 
const sideBorderClass = computed(() => { 
    switch (props.side) { 
        case 'left': return 'border-r'; 
        case 'right': return 'border-l'; 
        case 'top': return 'border-b'; 
        case 'bottom': return 'border-t'; 
        default: return 'border-l'; 
    } 
}); 
 
/** 
 * El radius se aplica solo a las dos esquinas opuestas al borde de entrada 
 * (las que quedan visibles dentro del viewport). El lado pegado al borde 
 * queda recto. 
 */ 
const radiusClasses = computed(() => { 
    if (props.size === 'full') return 'rounded-none'; 
    // Mapeo explícito (Tailwind JIT requiere class names literales). 
    const map = { 
        none: { 
            left: 'rounded-none', right: 'rounded-none', 
            top: 'rounded-none', bottom: 'rounded-none', 
        }, 
        small: { 
            left: 'rounded-r-md', right: 'rounded-l-md', 
            top: 'rounded-b-md', bottom: 'rounded-t-md', 
        }, 
        medium: { 
            left: 'rounded-r-xl', right: 'rounded-l-xl', 
            top: 'rounded-b-xl', bottom: 'rounded-t-xl', 
        }, 
        large: { 
            left: 'rounded-r-2xl', right: 'rounded-l-2xl', 
            top: 'rounded-b-2xl', bottom: 'rounded-t-2xl', 
        }, 
        full: { 
            left: 'rounded-r-3xl', right: 'rounded-l-3xl', 
            top: 'rounded-b-3xl', bottom: 'rounded-t-3xl', 
        }, 
    } as const; 
    const r = (resolvedRadius.value ?? 'medium') as keyof typeof map; 
    const safeR = map[r] ? r : 'medium'; 
    return map[safeR][props.side]; 
}); 
 
const innerBorderRadiusClass = computed(() => { 
    if (props.size === 'full') return 'rounded-none'; 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-[calc(1.5rem-4px)]'; 
        default: return 'rounded-lg'; 
    } 
}); 
 
const overlayClasses = computed(() => { 
    switch (props.overlay) { 
        case 'solid': return 'bg-foreground/60'; 
        case 'transparent': return 'bg-transparent'; 
        case 'dark': return 'bg-foreground/80'; 
        case 'dim': return 'bg-foreground/20'; 
        case 'glass': return 'bg-background/50 backdrop-blur-md'; 
        case 'blur': 
        default: return 'bg-foreground/40 backdrop-blur-sm'; 
    } 
}); 
</script>
