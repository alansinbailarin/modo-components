<template>
    <div class="modo-chart-cartesian w-full">
        <!-- Legend (≥2 series) -->
        <div v-if="showLegendResolved" class="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
                v-for="s in norm.series"
                :key="s.key"
                type="button"
                class="inline-flex items-center gap-1.5 text-caption text-muted-foreground cursor-pointer select-none"
                :class="hidden.has(s.key) ? 'opacity-40' : ''"
                @click="toggle(s.key)"
            >
                <span class="inline-block rounded-full" :style="{ width: '10px', height: '10px', background: s.color }" />
                {{ s.name }}
            </button>
        </div>

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
                <defs>
                    <linearGradient v-for="s in visibleSeries" :key="'g'+s.key" :id="gradId(s.key)" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" :stop-color="s.color" stop-opacity="0.30" />
                        <stop offset="100%" :stop-color="s.color" stop-opacity="0.02" />
                    </linearGradient>
                    <!-- soft colored glow under each line (the "aura") -->
                    <filter v-for="s in visibleSeries" :key="'f'+s.key" :id="glowId(s.key)" x="-10%" y="-20%" width="120%" height="150%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" :flood-color="s.color" flood-opacity="0.35" />
                    </filter>
                </defs>

                <!-- Grid -->
                <g v-if="showGrid">
                    <line
                        v-for="t in yTicks"
                        :key="'grid'+t"
                        :x1="mL" :x2="w - mR" :y1="yAt(t)" :y2="yAt(t)"
                        stroke="var(--border)" stroke-width="1" stroke-opacity="0.6"
                    />
                </g>

                <!-- Reference lines -->
                <g v-if="referenceLines">
                    <line
                        v-for="(r, i) in referenceLines"
                        :key="'ref'+i"
                        :x1="mL" :x2="w - mR" :y1="yAt(r.value)" :y2="yAt(r.value)"
                        :stroke="r.color || 'var(--muted-foreground)'" stroke-width="1" stroke-dasharray="4 3"
                    />
                </g>

                <!-- Y axis ticks -->
                <g v-if="showYAxis">
                    <text
                        v-for="t in yTicks"
                        :key="'yt'+t"
                        :x="mL - 8" :y="yAt(t)"
                        text-anchor="end" dominant-baseline="middle"
                        class="fill-muted-foreground" style="font-size:11px"
                    >{{ fmtY(t) }}</text>
                </g>

                <!-- X axis ticks -->
                <g v-if="showXAxis">
                    <text
                        v-for="(c, i) in norm.categories"
                        v-show="showXLabel(i)"
                        :key="'xt'+i"
                        :x="xCenter(i)" :y="height - mB + 16"
                        text-anchor="middle"
                        class="fill-muted-foreground" style="font-size:11px"
                    >{{ fmtX(c, i) }}</text>
                </g>

                <!-- ===== MARKS ===== -->
                <!-- area / gradient fills. Stacked → strong solid bands; single/
                     overlaid line/area → soft gradient "aura". -->
                <template v-if="hasFill">
                    <path
                        v-for="s in visibleSeries"
                        :key="'area'+s.key"
                        :d="areaFor(s)"
                        :fill="stacked ? s.color : `url(#${gradId(s.key)})`"
                        :fill-opacity="stacked ? 0.9 : 1"
                        stroke="none"
                    />
                </template>

                <!-- lines (line + area), with a soft colored glow -->
                <template v-if="isLine">
                    <path
                        v-for="s in visibleSeries"
                        :key="'line'+s.key"
                        :d="lineFor(s)"
                        fill="none" :stroke="s.color" :stroke-width="strokeWidth"
                        stroke-linecap="round" stroke-linejoin="round"
                        :filter="`url(#${glowId(s.key)})`"
                    />
                </template>

                <!-- bars -->
                <template v-if="type === 'bar'">
                    <rect
                        v-for="b in bars"
                        :key="b.key"
                        :x="b.x" :y="b.y" :width="b.w" :height="b.h"
                        :fill="b.color" rx="3"
                        :class="hoverIndex === b.cat ? '' : ''"
                        :fill-opacity="hoverIndex < 0 || hoverIndex === b.cat ? 1 : 0.6"
                    />
                </template>

                <!-- scatter + line dots -->
                <template v-if="type === 'scatter' || showDots">
                    <circle
                        v-for="d in dots"
                        :key="d.key"
                        :cx="d.x" :cy="d.y" :r="type === 'scatter' ? 4 : 3"
                        :fill="d.color" stroke="var(--card)" stroke-width="1.5"
                    />
                </template>

                <!-- hover crosshair + snapped markers -->
                <g v-if="hover && hoverIndex >= 0 && !isBarHover" aria-hidden="true">
                    <line :x1="xCenter(hoverIndex)" :x2="xCenter(hoverIndex)" :y1="mT" :y2="height - mB" stroke="var(--border)" stroke-width="1" />
                    <circle
                        v-for="s in visibleSeries"
                        :key="'hc'+s.key"
                        v-show="s.values[hoverIndex] != null"
                        :cx="xCenter(hoverIndex)" :cy="yAt(pointVal(s, hoverIndex))" :r="3.5"
                        :fill="s.color" stroke="var(--card)" stroke-width="2"
                    />
                </g>
            </svg>

            <!-- Shared tooltip (mood-ui Tooltip, virtual anchor) -->
            <Tooltip :open="hover && hoverIndex >= 0" :anchor="anchor" placement="top" :offset="12" size="small">
                <template #content>
                    <div class="text-[11px] opacity-70 leading-tight mb-0.5">{{ fmtX(norm.categories[hoverIndex], hoverIndex) }}</div>
                    <div v-for="s in visibleSeries" :key="'tt'+s.key" class="flex items-center gap-2 leading-tight">
                        <span class="inline-block rounded-full shrink-0" :style="{ width: '8px', height: '8px', background: s.color }" />
                        <span v-if="norm.series.length > 1" class="opacity-70">{{ s.name }}</span>
                        <span class="font-semibold tabular-nums ml-auto pl-3">{{ s.values[hoverIndex] == null ? '—' : fmtVal(s.values[hoverIndex] as number) }}</span>
                    </div>
                </template>
            </Tooltip>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Chart } from '../../../interfaces/data-display/Chart.interface';
