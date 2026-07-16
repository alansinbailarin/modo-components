<template>
    <div class="modo-chart-radar w-full flex flex-col items-center">
        <div
            ref="plotEl"
            class="modo-chart relative w-full flex justify-center"
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
                <!-- grid: concentric rings (spider) -->
                <g v-if="showGrid">
                    <polygon
                        v-for="(ring, ri) in gridRings"
                        :key="'ring' + ri"
                        :points="ring"
                        fill="none"
                        stroke="var(--border)"
                        stroke-opacity="0.7"
                    />
                    <line
                        v-for="(ax, ai) in axes"
                        :key="'spoke' + ai"
                        :x1="cx"
                        :y1="cy"
                        :x2="ax.x"
                        :y2="ax.y"
                        stroke="var(--border)"
                        stroke-opacity="0.7"
                    />
                </g>

                <!-- axis labels -->
                <text
                    v-for="(ax, ai) in axes"
                    :key="'lbl' + ai"
                    :x="ax.lx"
                    :y="ax.ly"
                    :text-anchor="ax.anchor"
                    dominant-baseline="middle"
                    class="fill-muted-foreground"
                    style="font-size: 11px"
                >
                    {{ ax.label }}
                </text>

                <!-- series polygons -->
                <g v-for="(s, si) in polygons" :key="'poly' + si">
                    <polygon
                        :points="s.points"
                        :fill="s.color"
                        :fill-opacity="hoverIndex < 0 ? 0.16 : 0.1"
                        :stroke="s.color"
                        stroke-width="2"
                        stroke-linejoin="round"
                        style="transition: fill-opacity 0.12s"
                    />
                    <circle
                        v-for="(v, vi) in s.vertices"
                        :key="'v' + vi"
                        :cx="v.x"
                        :cy="v.y"
                        :r="hoverIndex === vi ? 4.5 : 2.5"
                        :fill="s.color"
                        :stroke="hoverIndex === vi ? 'var(--card)' : 'none'"
                        stroke-width="2"
                        style="transition: r 0.1s"
                    />
                </g>

                <!-- hover spoke highlight -->
                <line
                    v-if="hoverIndex >= 0 && axes[hoverIndex]"
                    :x1="cx"
                    :y1="cy"
                    :x2="axes[hoverIndex].x"
                    :y2="axes[hoverIndex].y"
                    stroke="var(--foreground)"
                    stroke-opacity="0.25"
                    stroke-width="1.5"
                />
            </svg>

            <Tooltip :open="hover && hoverIndex >= 0" :anchor="anchor" placement="top" :offset="12" size="small">
                <template #content>
                    <div class="min-w-[7rem]">
                        <div class="mb-1 font-medium">{{ categories[hoverIndex] }}</div>
                        <div v-for="(s, si) in polygons" :key="'tt' + si" class="flex items-center gap-2 leading-tight">
                            <span class="inline-block rounded-full shrink-0" :style="{ width: '8px', height: '8px', background: s.color }" />
                            <span class="opacity-70">{{ s.name }}</span>
                            <span class="font-semibold tabular-nums ml-auto pl-3">{{ fmtVal(s.values[hoverIndex]) }}</span>
                        </div>
                    </div>
                </template>
            </Tooltip>
        </div>

        <!-- Legend -->
        <div v-if="showLegendResolved" class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span v-for="(s, si) in polygons" :key="'lg' + si" class="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
                <span class="inline-block rounded-full" :style="{ width: '10px', height: '10px', background: s.color }" />
                {{ s.name }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Chart } from '../../../interfaces/data-display/Chart.interface';
import Tooltip from '../../feedback/Tooltip.vue';
import { normalize, extent, niceTicks, compact } from './useChart';

const props = withDefaults(defineProps<Chart>(), {
    type: 'radar',
    height: 260,
    hover: true,
    showGrid: true,
    showLegend: true,
});

/* ---------- data ---------- */
const norm = computed(() =>
    normalize(props.data as number[] | Record<string, unknown>[], {
        index: props.index,
        series: props.series,
        labels: props.labels,
        color: props.color,
    }),
);
const categories = computed(() => norm.value.categories);
const seriesList = computed(() => norm.value.series);
const axisCount = computed(() => categories.value.length);
const showLegendResolved = computed(() => props.showLegend && seriesList.value.length > 1);

