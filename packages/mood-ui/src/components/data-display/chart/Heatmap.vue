<template>
    <div class="modo-chart-heatmap w-full flex flex-col">
        <div
            ref="plotEl"
            class="modo-chart relative w-full"
            :style="{ height: `${height}px` }"
            @pointermove="onMove"
            @pointerleave="onLeave"
        >
            <svg
                v-if="w > 1"
                :width="w"
                :height="height"
                :viewBox="`0 0 ${w} ${height}`"
                class="block"
                role="img"
                :aria-label="resolvedAriaLabel"
            >
                <!-- y-axis labels -->
                <text
                    v-for="(yl, r) in yLabels"
                    :key="'yl' + r"
                    :x="padL - 8"
                    :y="cellY(r) + cellH / 2"
                    text-anchor="end"
                    dominant-baseline="middle"
                    class="fill-muted-foreground"
                    style="font-size: 11px"
                >
                    {{ yl }}
                </text>

                <!-- x-axis labels -->
                <text
                    v-for="(xl, c) in xLabels"
                    :key="'xl' + c"
                    :x="cellX(c) + cellW / 2"
                    :y="height - padB + 14"
                    text-anchor="middle"
                    class="fill-muted-foreground"
                    style="font-size: 11px"
                >
                    {{ xl }}
                </text>

                <!-- cells -->
                <template v-for="(row, r) in matrix" :key="'r' + r">
                    <g v-for="(v, c) in row" :key="'c' + r + '-' + c">
                        <rect
                            :x="cellX(c)"
                            :y="cellY(r)"
                            :width="Math.max(0, cellW - GAP)"
                            :height="Math.max(0, cellH - GAP)"
                            :rx="3"
                            :fill="fillFor(v)"
                            :stroke="isHover(r, c) ? 'var(--foreground)' : 'none'"
                            stroke-width="1.5"
                            style="transition: fill 0.12s"
                        />
                        <text
                            v-if="showValues && v != null && cellW > 22 && cellH > 16"
                            :x="cellX(c) + cellW / 2 - GAP / 2"
                            :y="cellY(r) + cellH / 2 - GAP / 2"
                            text-anchor="middle"
                            dominant-baseline="middle"
                            :fill="textFor(v)"
                            style="font-size: 10px"
                            class="tabular-nums"
                        >
                            {{ fmtVal(v) }}
                        </text>
                    </g>
                </template>
            </svg>

            <Tooltip :open="hover && hoverR >= 0" :anchor="anchor" placement="top" :offset="12" size="small">
                <template #content>
                    <div class="flex items-center gap-2 leading-tight">
                        <span class="inline-block rounded-[3px] shrink-0" :style="{ width: '9px', height: '9px', background: hoverFill }" />
                        <span class="opacity-70">{{ yLabels[hoverR] }} · {{ xLabels[hoverC] }}</span>
                        <span class="font-semibold tabular-nums ml-auto pl-3">{{ fmtVal(hoverVal) }}</span>
                    </div>
                </template>
            </Tooltip>
        </div>

        <!-- sequential scale legend -->
        <div v-if="showLegend" class="mt-3 flex items-center gap-2 self-center text-caption text-muted-foreground">
            <span class="tabular-nums">{{ fmtVal(min) }}</span>
            <span class="h-2.5 w-28 rounded-full" :style="{ background: `linear-gradient(to right, ${fillAt(0)}, ${fillAt(1)})` }" />
            <span class="tabular-nums">{{ fmtVal(max) }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Chart } from '../../../interfaces/data-display/Chart.interface';
import Tooltip from '../../feedback/Tooltip.vue';
import { resolveColor, compact } from './useChart';

const props = withDefaults(defineProps<Chart>(), {
    type: 'heatmap',
    height: 260,
    hover: true,
    showLegend: true,
    showValues: false,
});

const GAP = 3; // surface gap between cells

/* ---------- normalize into a matrix ---------- */
const matrix = computed<(number | null)[][]>(() => {
    const d = props.data as unknown;
    if (!Array.isArray(d) || d.length === 0) return [];
    if (Array.isArray(d[0])) {
        return (d as unknown[][]).map((row) => row.map((v) => (typeof v === 'number' ? v : null)));
    }
    if (typeof d[0] === 'number') return [(d as number[]).slice()];
    // row objects → columns from series keys (or numeric keys)
    const rows = d as Record<string, unknown>[];
    const keys = colKeys.value;
    return rows.map((r) => keys.map((k) => (typeof r[k] === 'number' ? (r[k] as number) : null)));
});

const isObjectRows = computed(() => {
    const d = props.data as unknown;
    return Array.isArray(d) && d.length > 0 && !Array.isArray(d[0]) && typeof d[0] === 'object';
});
const colKeys = computed<string[]>(() => {
    if (!isObjectRows.value) return [];
    const rows = props.data as Record<string, unknown>[];
    if (props.series?.length) return props.series.map((s) => (typeof s === 'string' ? s : s.key));
    return Object.keys(rows[0] ?? {}).filter((k) => k !== props.index && typeof (rows[0] ?? {})[k] === 'number');
});

