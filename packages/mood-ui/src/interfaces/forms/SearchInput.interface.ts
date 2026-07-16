import type { Component } from 'vue';
import type { ModoSize } from '../../config/ModoConfig';

/** One row in the SearchInput results dropdown. */
export interface SearchResultItem {
    /** Stable id; defaults to the index when omitted. */
    id?: string | number;
    /** Primary text. */
    label: string;
    /** Optional secondary text shown muted under the label. */
    description?: string;
    /** Leading icon (Vue component). Decorative. */
    icon?: Component;
    /** Optional group header this item belongs to. Consecutive items sharing a
     *  group render one header above the first of the run (e.g. "Clients", "Go to"). */
    group?: string;
    /** Optional right-aligned hint (e.g. '⌘D'). Purely visual. */
    shortcut?: string;
    /** Render the row as an `<a>` link instead of a button. */
    href?: string;
    /** Open `href` in a new tab. */
    external?: boolean;
    /** Dim + disable the row. */
    disabled?: boolean;
}

export interface SearchInput {
    /** v-model */
    modelValue?: string | null;

    /**
     * Results to show in a dropdown under the input. When provided (even an
     * empty array) — or when the `#results` slot is used — the field renders a
     * popover with the results. Filtering/async is up to the host; feed it via
     * the `search` event (optionally debounced) and update `items`.
     */
    items?: SearchResultItem[];
    /** Controls the results popover (optional `v-model:open`). */
    open?: boolean;
    /** Empty-state text shown when `items` is `[]`. */
    emptyText?: string;
    /** Results popover placement. @default 'bottom-start' */
    resultsPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
 
    /** Etiqueta visible. */ 
    label?: string; 
    /** Placeholder. @default 'Search…' */ 
    placeholder?: string; 
    /** Texto de ayuda (oculto si hay `errorText`). */ 
    helperText?: string; 
    /** Mensaje de error. */ 
    errorText?: string; 
 
    /** Estilo visual. */ 
    variant?: 'outline' | 'filled' | 'ghost'; 
    /** Familia semántica para foco/acento. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tamaño. */
    size?: ModoSize; 
    /** Radio de esquinas. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Estilo del halo persistente. Hereda del ModoProvider si se omite. */ 
    halo?: 'tinted' | 'neutral' | 'off'; 
 
    /** Aplica w-full al root. */ 
    fullWidth?: boolean; 
 
    /** Deshabilitado. */ 
    disabled?: boolean; 
    /** Solo lectura. */ 
    readonly?: boolean; 
    /** Requerido. */ 
    required?: boolean; 
    /** Estado cargando (muestra spinner en lugar del clear). */ 
    loading?: boolean; 
 
    /** Longitud máxima. */ 
    maxLength?: number; 
    /** Muestra contador (requiere `maxLength`). */ 
    showCounter?: boolean; 
 
    /** 
     * Tiempo (ms) de debounce antes de emitir `search` mientras se escribe. 
     * - `0` o `undefined` = solo emite `search` al presionar Enter. 
     * @default 0 
     */ 
    debounce?: number; 
 
    /** 
     * Atajo de teclado global que enfoca el input. Se muestra como hint `<kbd>` 
     * a la derecha cuando el input no tiene foco ni valor. 
     * 
     * Formatos aceptados: 
     * - Tecla única: `'/'`, `'k'` 
     * - Combinación: `'cmd+k'` (auto-traduce a Ctrl+K en Windows) 
     */ 
    shortcut?: string; 
 
    /** id (autogenerado si se omite). */ 
    id?: string; 
    /** name HTML. */ 
    name?: string; 
    /** autofocus HTML. */ 
    autofocus?: boolean; 
 
    /** Accessible name cuando no hay `label` visible. */ 
    ariaLabel?: string; 
}
