/**
 * Surface for a consumer-provided `#event-tooltip`.
 *
 * `CalendarEventTooltip` only positions its box — the card lives inside the
 * default slot's fallback content, so a custom `#event-tooltip` replaced the
 * card along with the text and left the content floating over the grid. The
 * views wrap a provided slot in this surface instead.
 *
 * It uses the popover tokens rather than the built-in tooltip's inverted fill:
 * custom content brings its own text colours, which would vanish against a
 * dark background.
 */
export const CALENDAR_TOOLTIP_SURFACE =
    'bg-popover text-popover-foreground border border-border rounded-md shadow-lg px-3 py-2 max-w-xs';
