import { ref, computed, onBeforeUnmount, watch, toValue, type Ref, type MaybeRefOrGetter } from 'vue'; 
 
export type PopoverPlacement = 
    | 'bottom-start' | 'bottom-end' | 'bottom-center' 
    | 'top-start' | 'top-end' | 'top-center'; 
 
export interface UsePopoverOptions { 
    /** Placement inicial. @default 'bottom-start' */ 
    placement?: MaybeRefOrGetter<PopoverPlacement>; 
    /** Offset vertical entre trigger y panel (px). @default 6 */ 
    offset?: number; 
    /** Auto-flip cuando no cabe en el viewport. @default true */ 
    flip?: boolean; 
    /** Hacer que el panel tenga el mismo ancho del trigger. @default false */ 
    matchTriggerWidth?: MaybeRefOrGetter<boolean>; 
    /** Cerrar al hacer click fuera del trigger y del panel. @default true */
    closeOnClickOutside?: boolean;
    /** Cerrar con Escape. @default true */
    closeOnEscape?: boolean;
    /**
     * Cerrar cuando la página hace scroll (fuera del panel). @default true
     * Con `false` el popover se reposiciona en vez de cerrarse — útil para un
     * dropdown de búsqueda que no debe desaparecer si enfocar el input provoca
     * un pequeño auto-scroll.
     */
    closeOnScroll?: boolean;
    /** Callback cuando se abre. */ 
    onOpen?: () => void; 
    /** Callback cuando se cierra. */ 
    onClose?: () => void; 
} 
 
export interface PopoverPosition {
    top: number;
    left: number;
    width?: number;
    maxHeight?: number;
    /** Placement final (puede diferir del solicitado si hubo flip). */
    placement: PopoverPlacement;
} 
 
/**
 * Floor for the viewport cap. A trigger sitting a few pixels from the bottom
 * edge would otherwise get a panel too short to show anything; below this we
 * let the panel keep its own scroll instead.
 */
const MIN_PANEL_HEIGHT = 120;

/**
 * Content height of a panel, independent of any `max-height` we have already
 * applied to it. `getBoundingClientRect()` reports the *constrained* height
 * once capped, so it can't be used to decide whether the panel still needs a
 * cap. The panel clips vertically and its inner wrapper is the scroll
 * container, so that wrapper's `scrollHeight` (plus the panel's own vertical
 * borders) is the height the panel would take if nothing constrained it.
 */
function naturalHeight(panel: HTMLElement): number {
    const inner = panel.firstElementChild as HTMLElement | null;
    if (!inner) return panel.getBoundingClientRect().height;
    const styles = getComputedStyle(panel);
    const borders =
        Number.parseFloat(styles.borderTopWidth || '0')
        + Number.parseFloat(styles.borderBottomWidth || '0');
    return Math.max(inner.scrollHeight + borders, panel.getBoundingClientRect().height);
}

/**
 * Headless composable para lógica de popover/dropdown:
 * - estado abierto/cerrado 
 * - click outside + Escape 
 * - posición absoluta relativa al viewport (para usar con `position: fixed`) 
 * - auto-flip vertical cuando no cabe 
 * - reposicionado en scroll + resize + ResizeObserver del trigger 
 * 
 * El caller se encarga de renderizar el trigger y el panel; este composable 
 * sólo devuelve refs y estado. 
 */ 
