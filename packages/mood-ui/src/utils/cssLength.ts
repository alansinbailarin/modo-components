/**
 * Normalise a size prop to a CSS length: bare numbers are pixels, strings pass
 * through untouched so callers can use any unit (`'70vh'`, `'40rem'`, …).
 */
export function toCssLength(value: number | string | null | undefined): string | undefined {
    if (value == null || value === "") return undefined;
    return typeof value === "number" ? `${value}px` : value;
}
