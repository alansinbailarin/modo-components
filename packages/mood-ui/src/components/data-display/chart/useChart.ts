/**
 * Shared chart math + normalization, used by the internal Cartesian / Polar
 * chart renderers behind the public `<Chart type>` component.
 */

export interface ChartPoint {
    x: number;
    y: number;
}

/** A normalized series: one line/area/bar group. */
export interface NormSeries {
    key: string;
    name: string;
    color: string;
    values: (number | null)[];
}

export interface NormData {
    categories: (string | number)[];
    series: NormSeries[];
}

export type SeriesDef = string | { key: string; name?: string; color?: string };

const SEMANTIC: Record<string, string> = {
    default: 'var(--foreground)',
    primary: 'var(--primary)',
    success: 'var(--success)',
    danger: 'var(--destructive)',
    warning: 'var(--warning)',
    info: 'var(--info)',
};

/** Resolve a color: a semantic token name → its CSS var; a palette index →
 *  `--chart-N`; anything else is treated as a raw CSS color. */
export function resolveColor(color: string | undefined, index = 0): string {
    if (!color) return `var(--chart-${(index % 6) + 1})`;
    if (SEMANTIC[color]) return SEMANTIC[color];
    if (/^chart-[1-6]$/.test(color)) return `var(--${color})`;
    return color; // raw CSS color
}

interface NormalizeOpts {
    index?: string;
    series?: SeriesDef[];
    labels?: (string | number)[];
    color?: string;
}

/** Turn the polymorphic `data` prop into `{ categories, series }`. */
export function normalize(
    data: number[] | Record<string, unknown>[],
    opts: NormalizeOpts = {},
): NormData {
    const { index, series, labels, color } = opts;
    const arr = data ?? [];

    // number[] → a single series
    if (arr.length === 0 || typeof arr[0] === 'number') {
        const values = arr as number[];
        return {
            categories: labels ?? values.map((_, i) => i),
            series: [{ key: 'value', name: 'value', color: resolveColor(color, 0), values }],
        };
    }

    // rows[] + index (x key) + series (keys or defs)
    const rows = arr as Record<string, unknown>[];
    const cats = index ? rows.map((r) => r[index] as string | number) : rows.map((_, i) => i);
    let defs: { key: string; name?: string; color?: string }[];
    if (series && series.length) {
        defs = series.map((s) => (typeof s === 'string' ? { key: s } : s));
    } else {
        const first = rows[0] ?? {};
        defs = Object.keys(first)
            .filter((k) => k !== index && typeof first[k] === 'number')
            .map((k) => ({ key: k }));
    }
    return {
        categories: cats,
        series: defs.map((s, i) => ({
            key: s.key,
            name: s.name ?? s.key,
            color: s.color ? resolveColor(s.color, i) : `var(--chart-${(i % 6) + 1})`,
            values: rows.map((r) => {
                const v = r[s.key];
                return typeof v === 'number' ? v : null;
            }),
        })),
    };
}

/** Min/max across all series values (ignoring nulls). */
export function extent(series: NormSeries[], includeZero = true): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (const s of series) {
        for (const v of s.values) {
            if (v == null) continue;
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }
    if (!isFinite(min)) { min = 0; max = 1; }
    if (includeZero) { min = Math.min(min, 0); max = Math.max(max, 0); }
    if (min === max) { max = min + 1; }
    return [min, max];
}

/** Column-wise sums, for stacked charts / totals. */
export function stackedExtent(series: NormSeries[]): [number, number] {
    const n = series[0]?.values.length ?? 0;
    let max = 0;
    let min = 0;
    for (let i = 0; i < n; i++) {
        let pos = 0;
        let neg = 0;
        for (const s of series) {
            const v = s.values[i] ?? 0;
            if (v >= 0) pos += v; else neg += v;
        }
        if (pos > max) max = pos;
        if (neg < min) min = neg;
    }
    if (min === max) max = min + 1;
    return [min, max];
}

