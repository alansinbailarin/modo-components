import { computed, inject, useId, toValue, type ComputedRef, type InjectionKey, type MaybeRefOrGetter, type Ref } from 'vue';
import { useResolvedHalo } from './useModoConfig';
import type { ModoHalo } from '../config/ModoConfig';
import { useResolvedColor, useResolvedRadius } from './useModoConfig';

/**
 * Injection key provided by FormField so child form controls can:
 * 1. Use the FormField's id as their own (connecting `<label for="...">` automatically).
 * 2. Suppress the "no label" a11y warning — the FormField already renders a visible label.
 */
export const FORM_FIELD_ID_KEY: InjectionKey<Ref<string>> = Symbol('FormFieldId');
 
/** 
 * Props del campo de formulario que necesita `useFieldState`. 
 * Se definen aquí para que cualquier componente (Input, Textarea, Password…) 
 * pueda extenderlas y pasar su reactive `props` directamente. 
 */ 
export interface FieldStateSource { 
    modelValue?: unknown; 
    id?: string; 
    label?: string; 
    ariaLabel?: string; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    errorText?: string; 
    helperText?: string; 
    /** Cuando es true, fuerza estado inválido sin renderizar errorText. Útil al envolver con FormField. */ 
    invalid?: boolean; 
    /** IDs adicionales para concatenar en aria-describedby (ej. provistos por un wrapper). */ 
    ariaDescribedBy?: string; 
    maxLength?: number; 
    showCounter?: boolean; 
    disabled?: boolean; 
    loading?: boolean; 
} 
 
export interface UseFieldStateOptions { 
    /** Nombre del componente para el warning DEV. */ 
    componentName: string; 
    /** Prefijo para el id autogenerado (ej. 'modo-input'). */ 
    idPrefix: string; 
} 
 
/** 
 * Estado compartido entre campos de formulario (Input, Textarea, Password…). 
 * 
 * Resuelve: 
 * - `fieldId` (prop.id o autogenerado). 
 * - Color/radius resueltos desde el provider. 
 * - `stateColor` (danger si hay error, si no el color resuelto). 
 * - `describedBy` con los IDs de helper/error/counter. 
 * - Contador y flags derivadas. 
 * - Warning DEV cuando falta label/ariaLabel. 
 */ 
export function useFieldState(
    props: FieldStateSource,
    options: UseFieldStateOptions,
) {
    const autoId = useId();
    // If a parent FormField provides its id, use it — this connects the FormField's
    // `<label for="...">` to this input automatically without needing v-slot binding.
    const formFieldId = inject(FORM_FIELD_ID_KEY, null);
    const fieldId = computed(() => props.id ?? formFieldId?.value ?? `${options.idPrefix}-${autoId}`);
 
    const color = useResolvedColor(() => props.color); 
    const radius = useResolvedRadius(() => props.radius); 
 
    const hasError = computed(() => !!props.errorText || !!props.invalid); 
    const isDisabled = computed(() => !!props.disabled || !!props.loading); 
 
    const stateColor = computed(() => 
        hasError.value ? 'danger' : color.value, 
    ) as ComputedRef<'default' | 'primary' | 'danger' | 'success' | 'warning'>; 
 
    const hasValue = computed(() => { 
        const v = props.modelValue; 
        return v !== null && v !== undefined && String(v).length > 0; 
    }); 
 
    const currentLength = computed(() => String(props.modelValue ?? '').length); 
    const showCounterEffective = computed( 
        () => !!props.showCounter && !!props.maxLength, 
    ); 
    const counterOverflow = computed( 
        () => !!props.maxLength && currentLength.value >= props.maxLength, 
    ); 
 
    const errorId = computed(() => `${fieldId.value}-error`); 
    const helperId = computed(() => `${fieldId.value}-helper`); 
    const counterId = computed(() => `${fieldId.value}-counter`); 
 
    const describedBy = computed(() => { 
        const ids: string[] = []; 
        if (hasError.value && props.errorText) ids.push(errorId.value); 
        else if (props.helperText) ids.push(helperId.value); 
        if (showCounterEffective.value) ids.push(counterId.value); 
        if (props.ariaDescribedBy) ids.push(props.ariaDescribedBy); 
        return ids.length ? ids.join(' ') : undefined; 
    }); 
 
    // Warn only when there is genuinely no accessible label: no label/ariaLabel prop
    // AND no parent FormField providing one (detected via injection key).
    if (import.meta.env.DEV && !props.label && !props.ariaLabel && !props.id && !formFieldId) {
        console.warn(
            `[mood-ui ${options.componentName}] Se requiere \`label\` o \`ariaLabel\` para accesibilidad.`,
        );
    }
 
    return { 
        fieldId, 
        color, 
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
    }; 
} 
 
export type FieldVariant = 'outline' | 'filled' | 'ghost'; 
 
export interface UseFieldClassesSource { 
    variant: MaybeRefOrGetter<FieldVariant>; 
    stateColor: MaybeRefOrGetter<'default' | 'primary' | 'danger' | 'success' | 'warning'>; 
    hasError: MaybeRefOrGetter<boolean>; 
    radius: MaybeRefOrGetter<'none' | 'small' | 'medium' | 'large' | 'full'>; 
    /** radius utility para 'full' (Input usa 'full', Textarea usa '2xl'). */ 
    fullRadiusClass?: string; 
    /** 
     * Cuando es true, fuerza los estilos de focus (halo + borde) aunque 
     * el foco esté fuera del wrapper. Útil para Select/Combobox cuando 
     * el popover teleportado roba el foco pero el campo sigue "activo". 
     */ 
    forceFocus?: MaybeRefOrGetter<boolean>; 
    /** 
     * Estilo del halo del campo. Si no se pasa, se usa el valor resuelto 
     * vía ModoProvider/useResolvedHalo. 
     * - `'tinted'`: tintado al color (default) 
     * - `'neutral'`: siempre gris 
     * - `'off'`: sin halo persistente (solo focus-visible ring a11y) 
     */ 
    halo?: MaybeRefOrGetter<ModoHalo | undefined>; 
} 

