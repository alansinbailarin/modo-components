import { computed, type ComputedRef } from 'vue'; 
import { useModoConfig } from './useModoConfig'; 
 
export type CalendarColor = 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
export type CalendarRadius = 'none' | 'small' | 'medium' | 'large' | 'full'; 
export type DayNameCase = 'upper' | 'lower' | 'capitalize' | 'normal'; 
 
export interface CalendarThemeInput { 
    color: () => CalendarColor | undefined; 
    radius: () => CalendarRadius | undefined; 
    dayNameCase?: () => DayNameCase; 
} 
 
export interface CalendarTheme { 
    todayTextClass: ComputedRef<string>; 
    todayBgClass: ComputedRef<string>; 
    rangeSelectClass: ComputedRef<string>; 
    focusRingColorClass: ComputedRef<string>; 
    highlightDotClass: ComputedRef<string>; 
    containerRadiusClass: ComputedRef<string>; 
    eventRadiusClass: ComputedRef<string>;
    /** Whether an event's left colour rule reads as a bar at the current radius. */
    showEventAccent: ComputedRef<boolean>;
    pillRadiusClass: ComputedRef<string>;
    dayNameCaseClass: ComputedRef<string>; 
    resolvedColor: ComputedRef<CalendarColor>; 
} 
 
const TEXT: Record<CalendarColor, string> = { 
    default: 'text-foreground', 
    primary: 'text-primary', 
    danger: 'text-destructive', 
    success: 'text-success', 
    warning: 'text-warning', 
}; 
 
const BG: Record<CalendarColor, string> = { 
    default: 'bg-foreground text-background', 
    primary: 'bg-primary text-primary-foreground', 
    danger: 'bg-destructive text-destructive-foreground', 
    success: 'bg-success text-success-foreground', 
    warning: 'bg-warning text-warning-foreground', 
}; 
 
const RANGE: Record<CalendarColor, string> = { 
    default: 'border-foreground/40 bg-foreground/10', 
    primary: 'border-primary/50 bg-primary/10', 
    danger: 'border-destructive/50 bg-destructive/10', 
    success: 'border-success/50 bg-success/10', 
    warning: 'border-warning/50 bg-warning/10', 
}; 
 
const RING: Record<CalendarColor, string> = { 
    default: 'ring-ring', 
    primary: 'ring-primary', 
    danger: 'ring-destructive', 
    success: 'ring-success', 
    warning: 'ring-warning', 
}; 
 
const DOT: Record<CalendarColor, string> = { 
    default: 'bg-muted-foreground', 
    primary: 'bg-primary', 
    danger: 'bg-destructive', 
    success: 'bg-success', 
    warning: 'bg-warning', 
}; 
 
const CONTAINER: Record<CalendarRadius, string> = { 
    none: 'rounded-none', 
    small: 'rounded', 
    medium: 'rounded-md', 
    large: 'rounded-xl', 
    full: 'rounded-3xl', 
}; 
 
const EVENT: Record<CalendarRadius, string> = { 
    none: 'rounded-none', 
    small: 'rounded-sm', 
    medium: 'rounded', 
    large: 'rounded-md', 
    full: 'rounded-xl', 
}; 
 
const PILL: Record<CalendarRadius, string> = { 
    none: 'rounded-none', 
    small: 'rounded-sm', 
    medium: 'rounded-md', 
    large: 'rounded-full', 
    full: 'rounded-full', 
}; 
 
/**
 * Radii at which an event still has enough straight left edge to carry the
 * colour rule. Past these, `border-radius` sweeps the one-sided border around
 * the corner arc and it renders as a crescent hugging the side of the event
 * instead of a bar; the translucent fill and the text colour carry the event
 * colour on their own there.
 */
const EVENT_ACCENT_RADII: CalendarRadius[] = ['none', 'small', 'medium'];

const DAY_NAME_CASE: Record<DayNameCase, string> = {
    upper: 'uppercase', 
    lower: 'lowercase', 
    capitalize: 'capitalize', 
    normal: 'normal-case', 
}; 
 
export function useCalendarTheme(input: CalendarThemeInput): CalendarTheme { 
    const cfg = useModoConfig(); 
    const resolvedColor = computed<CalendarColor>(() => { 
        const local = input.color(); 
        if (local && local !== 'default') return local; 
        return (cfg?.value.color as CalendarColor) ?? 'default'; 
    }); 
    const resolvedRadius = computed<CalendarRadius>(() => { 
        const local = input.radius(); 
        return local ?? (cfg?.value.radius as CalendarRadius) ?? 'medium'; 
    }); 
 
    const todayTextClass = computed(() => TEXT[resolvedColor.value] ?? TEXT.default); 
    const todayBgClass = computed(() => BG[resolvedColor.value] ?? BG.default); 
    const rangeSelectClass = computed(() => RANGE[resolvedColor.value] ?? RANGE.default); 
    const focusRingColorClass = computed(() => RING[resolvedColor.value] ?? RING.default); 
    const highlightDotClass = computed(() => DOT[resolvedColor.value] ?? DOT.default); 
    const containerRadiusClass = computed(() => CONTAINER[resolvedRadius.value] ?? CONTAINER.large); 
    const eventRadiusClass = computed(() => EVENT[resolvedRadius.value] ?? EVENT.small); 
    const pillRadiusClass = computed(() => PILL[resolvedRadius.value] ?? PILL.full);
    const showEventAccent = computed(() => EVENT_ACCENT_RADII.includes(resolvedRadius.value));
    const dayNameCaseClass = computed(() => DAY_NAME_CASE[input.dayNameCase?.() ?? 'upper'] ?? DAY_NAME_CASE.upper); 
 
    return { 
        todayTextClass, 
        todayBgClass, 
        rangeSelectClass, 
        focusRingColorClass, 
        highlightDotClass, 
        containerRadiusClass,
        eventRadiusClass,
        showEventAccent,
        pillRadiusClass,
        dayNameCaseClass, 
        resolvedColor, 
    }; 
}