// Scale: 0 → nice max over all values (or explicit max).
const RINGS = 4;
const ticks = computed(() => {
    const [, hi] = extent(seriesList.value, true);
    const top = props.max ?? props.yMax ?? hi;
    return niceTicks(0, top, RINGS);
});
const radMax = computed(() => ticks.value[ticks.value.length - 1] || 1);

/* ---------- responsive ---------- */
const plotEl = ref<HTMLElement | null>(null);
const w = ref(0);
let ro: ResizeObserver | null = null;
onMounted(() => {
    const measure = () => { w.value = plotEl.value?.clientWidth ?? 0; };
    measure();
    if (typeof ResizeObserver !== 'undefined' && plotEl.value) { ro = new ResizeObserver(measure); ro.observe(plotEl.value); }
});
onBeforeUnmount(() => ro?.disconnect());

/* ---------- geometry ---------- */
const cx = computed(() => w.value / 2);
const cy = computed(() => props.height / 2);
const R = computed(() => Math.max(10, Math.min(w.value, props.height) / 2 - 34));
const START = -Math.PI / 2;
function angleAt(i: number): number {
    return START + (i / Math.max(1, axisCount.value)) * Math.PI * 2;
}
function pointAt(i: number, value: number): { x: number; y: number } {
    const r = (Math.max(0, value) / radMax.value) * R.value;
    const a = angleAt(i);
    return { x: cx.value + r * Math.cos(a), y: cy.value + r * Math.sin(a) };
}

// axis endpoints + label anchors
const axes = computed(() =>
    categories.value.map((label, i) => {
        const a = angleAt(i);
        const ex = cx.value + R.value * Math.cos(a);
        const ey = cy.value + R.value * Math.sin(a);
        const lx = cx.value + (R.value + 16) * Math.cos(a);
        const ly = cy.value + (R.value + 16) * Math.sin(a);
        const cos = Math.cos(a);
        const anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
        return { x: ex, y: ey, lx, ly, anchor, label: String(label) };
    }),
);

// grid rings (spider polygons) — one per tick above 0
const gridRings = computed(() =>
    ticks.value.slice(1).map((t) =>
        categories.value.map((_, i) => { const p = pointAt(i, t); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' '),
    ),
);

// series polygons
const polygons = computed(() =>
    seriesList.value.map((s) => {
        const vertices = categories.value.map((_, i) => pointAt(i, (s.values[i] ?? 0) as number));
        return {
            name: s.name,
            color: s.color,
            values: s.values,
            vertices,
            points: vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' '),
        };
    }),
);

/* ---------- hover (nearest axis by angle) ---------- */
const hoverIndex = ref(-1);
const anchor = ref({ x: 0, y: 0 });
let raf = 0; let pe: PointerEvent | null = null;
function onMove(e: PointerEvent) {
    if (!props.hover || !plotEl.value || axisCount.value === 0) return;
    pe = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = plotEl.value?.getBoundingClientRect(); if (!rect || !pe) return;
        const dx = (pe.clientX - rect.left) - cx.value;
        const dy = (pe.clientY - rect.top) - cy.value;
        if (Math.hypot(dx, dy) < 6) { hoverIndex.value = -1; return; }
        let ang = Math.atan2(dy, dx) - START;
        while (ang < 0) ang += Math.PI * 2; while (ang >= Math.PI * 2) ang -= Math.PI * 2;
        const idx = Math.round(ang / (Math.PI * 2) * axisCount.value) % axisCount.value;
        hoverIndex.value = idx;
        anchor.value = { x: pe.clientX, y: pe.clientY };
    });
}
function onLeave() { if (raf) { cancelAnimationFrame(raf); raf = 0; } hoverIndex.value = -1; }
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); });

function fmtVal(v: number | null): string {
    if (v == null) return '—';
    return props.valueFormat ? props.valueFormat(v, hoverIndex.value) : compact(v);
}
const resolvedAriaLabel = computed(() => props.ariaLabel ?? 'radar chart');
</script>