import Tooltip from '../../feedback/Tooltip.vue';
import {
    normalize, extent, stackedExtent, niceTicks, compact, linePath,
    type ChartPoint, type NormSeries,
} from './useChart';

const props = withDefaults(defineProps<Chart>(), {
    type: 'line',
    curve: 'smooth',
    strokeWidth: 2,
    stacked: false,
    showDots: false,
    height: 220,
    hover: true,
    // Line charts get a soft gradient fill + colored glow under each series
    // by default (the sparkline "aura"). Set `:area="false"` for a bare line.
    area: true,
    // default-on booleans must be defaulted here (an absent boolean prop is
    // cast to `false` by Vue, which would otherwise hide these).
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showLegend: true,
});

const type = computed(() => props.type);
const isArea = computed(() => props.type === 'area');
const isLine = computed(() => props.type === 'line' || props.type === 'area');
// Whether to draw the gradient fill under the line(s): always for `area`, and
// for `line` unless the caller opts out with `:area="false"`.
const hasFill = computed(() => props.type === 'area' || (props.type === 'line' && props.area));
const stacked = computed(() => props.stacked);

const norm = computed(() => normalize(props.data as never, {
    index: props.index, series: props.series, labels: props.labels, color: props.color,
}));

/* ---------- series visibility (legend toggle) ---------- */
const hidden = ref(new Set<string>());
function toggle(key: string) {
    const n = new Set(hidden.value);
    n.has(key) ? n.delete(key) : n.add(key);
    hidden.value = n;
}
const visibleSeries = computed(() => norm.value.series.filter((s) => !hidden.value.has(s.key)));
const showLegendResolved = computed(() => props.showLegend && norm.value.series.length > 1);

