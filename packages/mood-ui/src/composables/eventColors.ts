export type EventColor = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'purple' | 'pink';

/** Translucent fill + text colour, soft variant used in timed grids. */
const FILL: Record<EventColor, string> = {
    default: 'bg-foreground/10 text-foreground',
    primary: 'bg-primary/15 text-primary',
    danger: 'bg-destructive/15 text-destructive',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    info: 'bg-info/15 text-info',
    purple: 'bg-purple/15 text-purple',
    pink: 'bg-pink/15 text-pink',
};

/** Same, a touch more opaque so compact MonthView pills stay readable. */
const FILL_STRONG: Record<EventColor, string> = {
    default: 'bg-foreground/15 text-foreground',
    primary: 'bg-primary/20 text-primary',
    danger: 'bg-destructive/20 text-destructive',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    info: 'bg-info/20 text-info',
    purple: 'bg-purple/20 text-purple',
    pink: 'bg-pink/20 text-pink',
};

/**
 * Left colour rule. Kept separate from the fill because it only works on a
 * squarish event: `border-radius` sweeps a one-sided border around the corner
 * arc, so at a large radius the rule tapers into a crescent instead of reading
 * as a bar — see `EVENT_ACCENT_RADII` in `useCalendarTheme`.
 */
const ACCENT: Record<EventColor, string> = {
    default: 'border-l-2 border-muted-foreground',
    primary: 'border-l-2 border-primary',
    danger: 'border-l-2 border-destructive',
    success: 'border-l-2 border-success',
    warning: 'border-l-2 border-warning',
    info: 'border-l-2 border-info',
    purple: 'border-l-2 border-purple',
    pink: 'border-l-2 border-pink',
};

const compose = (
    fills: Record<EventColor, string>,
    c: EventColor | null | undefined,
    accent: boolean,
) => {
    const key = c ?? 'primary';
    return accent ? `${fills[key]} ${ACCENT[key]}` : fills[key];
};

/**
 * Soft variant used in timed grids (WeekView, DayView, Scheduler).
 * Translucent fills (`/15`) so the underlying grid lines stay visible —
 * matches the look of `colorHex` events that use `rgba(..., 0.12)`.
 */
export const eventColorClass = (c?: EventColor | null, accent = true) =>
    compose(FILL, c, accent);

/**
 * Stronger variant used in MonthView (pill-like events) — slightly more
 * opaque to stay readable in compact pills.
 */
export const eventColorClassStrong = (c?: EventColor | null, accent = true) =>
    compose(FILL_STRONG, c, accent);

export const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