/** "Nice" axis ticks on a 1/2/5×10ⁿ lattice covering [min,max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
    if (min === max) { min -= 1; max += 1; }
    const range = max - min;
    const rough = range / Math.max(1, count);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * pow;
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = niceMin; v <= niceMax + step * 1e-6; v += step) {
        ticks.push(Number(v.toFixed(10)));
    }
    return ticks;
}

/** Compact number formatter: 1_200 → "1.2k", 3_400_000 → "3.4M". */
export function compact(v: number): string {
    const abs = Math.abs(v);
    if (abs >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (abs >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (abs >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(Number(v.toFixed(2)));
}

/* ---------- Path builders ---------- */

/** Build a line path through points, with curve style. Handles null gaps by
 *  breaking the path (unless `connect`). */
export function linePath(
    pts: (ChartPoint | null)[],
    curve: 'smooth' | 'linear' | 'step' = 'smooth',
    connect = false,
): string {
    const segs: ChartPoint[][] = [];
    let cur: ChartPoint[] = [];
    for (const p of pts) {
        if (p == null) {
            if (!connect) { if (cur.length) segs.push(cur); cur = []; }
            continue;
        }
        cur.push(p);
    }
    if (cur.length) segs.push(cur);

    return segs.map((seg) => segToPath(seg, curve)).join(' ');
}

function segToPath(seg: ChartPoint[], curve: 'smooth' | 'linear' | 'step'): string {
    if (seg.length === 0) return '';
    if (seg.length === 1) return `M ${f(seg[0].x)} ${f(seg[0].y)}`;
    if (curve === 'linear') {
        return `M ${f(seg[0].x)} ${f(seg[0].y)} ` + seg.slice(1).map((p) => `L ${f(p.x)} ${f(p.y)}`).join(' ');
    }
    if (curve === 'step') {
        let d = `M ${f(seg[0].x)} ${f(seg[0].y)}`;
        for (let i = 1; i < seg.length; i++) {
            const midX = (seg[i - 1].x + seg[i].x) / 2;
            d += ` L ${f(midX)} ${f(seg[i - 1].y)} L ${f(midX)} ${f(seg[i].y)} L ${f(seg[i].x)} ${f(seg[i].y)}`;
        }
        return d;
    }
    // smooth: Catmull-Rom → cubic Bézier
    let d = `M ${f(seg[0].x)} ${f(seg[0].y)}`;
    for (let i = 0; i < seg.length - 1; i++) {
        const p0 = seg[i - 1] ?? seg[i];
        const p1 = seg[i];
        const p2 = seg[i + 1];
        const p3 = seg[i + 2] ?? p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)}`;
    }
    return d;
}

/** Arc path for donut/pie/gauge slices (SVG A command). */
export function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number): string {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + rOuter * Math.cos(a0);
    const y0 = cy + rOuter * Math.sin(a0);
    const x1 = cx + rOuter * Math.cos(a1);
    const y1 = cy + rOuter * Math.sin(a1);
    if (rInner <= 0) {
        return `M ${cx} ${cy} L ${f(x0)} ${f(y0)} A ${f(rOuter)} ${f(rOuter)} 0 ${large} 1 ${f(x1)} ${f(y1)} Z`;
    }
    const xi0 = cx + rInner * Math.cos(a1);
    const yi0 = cy + rInner * Math.sin(a1);
    const xi1 = cx + rInner * Math.cos(a0);
    const yi1 = cy + rInner * Math.sin(a0);
    return (
        `M ${f(x0)} ${f(y0)} A ${f(rOuter)} ${f(rOuter)} 0 ${large} 1 ${f(x1)} ${f(y1)} ` +
        `L ${f(xi0)} ${f(yi0)} A ${f(rInner)} ${f(rInner)} 0 ${large} 0 ${f(xi1)} ${f(yi1)} Z`
    );
}

function f(n: number): string {
    return Number.isFinite(n) ? n.toFixed(2) : '0';
}
