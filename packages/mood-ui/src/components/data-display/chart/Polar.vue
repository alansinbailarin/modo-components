<template>
    <div class="modo-chart-polar w-full flex flex-col items-center">
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
                <!-- PIE / DONUT -->
                <template v-if="isPie">
                    <path
                        v-for="(sl, i) in slices"
                        :key="'sl'+i"
                        :d="sl.d"
                        :fill="sl.color"
                        stroke="var(--card)"
                        stroke-width="2"
                        :fill-opacity="hoverIndex < 0 || hoverIndex === i ? 1 : 0.55"
                        style="transition: fill-opacity .12s"
                    />
                    <template v-if="type === 'donut'">
                        <text :x="cx" :y="cy - (centerLabel ? 8 : 0)" text-anchor="middle" dominant-baseline="middle" class="fill-foreground font-semibold" style="font-size:20px">
                            {{ centerValue ?? compactTotal }}
                        </text>
                        <text v-if="centerLabel" :x="cx" :y="cy + 12" text-anchor="middle" dominant-baseline="middle" class="fill-muted-foreground" style="font-size:11px">
                            {{ centerLabel }}
                        </text>
                    </template>
                </template>

                <!-- GAUGE (single ratio) -->
                <template v-else-if="type === 'gauge'">
                    <path :d="gaugeTrack" fill="none" stroke="var(--muted)" :stroke-width="gaugeWidth" stroke-linecap="round" />
                    <path :d="gaugeValue" fill="none" :stroke="gaugeColor" :stroke-width="gaugeWidth" stroke-linecap="round" />
                    <text :x="cx" :y="cy - 2" text-anchor="middle" dominant-baseline="middle" class="fill-foreground font-semibold" style="font-size:24px">
                        {{ centerValue ?? `${Math.round(gaugeRatio * 100)}%` }}
                    </text>
                    <text v-if="centerLabel" :x="cx" :y="cy + 20" text-anchor="middle" dominant-baseline="middle" class="fill-muted-foreground" style="font-size:11px">
                        {{ centerLabel }}
                    </text>
                </template>

                <!-- RADIAL (concentric rings) -->
                <template v-else>
                    <g v-for="(r, i) in rings" :key="'ring'+i">
                        <circle :cx="cx" :cy="cy" :r="r.radius" fill="none" stroke="var(--muted)" :stroke-width="r.width" stroke-opacity="0.6" />
                        <path :d="r.d" fill="none" :stroke="r.color" :stroke-width="r.width" stroke-linecap="round" />
                    </g>
                </template>
            </svg>

            <Tooltip :open="hover && hoverIndex >= 0 && isPie" :anchor="anchor" placement="top" :offset="10" size="small">
                <template #content>
                    <div class="flex items-center gap-2 leading-tight">
                        <span class="inline-block rounded-full shrink-0" :style="{ width: '8px', height: '8px', background: slices[hoverIndex]?.color }" />
                        <span class="opacity-70">{{ slices[hoverIndex]?.label }}</span>
                        <span class="font-semibold tabular-nums ml-auto pl-3">
                            {{ fmtVal(slices[hoverIndex]?.value ?? 0) }} · {{ Math.round((slices[hoverIndex]?.value ?? 0) / (total || 1) * 100) }}%
                        </span>
                    </div>
                </template>
            </Tooltip>
        </div>

        <!-- Legend -->
        <div v-if="showLegendResolved" class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span v-for="(sl, i) in slices" :key="'lg'+i" class="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
                <span class="inline-block rounded-full" :style="{ width: '10px', height: '10px', background: sl.color }" />
                {{ sl.label }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Chart } from '../../../interfaces/data-display/Chart.interface';
import Tooltip from '../../feedback/Tooltip.vue';
import { resolveColor, compact, arcPath } from './useChart';

const props = withDefaults(defineProps<Chart>(), {
    type: 'donut',
    height: 220,
    hover: true,
    showLegend: true,
});

const type = computed(() => props.type);
const isPie = computed(() => props.type === 'pie' || props.type === 'donut');