export function usePopover(options: UsePopoverOptions = {}) { 
    const { 
        placement: placementOption = 'bottom-start', 
        offset = 6, 
        flip = true, 
        matchTriggerWidth: matchTriggerWidthOption = false, 
        closeOnClickOutside = true,
        closeOnEscape = true,
        closeOnScroll = true,
        onOpen,
        onClose,
    } = options;
 
    const triggerRef = ref<HTMLElement | null>(null); 
    const panelRef = ref<HTMLElement | null>(null); 
    const isOpen = ref(false); 
 
    const position = ref<PopoverPosition>({ 
        top: 0, 
        left: 0, 
        placement: toValue(placementOption), 
    }); 
 
    const panelStyle = computed(() => {
        const style: Record<string, string> = {
            position: 'fixed',
            top: `${position.value.top}px`,
            left: `${position.value.left}px`,
            zIndex: '1300',
        };
        if (position.value.width !== undefined) {
            style.width = `${position.value.width}px`;
        }
        if (position.value.maxHeight !== undefined) {
            style.maxHeight = `${position.value.maxHeight}px`;
        }
        return style;
    }); 
 
    function measure(): void {
        const trigger = triggerRef.value;
        const panel = panelRef.value;
        if (!trigger) return;

        const initialPlacement = toValue(placementOption);
        const matchTriggerWidth = toValue(matchTriggerWidthOption);

        const tRect = trigger.getBoundingClientRect();
        const pRect = panel?.getBoundingClientRect();
        const panelW = pRect?.width ?? tRect.width;
        // Height the panel *wants*, ignoring any cap we applied on a previous
        // pass. The panel clips its own overflow, so its scroll container holds
        // the real content height — without this, once we cap the panel its
        // measured height equals the cap and every later decision (flip, fit)
        // would be made against our own constraint instead of the content.
        const panelH = panel ? naturalHeight(panel) : 0;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 8;

        let resolved: PopoverPlacement = initialPlacement; 
 
        // Vertical flip check. 
        if (flip) { 
            const wantsTop = initialPlacement.startsWith('top'); 
            const spaceBelow = vh - tRect.bottom - margin; 
            const spaceAbove = tRect.top - margin; 
            if (!wantsTop && spaceBelow < panelH && spaceAbove > spaceBelow) { 
                resolved = initialPlacement.replace('bottom', 'top') as PopoverPlacement; 
            } else if (wantsTop && spaceAbove < panelH && spaceBelow > spaceAbove) { 
                resolved = initialPlacement.replace('top', 'bottom') as PopoverPlacement; 
            } 
        } 
 
        const isBottom = resolved.startsWith('bottom');
        const align = resolved.split('-')[1] as 'start' | 'end' | 'center';

        // Vertical clamp: the panel may never grow past the edge of the
        // viewport, so cap it to whatever room the resolved side leaves. This
        // is applied unconditionally — capping only when the panel currently
        // overflows would make the cap oscillate: capped panel measures as
        // "fits", cap drops, content grows back past the edge, repeat.
        const availableH = isBottom
            ? vh - margin - (tRect.bottom + offset)
            : tRect.top - offset - margin;
        // A trigger scrolled past the edge of the viewport reports space that
        // does not exist on screen (`closeOnScroll: false` keeps the popover
        // open in exactly that state), so the room on the chosen side is not
        // enough on its own — the panel can never be taller than the viewport.
        const maxHeight = Math.max(
            Math.min(availableH, vh - margin * 2),
            MIN_PANEL_HEIGHT,
        );
        const renderedH = Math.min(panelH, maxHeight);

        let top = isBottom ? tRect.bottom + offset : tRect.top - renderedH - offset;

        let left: number; 
        if (align === 'start') left = tRect.left; 
        else if (align === 'end') left = tRect.right - panelW; 
        else left = tRect.left + tRect.width / 2 - panelW / 2; 
 
        // Horizontal clamp (simple, sin variante de flip lateral). 
        if (left + panelW > vw - margin) left = vw - panelW - margin; 
        if (left < margin) left = margin; 
 
        if (top + renderedH > vh - margin) top = Math.max(margin, vh - renderedH - margin);
        if (top < margin) top = margin;

        position.value = {
            top,
            left,
            width: matchTriggerWidth ? tRect.width : undefined,
            maxHeight,
            placement: resolved,
        };
    }

    /* ---------- API ---------- */ 
 
    function open() { 
        if (isOpen.value) return; 
        isOpen.value = true; 
        onOpen?.(); 
        // Medir en el próximo frame, cuando el panel ya esté en el DOM. 
        requestAnimationFrame(() => { 
            measure(); 
            // Segunda pasada para corregir si aparecieron scrollbars. 
            requestAnimationFrame(measure); 
        }); 
    } 
 
    function close() { 
        if (!isOpen.value) return; 
        isOpen.value = false; 
        onClose?.(); 
    } 
 
    function toggle() { 
        isOpen.value ? close() : open(); 
    } 
 
    /* ---------- Listeners ---------- */ 
 
    function onDocumentPointerDown(e: PointerEvent) { 
        if (!isOpen.value || !closeOnClickOutside) return; 
        const target = e.target as Element | null; 
        if (!target) return; 
        if (triggerRef.value?.contains(target)) return; 
        if (panelRef.value?.contains(target)) return; 
        // Click landed inside a *different* popover (e.g. a Select's 
        // dropdown teleported to <body> from a child of our panel). 
        // Treat any click on a `.modo-popover` ancestor as "inside" so 
        // nested popovers don't close their parent. The parent will be 
        // closed normally when the user clicks truly outside. 
        if (typeof (target as Element).closest === 'function' && (target as Element).closest('.modo-popover')) { 
            return; 
        } 
        close(); 
    } 
 
    function onDocumentKeyDown(e: KeyboardEvent) { 
        if (!isOpen.value) return; 
        if (closeOnEscape && e.key === 'Escape') { 
            e.preventDefault(); 
            close(); 
            triggerRef.value?.focus?.(); 
        } 
    } 
 
    function onScrollOrResize() { 
        if (isOpen.value) measure(); 
    } 
 
    /** 
     * Scroll outside del panel → cerrar. Scroll dentro del panel (p. ej. lista 
     * de opciones) → no hace nada. Scroll en window/body → cerrar. 
     * Se usa el evento "scroll" con capture para recibir cualquier scroll. 
     */ 
    function onWindowScroll(e: Event) {
        if (!isOpen.value) return;
        const target = e.target as Node | null;
        if (target && panelRef.value && panelRef.value.contains(target)) {
            // Scroll interno del panel — ignorar.
            return;
        }
        // Scroll inside a nested popover (Select's option list teleported
        // to <body>) should not close us either.
        if (target instanceof Element && target.closest('.modo-popover')) {
            return;
        }
        // Reposition instead of closing when the caller opted out of scroll-close.
        if (!closeOnScroll) { measure(); return; }
        close();
    }
 
    let resizeObserver: ResizeObserver | null = null;

    /**
     * Observe the panel *and* its scroll container. The panel itself stops
     * changing size once it hits the viewport cap, so growing content (async
     * search results, a longer list) would never notify us if we only watched
     * the outer box.
     */
    function observePanel(el: HTMLElement): void {
        resizeObserver?.observe(el);
        const inner = el.firstElementChild;
        if (inner instanceof HTMLElement) resizeObserver?.observe(inner);
    }

    watch(isOpen, (open) => { 
        if (open) { 
            document.addEventListener('pointerdown', onDocumentPointerDown, true); 
            document.addEventListener('keydown', onDocumentKeyDown); 
            // Scroll en cualquier contenedor (incluido window) cierra el popover 
            // salvo si el scroll viene desde dentro del propio panel. 
            window.addEventListener('scroll', onWindowScroll, true); 
            window.addEventListener('resize', onScrollOrResize); 
            if (triggerRef.value && typeof ResizeObserver !== 'undefined') { 
                resizeObserver = new ResizeObserver(onScrollOrResize);
                resizeObserver.observe(triggerRef.value);
                if (panelRef.value) observePanel(panelRef.value);
            }
        } else { 
            document.removeEventListener('pointerdown', onDocumentPointerDown, true); 
            document.removeEventListener('keydown', onDocumentKeyDown); 
            window.removeEventListener('scroll', onWindowScroll, true); 
            window.removeEventListener('resize', onScrollOrResize); 
            resizeObserver?.disconnect(); 
            resizeObserver = null; 
        } 
    }); 
 
    // Si el panel se monta después de open, vincularlo al ResizeObserver. 
    watch(panelRef, (el) => {
        if (isOpen.value && el && resizeObserver) observePanel(el);
    });
 
    // Re-measure when reactive placement / matchTriggerWidth options change 
    // while the popover is open (allows playgrounds to switch placement live). 
    watch( 
        () => [toValue(placementOption), toValue(matchTriggerWidthOption)], 
        () => { if (isOpen.value) measure(); }, 
    ); 
 
    onBeforeUnmount(() => { 
        document.removeEventListener('pointerdown', onDocumentPointerDown, true); 
        document.removeEventListener('keydown', onDocumentKeyDown); 
        window.removeEventListener('scroll', onWindowScroll, true); 
        window.removeEventListener('resize', onScrollOrResize); 
        resizeObserver?.disconnect(); 
    }); 
 
    return { 
        triggerRef: triggerRef as Ref<HTMLElement | null>, 
        panelRef: panelRef as Ref<HTMLElement | null>, 
        isOpen, 
        position, 
        panelStyle, 
        open, 
        close, 
        toggle, 
        measure, 
    }; 
}