export const FIELD_AFFORDANCE_ICON_BY_COLOR: Record<string, string> = {
    default: 'modo-affordance-icon',
    primary: 'modo-affordance-icon',
    danger: 'text-destructive/85',
    success: 'modo-affordance-icon',
    warning: 'modo-affordance-icon',
};

export const FIELD_AFFORDANCE_ACTION_BY_COLOR: Record<string, string> = {
    default: 'modo-affordance-action',
    primary: 'modo-affordance-action',
    danger: 'text-destructive/80 hover:text-destructive',
    success: 'modo-affordance-action',
    warning: 'modo-affordance-action',
};
 
const FOCUS_BORDER_BY_COLOR: Record<string, string> = { 
    default: 'focus-within:border-foreground/50', 
    primary: 'focus-within:border-primary/60', 
    danger: 'focus-within:border-destructive/60', 
    success: 'focus-within:border-success/60', 
    warning: 'focus-within:border-warning/60', 
}; 
 
const FORCED_BORDER_BY_COLOR: Record<string, string> = { 
    default: 'border-foreground/50', 
    primary: 'border-primary/60', 
    danger: 'border-destructive/60', 
    success: 'border-success/60', 
    warning: 'border-warning/60', 
}; 
 
/**
 * THE single focus indicator for the whole system. Every interactive component
 * uses this exact ring so tabbing through a form/toolbar shows one consistent
 * focus — a soft ring, no offset gap. `FIELD_FOCUS_RING` is the `focus-within`
 * variant for field wrappers; `CONTROL_FOCUS_RING` is the `focus-visible`
 * variant for buttons and other single-element controls.
 */
export const MODO_FOCUS_RING = 'ring-2 ring-ring/60';
export const FIELD_FOCUS_RING = 'focus-within:ring-2 focus-within:ring-ring/60';
export const CONTROL_FOCUS_RING =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60';

/**
 * Resuelve las clases de wrapper (variante + halo + error) y el radius
 * para cualquier campo de formulario que siga el patrón Input/Textarea.
 */
export function useFieldClasses(source: UseFieldClassesSource) {
    const resolvedHalo = useResolvedHalo(() => { 
        const local = source.halo ? toValue(source.halo) : undefined; 
        return local; 
    }); 
 
    const wrapperVariantClasses = computed(() => {
        const variant = toValue(source.variant);
        const stateColor = toValue(source.stateColor);
        const hasError = toValue(source.hasError);
        const forceFocus = source.forceFocus ? toValue(source.forceFocus) : false;
        const halo = resolvedHalo.value;
        const errBorder = hasError ? 'border-destructive' : '';
        const focusBorder = FOCUS_BORDER_BY_COLOR[stateColor];
        const forcedBorder = forceFocus ? FORCED_BORDER_BY_COLOR[stateColor] : '';
        const forcedBg = forceFocus ? 'bg-background' : '';

        // The persistent halo (idle ring) is opt-in via `neutral`/`tinted`.
        // The FOCUS ring is the SAME everywhere (see MODO_FOCUS_RING) so a field
        // and a button show an identical indicator when you tab to them.
        const idleRing = halo === 'off' ? '' : 'ring-4 ring-border/25';
        const focusRingUtil = FIELD_FOCUS_RING;
        const forcedRingUtil = forceFocus ? MODO_FOCUS_RING : '';

        switch (variant) {
            case 'filled':
                return [
                    'bg-muted border border-transparent',
                    idleRing,
                    'focus-within:bg-background',
                    focusBorder,
                    focusRingUtil,
                    forceFocus ? `${forcedRingUtil} ${forcedBorder} ${forcedBg}` : forcedBg,
                    errBorder,
                ].join(' ');
            case 'ghost':
                return [
                    'bg-transparent border-b border-border rounded-none',
                    focusBorder,
                    forcedBorder,
                    hasError ? 'border-destructive' : '',
                ].join(' ');
            case 'outline':
            default:
                return [
                    'bg-background border border-input',
                    idleRing,
                    focusBorder,
                    focusRingUtil,
                    forcedRingUtil,
                    forcedBorder,
                    errBorder,
                ].join(' ');
        }
    });
 
    const radiusClasses = computed(() => { 
        const variant = toValue(source.variant); 
        if (variant === 'ghost') return ''; 
        const radius = toValue(source.radius); 
        switch (radius) { 
            case 'none': return 'rounded-none'; 
            case 'small': return 'rounded-sm'; 
            case 'large': return 'rounded-xl'; 
            // `rounded-full` compiles to an effectively-infinite radius which
            // Chrome clamps differently for box-shadows than for the border,
            // making any ring render boxy corners. A large *finite* radius is a
            // visually-identical pill that shadows follow correctly.
            case 'full': return source.fullRadiusClass ?? 'rounded-[999px]';
            case 'medium': 
            default: return 'rounded-md'; 
        } 
    }); 
 
    return { wrapperVariantClasses, radiusClasses }; 
}