/* ---------- normalize slices ---------- */
interface Slice { label: string; value: number; color: string }
const sliceData = computed<Slice[]>(() => {
    const arr = (props.data ?? []) as (number | Record<string, unknown>)[];
    return arr.map((d, i) => {
        if (typeof d === 'number') {
            return { label: String(props.labels?.[i] ?? i), value: d, color: `var(--chart-${(i % 6) + 1})` };
        }
        const r = d as Record<string, unknown>;
        const color = typeof r.color === 'string' ? resolveColor(r.color, i) : `var(--chart-${(i % 6) + 1})`;
        return { label: String(r.label ?? props.labels?.[i] ?? i), value: Number(r.value ?? 0), color };
    });
});
const total = computed(() => sliceData.value.reduce((a, s) => a + s.value, 0));
const compactTotal = computed(() => compact(total.value));
const showLegendResolved = computed(() => props.showLegend && (isPie.value || props.type === 'radial'));

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
const R = computed(() => Math.min(w.value, props.height) / 2 - 6);
const START = -Math.PI / 2; // 12 o'clock

// pie/donut slices, each with its arc `d`
const donutInner = computed(() => (props.type === 'donut' ? (props.innerRadius ?? 0.62) : 0));
const slices = computed(() => {
    const t = total.value || 1;
    let a = START;
    return sliceData.value.map((s) => {
        const a0 = a;
        const a1 = a + (s.value / t) * Math.PI * 2;
        a = a1;
        return { ...s, d: arcPath(cx.value, cy.value, R.value, R.value * donutInner.value, a0, a1) };
    });
});

/* ---------- gauge ---------- */
const GAUGE_A0 = (135 * Math.PI) / 180;
const GAUGE_SWEEP = (270 * Math.PI) / 180;
const gaugeColor = computed(() => (props.color ? resolveColor(props.color, 0) : (slices.value[0]?.color ?? 'var(--chart-1)')));
const gaugeWidth = computed(() => Math.max(8, R.value * 0.16));
const gaugeR = computed(() => R.value - gaugeWidth.value / 2);
const gaugeRatio = computed(() => {
    const max = props.gaugeMax ?? total.value ?? 1;
    return Math.max(0, Math.min(1, (slices.value[0]?.value ?? 0) / (max || 1)));
});
const gaugeTrack = computed(() => arcStroke(GAUGE_A0, GAUGE_A0 + GAUGE_SWEEP, gaugeR.value));
const gaugeValue = computed(() => arcStroke(GAUGE_A0, GAUGE_A0 + GAUGE_SWEEP * gaugeRatio.value, gaugeR.value));
function arcStroke(a0: number, a1: number, r: number): string {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx.value + r * Math.cos(a0), y0 = cy.value + r * Math.sin(a0);
    const x1 = cx.value + r * Math.cos(a1), y1 = cy.value + r * Math.sin(a1);
    return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/* ---------- radial rings ---------- */
const rings = computed(() => {
    const max = props.gaugeMax ?? Math.max(1, ...slices.value.map((s) => s.value));
    const width = Math.max(7, R.value * 0.13);
    const gap = width * 1.5;
    return slices.value.map((s, i) => {
        const radius = R.value - i * gap - width / 2;
        const ratio = Math.max(0, Math.min(1, s.value / (max || 1)));
        return { radius, width, color: s.color, d: arcStroke(START, START + ratio * Math.PI * 2, radius) };
    });
});

/* ---------- hover ---------- */
const hoverIndex = ref(-1);
const anchor = ref({ x: 0, y: 0 });
let raf = 0; let pe: PointerEvent | null = null;
function onMove(e: PointerEvent) {
    if (!props.hover || !isPie.value || !plotEl.value) return;
    pe = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = plotEl.value?.getBoundingClientRect(); if (!rect || !pe) return;
        const dx = (pe.clientX - rect.left) - cx.value;
        const dy = (pe.clientY - rect.top) - cy.value;
        const dist = Math.hypot(dx, dy);
        if (dist > R.value || dist < R.value * donutInner.value) { hoverIndex.value = -1; return; }
        let ang = Math.atan2(dy, dx); // -π..π, 0 = right
        // normalize to slice space starting at START (-π/2), clockwise
        let rel = ang - START; while (rel < 0) rel += Math.PI * 2; while (rel >= Math.PI * 2) rel -= Math.PI * 2;
        const t = total.value || 1;
        let acc = 0, idx = -1;
        for (let i = 0; i < slices.value.length; i++) { acc += (slices.value[i].value / t) * Math.PI * 2; if (rel <= acc) { idx = i; break; } }
        hoverIndex.value = idx;
        anchor.value = { x: pe.clientX, y: pe.clientY };
    });
}
function onLeave() { if (raf) { cancelAnimationFrame(raf); raf = 0; } hoverIndex.value = -1; }
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); });

function fmtVal(v: number): string { return props.valueFormat ? props.valueFormat(v, 0) : compact(v); }
const resolvedAriaLabel = computed(() => props.ariaLabel ?? `${props.type} chart`);
</script>
