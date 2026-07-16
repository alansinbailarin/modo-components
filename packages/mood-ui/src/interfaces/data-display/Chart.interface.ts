import type { SeriesDef } from '../../components/data-display/chart/useChart';

/**
 * Every chart lives under the single `<Chart type="...">` component.
 *  - Cartesian: sparkline · line · area · bar · scatter
 *  - Polar:     donut · pie · gauge · radial
 *  - Radar:     radar (spider)
 *  - Grid:      heatmap
 */
export type ChartType =
    | 'sparkline'
    | 'line'
    | 'area'
    | 'bar'
    | 'scatter'
    | 'donut'
    | 'pie'
    | 'gauge'
    | 'radial'
    | 'radar'
    | 'heatmap';

/**
 * One component for every chart. Pick the renderer with `type` and pass
 * polymorphic `data` (a `number[]`, a `number[][]` matrix, or row objects with
 * `index` + `series`). Pure SVG — responsive, themeable via the `--chart-N`
 * colorblind palette, with a hover crosshair + shared tooltip built in.
 * Covers sparkline · line · area · bar · scatter · donut · pie · gauge · radial ·
 * radar · heatmap.
 */
export interface Chart {
    /** Which chart to render. @default 'sparkline' */
    type?: ChartType;

    /**
     * Polymorphic data:
     *  - `number[]` — single series (sparkline / one line / bars / slices / radar axes).
     *  - `number[][]` — a matrix of rows × columns (heatmap).
     *  - `Record<string, any>[]` — row objects; pair with `index` (x key) and
     *    `series` (which keys are series).
     */
    data: number[] | number[][] | Record<string, unknown>[];

    /** X-axis key when `data` is row objects. */
    index?: string;
    /** Series to plot from row data: keys, or `{ key, name, color }` objects. */
    series?: SeriesDef[];
    /** X-axis labels for `number[]` data (per point/category/slice/heatmap column). */
    labels?: (string | number)[];
    /** Y-axis (row) labels for a `heatmap`. */
    yLabels?: (string | number)[];
    /** Single-series color: a semantic token, a `--chart-N` index, or raw CSS. @default 'primary' (sparkline) / palette */
    color?: string;

    /* ---- Cartesian (line / area / bar / scatter) ---- */
    /** Stack series (area / bar). @default false */
    stacked?: boolean;
    /** Bar orientation. @default 'vertical' */
    orientation?: 'vertical' | 'horizontal';
    /** Line/area curve. @default 'smooth' */
    curve?: 'smooth' | 'linear' | 'step';
    /** Fill under a line (turns `line` into an area). @default true for sparkline */
    area?: boolean;
    /** Show a dot on every data point (line/area). @default false */
    showDots?: boolean;
    /** Show gridlines. @default true (full charts) */
    showGrid?: boolean;
    /** Show the x axis. @default true (full charts) */
    showXAxis?: boolean;
    /** Show the y axis. @default true (full charts) */
    showYAxis?: boolean;
    /** Show the legend. @default true when there are ≥ 2 series */
    showLegend?: boolean;
    /** Fixed y domain (else derived, baseline at 0). */
    yMin?: number;
    yMax?: number;
    /** Bridge gaps across `null` values instead of breaking the line. @default false */
    connectNulls?: boolean;
    /** Format a value (tooltip + y ticks). Defaults to a compact number. */
    valueFormat?: (value: number, index: number) => string;
    /** Format an x tick / category. */
    xFormat?: (x: string | number, index: number) => string;
    /** Reference / threshold lines. */
    referenceLines?: { value: number; label?: string; color?: string; axis?: 'x' | 'y' }[];

    /* ---- Sparkline extras ---- */
    /** Smooth alias (sparkline). Prefer `curve`. @default true */
    smooth?: boolean;
    /** Stroke width. @default 2 */
    strokeWidth?: number;
    /** Marker dot on the last point (sparkline). @default false */
    showDot?: boolean;
    /** Fixed scale bounds (sparkline). */
    min?: number;
    max?: number;

    /* ---- Polar (donut / pie / gauge) ---- */
    /** Donut hole size as a fraction of the radius (0 = pie). @default 0.62 for donut */
    innerRadius?: number;
    /** Center label + value shown inside a donut. */
    centerLabel?: string;
    centerValue?: string;
    /** Gauge total (denominator). @default sum of data */
    gaugeMax?: number;

    /* ---- Radar / Heatmap ---- */
    /** Render each cell's value inside the cell (heatmap). @default false */
    showValues?: boolean;

    /* ---- Common ---- */
    /** Height in px. Width fills the container. @default 40 (sparkline) / 220 (full) */
    height?: number;
    /** Hover crosshair + tooltip. @default true */
    hover?: boolean;
    /** Accessible label for the graphic. */
    ariaLabel?: string;
}