/* ---------- responsive width ---------- */
const plotEl = ref<HTMLElement | null>(null);
const w = ref(0);
let ro: ResizeObserver | null = null;
onMounted(() => {
    const measure = () => { w.value = plotEl.value?.clientWidth ?? 0; };
    measure();
    if (typeof ResizeObserver !== 'undefined' && plotEl.value) {
        ro = new ResizeObserver(measure); ro.observe(plotEl.value);
    }
});
onBeforeUnmount(() => ro?.disconnect());

/* ---------- layout ---------- */
const showGrid = computed(() => props.showGrid ?? true);
const showXAxis = computed(() => props.showXAxis ?? true);
const showYAxis = computed(() => props.showYAxis ?? true);
const mT = 8;
const mR = 12;
const mB = computed(() => (showXAxis.value ? 26 : 8));
// Auto-size the left margin to the widest y-tick label so any formatter fits.
const mL = computed(() => {
    if (!showYAxis.value) return 8;
    const longest = Math.max(3, ...yTicks.value.map((t) => fmtY(t).length));
    return Math.min(80, Math.max(34, longest * 6.5 + 14));
});
const innerW = computed(() => Math.max(0, w.value - mL.value - mR));
const innerH = computed(() => Math.max(0, props.height - mT - mB.value));

/* ---------- scales ---------- */
const domain = computed<[number, number]>(() => {
    if (props.yMin != null && props.yMax != null) return [props.yMin, props.yMax];
    const [lo, hi] = stacked.value ? stackedExtent(visibleSeries.value) : extent(visibleSeries.value);
    return [props.yMin ?? lo, props.yMax ?? hi];
});
const yTicks = computed(() => niceTicks(domain.value[0], domain.value[1], 4));
const yDom = computed<[number, number]>(() => [yTicks.value[0], yTicks.value[yTicks.value.length - 1]]);

function yAt(v: number): number {
    const [lo, hi] = yDom.value;
    return mT + (1 - (v - lo) / (hi - lo || 1)) * innerH.value;
}
const n = computed(() => norm.value.categories.length);
const bandW = computed(() => innerW.value / Math.max(1, n.value));
// line/area/scatter → edge-to-edge points; bar → band centers
function xCenter(i: number): number {
    if (props.type === 'bar') return mL.value + bandW.value * (i + 0.5);
    return mL.value + (n.value <= 1 ? innerW.value / 2 : (i / (n.value - 1)) * innerW.value);
}

/* ---------- marks: line / area ---------- */
function pointVal(s: NormSeries, i: number): number {
    if (!stacked.value) return s.values[i] ?? 0;
    // stacked: cumulative up to and including this series
    let acc = 0;
    for (const ss of visibleSeries.value) {
        acc += ss.values[i] ?? 0;
        if (ss.key === s.key) break;
    }
    return acc;
}
function seriesPoints(s: NormSeries): (ChartPoint | null)[] {
    return norm.value.categories.map((_, i) =>
        s.values[i] == null && !stacked.value ? null : { x: xCenter(i), y: yAt(pointVal(s, i)) },
    );
}
function lineFor(s: NormSeries): string {
    return linePath(seriesPoints(s), props.curve, props.connectNulls);
}
function areaFor(s: NormSeries): string {
    const pts = seriesPoints(s).filter(Boolean) as ChartPoint[];
    if (pts.length < 2) return '';
    const top = linePath(pts, props.curve, true);
    if (stacked.value) {
        // baseline = cumulative of series below
        const below = belowPoints(s);
        const rev = below.slice().reverse();
        const baseline = rev.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
        return `${top} ${baseline} Z`;
    }
    const base = yAt(yDom.value[0]);
    return `${top} L ${pts[pts.length - 1].x.toFixed(2)} ${base} L ${pts[0].x.toFixed(2)} ${base} Z`;
}
function belowPoints(s: NormSeries): ChartPoint[] {
    const idx = visibleSeries.value.findIndex((x) => x.key === s.key);
    return norm.value.categories.map((_, i) => {
        let acc = 0;
        for (let j = 0; j < idx; j++) acc += visibleSeries.value[j].values[i] ?? 0;
        return { x: xCenter(i), y: yAt(acc) };
    });
}

