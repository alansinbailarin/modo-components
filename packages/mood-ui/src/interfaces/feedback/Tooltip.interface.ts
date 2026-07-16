import type { ModoSize } from '../../config/ModoConfig';
export type TooltipPlacement = 
    | 'top' | 'top-start' | 'top-end' 
    | 'bottom' | 'bottom-start' | 'bottom-end' 
    | 'left' | 'left-start' | 'left-end' 
    | 'right' | 'right-start' | 'right-end'; 
 
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual'; 
 
export interface Tooltip { 
    /** Contenido textual. Si se necesita markup usar slot `#content`. */ 
    content?: string; 
 
    /** Posición del tooltip respecto al trigger. @default 'top' */ 
    placement?: TooltipPlacement; 
 
    /** Offset en px desde el trigger. @default 8 */ 
    offset?: number; 
 
    /** Cómo se abre el tooltip. @default ['hover','focus'] */ 
    trigger?: TooltipTrigger | TooltipTrigger[]; 
 
    /** Delay al abrir (ms). @default 200 */ 
    openDelay?: number; 
 
    /** Delay al cerrar (ms). @default 100 */ 
    closeDelay?: number; 
 
    /** Muestra flecha apuntando al trigger. @default true */ 
    arrow?: boolean; 
 
    /** Color del tooltip. @default 'default' (foreground oscuro) */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'inverted'; 
 
    /** Tamaño. @default 'medium' */ 
    size?: ModoSize; 
 
    /** Radius. @default 'medium' */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** Deshabilitado — no se abre. */ 
    disabled?: boolean; 
 
    /** v-model:open — permite controlarlo externamente (trigger='manual'). */
    open?: boolean;

    /**
     * Virtual anchor: a viewport point `{ x, y }` (client coordinates) to
     * position the tooltip against instead of the wrapped trigger element.
     * Combine with a controlled `open` to drive a tooltip that follows a moving
     * target — e.g. the hovered data point of a chart, or a cursor. The default
     * slot can be empty in this mode. Re-positions whenever the point changes.
     */
    anchor?: { x: number; y: number } | null;
 
    /** Ancho máximo en px. @default 260 */ 
    maxWidth?: number; 
 
    /** ID opcional — útil para aria-describedby. */ 
    id?: string; 
 
    /** 
     * Extra classes for the trigger wrapper `<span>`. Useful when the 
     * trigger needs to fill its parent (e.g. `'!flex !w-full'`) since 
     * the wrapper defaults to `inline-flex` for natural sizing. 
     */ 
    wrapperClass?: string; 
}