const colCount = computed(() => matrix.value[0]?.length ?? 0);
const rowCount = computed(() => matrix.value.length);
const xLabels = computed<(string | number)[]>(() => {
    if (props.labels) return props.labels;
    if (isObjectRows.value) return colKeys.value;
    return Array.from({ length: colCount.value }, (_, i) => i + 1);
});
const yLabels = computed<(string | number)[]>(() => {
    if (props.yLabels) return props.yLabels;
    if (isObjectRows.value && props.index) return (props.data as Record<string, unknown>[]).map((r) => r[props.index!] as string | number);
    return Array.from({ length: rowCount.value }, (_, i) => i + 1);
});

/* ---------- scale ---------- */
const min = computed(() => {
    if (props.min != null) return props.min;
    let m = Infinity;
    for (const row of matrix.value) for (const v of row) if (v != null && v < m) m = v;
    return isFinite(m) ? m : 0;
});
const max = computed(() => {
    if (props.max != null) return props.max;
    let m = -Infinity;
    for (const row of matrix.value) for (const v of row) if (v != null && v > m) m = v;
    return isFinite(m) ? m : 1;
});
const base = computed(() => resolveColor(props.color, 0));
function tOf(v: number): number {
    const span = max.value - min.value;
    return span <= 0 ? 1 : Math.max(0, Math.min(1, (v - min.value) / span));
}
function fillAt(t: number): string {
    return `color-mix(in oklab, ${base.value} ${Math.round(12 + 88 * t)}%, var(--card))`;
}
function fillFor(v: number | null): string {
    if (v == null) return 'var(--muted)';
    return fillAt(tOf(v));
}
function textFor(v: number | null): string {
    return v != null && tOf(v) > 0.55 ? '#fff' : 'var(--foreground)';
}

/* ---------- responsive + layout ---------- */
const plotEl = ref<HTMLElement | null>(null);
const w = ref(0);
let ro: ResizeObserver | null = null;
onMounted(() => {
    const measure = () => { w.value = plotEl.value?.clientWidth ?? 0; };
    measure();
    if (typeof ResizeObserver !== 'undefined' && plotEl.value) { ro = new ResizeObserver(measure); ro.observe(plotEl.value); }
});
onBeforeUnmount(() => ro?.disconnect());

const padL = computed(() => {
    const longest = yLabels.value.reduce<number>((m, l) => Math.max(m, String(l).length), 0);
    return Math.min(90, Math.max(24, longest * 6.5 + 10));
});
const padB = 22;
const padR = 6;
const padT = 4;
const gridW = computed(() => Math.max(0, w.value - padL.value - padR));
const gridH = computed(() => Math.max(0, props.height - padB - padT));
const cellW = computed(() => (colCount.value ? gridW.value / colCount.value : 0));
const cellH = computed(() => (rowCount.value ? gridH.value / rowCount.value : 0));
function cellX(c: number): number { return padL.value + c * cellW.value; }
function cellY(r: number): number { return padT + r * cellH.value; }

/* ---------- hover ---------- */
const hoverR = ref(-1);
const hoverC = ref(-1);
const anchor = ref({ x: 0, y: 0 });
let raf = 0; let pe: PointerEvent | null = null;
function onMove(e: PointerEvent) {
    if (!props.hover || !plotEl.value) return;
    pe = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = plotEl.value?.getBoundingClientRect(); if (!rect || !pe) return;
        const px = pe.clientX - rect.left - padL.value;
        const py = pe.clientY - rect.top - padT;
        if (px < 0 || py < 0 || px > gridW.value || py > gridH.value || cellW.value <= 0 || cellH.value <= 0) { hoverR.value = -1; hoverC.value = -1; return; }
        const c = Math.floor(px / cellW.value);
        const r = Math.floor(py / cellH.value);
        if (r < 0 || r >= rowCount.value || c < 0 || c >= colCount.value || matrix.value[r][c] == null) { hoverR.value = -1; hoverC.value = -1; return; }
        hoverR.value = r; hoverC.value = c;
        anchor.value = { x: pe.clientX, y: pe.clientY };
    });
}
function onLeave() { if (raf) { cancelAnimationFrame(raf); raf = 0; } hoverR.value = -1; hoverC.value = -1; }
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); });

const hoverVal = computed(() => (hoverR.value >= 0 ? matrix.value[hoverR.value]?.[hoverC.value] ?? null : null));
const hoverFill = computed(() => fillFor(hoverVal.value));
function isHover(r: number, c: number): boolean { return hoverR.value === r && hoverC.value === c; }

function fmtVal(v: number | null): string {
    if (v == null) return '—';
    return props.valueFormat ? props.valueFormat(v, 0) : compact(v);
}
const resolvedAriaLabel = computed(() => props.ariaLabel ?? 'heatmap chart');
</script>