/* ---------- marks: bars ---------- */
const bars = computed(() => {
    if (props.type !== 'bar') return [];
    const out: { key: string; x: number; y: number; w: number; h: number; color: string; cat: number }[] = [];
    const vis = visibleSeries.value;
    const gap = 0.18 * bandW.value;
    const usable = bandW.value - gap;
    const y0 = yAt(0);
    norm.value.categories.forEach((_, i) => {
        const bx = mL.value + bandW.value * i + gap / 2;
        if (stacked.value) {
            let accPos = 0;
            vis.forEach((s) => {
                const v = s.values[i] ?? 0;
                const yTop = yAt(accPos + v);
                const yBot = yAt(accPos);
                out.push({ key: `${s.key}-${i}`, x: bx, y: Math.min(yTop, yBot), w: usable, h: Math.abs(yBot - yTop), color: s.color, cat: i });
                accPos += v;
            });
        } else {
            const bw = usable / Math.max(1, vis.length);
            vis.forEach((s, si) => {
                const v = s.values[i] ?? 0;
                const yTop = yAt(v);
                out.push({ key: `${s.key}-${i}`, x: bx + bw * si, y: Math.min(yTop, y0), w: bw * 0.86, h: Math.abs(y0 - yTop), color: s.color, cat: i });
            });
        }
    });
    return out;
});

/* ---------- marks: dots / scatter ---------- */
const dots = computed(() => {
    if (props.type !== 'scatter' && !props.showDots) return [];
    const out: { key: string; x: number; y: number; color: string }[] = [];
    visibleSeries.value.forEach((s) => {
        norm.value.categories.forEach((_, i) => {
            if (s.values[i] == null) return;
            out.push({ key: `${s.key}-${i}`, x: xCenter(i), y: yAt(pointVal(s, i)), color: s.color });
        });
    });
    return out;
});

/* ---------- formatters ---------- */
function fmtVal(v: number): string { return props.valueFormat ? props.valueFormat(v, 0) : compact(v); }
function fmtY(v: number): string { return props.valueFormat ? props.valueFormat(v, 0) : compact(v); }
function fmtX(x: string | number, i: number): string { return props.xFormat ? props.xFormat(x, i) : String(x); }
function showXLabel(i: number): boolean {
    const step = Math.ceil(n.value / Math.max(1, Math.floor(innerW.value / 56)));
    return i % step === 0 || i === n.value - 1;
}

/* ---------- hover ---------- */
const hoverIndex = ref(-1);
const anchor = ref({ x: 0, y: 0 });
const isBarHover = computed(() => props.type === 'bar');
let raf = 0; let pendingX = 0;
function onMove(e: PointerEvent) {
    if (!props.hover || n.value < 1 || !plotEl.value) return;
    pendingX = e.clientX;
    if (raf) return;
    raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = plotEl.value?.getBoundingClientRect(); if (!rect) return;
        const lx = pendingX - rect.left;
        let idx: number;
        if (props.type === 'bar') idx = Math.floor((lx - mL.value) / (bandW.value || 1));
        else idx = Math.round(((lx - mL.value) / (innerW.value || 1)) * (n.value - 1));
        idx = Math.max(0, Math.min(n.value - 1, idx));
        if (idx === hoverIndex.value) return;
        hoverIndex.value = idx;
        // anchor at the top of the hovered column
        let topY = mT;
        for (const s of visibleSeries.value) {
            if (s.values[idx] != null) topY = Math.min(topY, yAt(pointVal(s, idx)));
        }
        if (props.type === 'bar') topY = mT; // above the tallest bar-ish
        anchor.value = { x: rect.left + xCenter(idx), y: rect.top + Math.max(mT, topY) };
    });
}
function onLeave() { if (raf) { cancelAnimationFrame(raf); raf = 0; } hoverIndex.value = -1; }
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); });

const gradId = (k: string) => `modo-chart-c-${k.replace(/[^a-zA-Z0-9_-]/g, '')}`;
const glowId = (k: string) => `modo-chart-glow-${k.replace(/[^a-zA-Z0-9_-]/g, '')}`;
const resolvedAriaLabel = computed(() => props.ariaLabel ?? `${props.type} chart`);
</script>
