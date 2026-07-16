<template>
    <div
        ref="wrapEl"
        class="modo-chart relative block w-full"
        :style="{ height: `${height}px` }"
        @pointermove="onMove"
        @pointerleave="onLeave"
    >
        <svg
            v-if="w > 1 && points.length > 1"
            :width="w"
            :height="height"
            :viewBox="`0 0 ${w} ${height}`"
            class="block overflow-visible"
            role="img"
            :aria-label="resolvedAriaLabel"
        >
            <defs v-if="area">
                <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="stroke" stop-opacity="0.20" />
                    <stop offset="100%" :stop-color="stroke" stop-opacity="0" />
                </linearGradient>
            </defs>
            <path v-if="area" :d="areaPath" :fill="`url(#${gradId})`" stroke="none" />
            <path
                :d="linePath"
                fill="none"
                :stroke="stroke"
                :stroke-width="strokeWidth"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <circle
                v-if="showDot && last"
                :cx="last.x"
                :cy="last.y"
                :r="dotR"
                :fill="stroke"
                stroke="var(--card)"
                stroke-width="2"
            />
            <g v-if="hover && hoverPt" aria-hidden="true">
                <line :x1="hoverPt.x" :x2="hoverPt.x" y1="0" :y2="height" stroke="var(--border)" stroke-width="1" />
                <circle :cx="hoverPt.x" :cy="hoverPt.y" :r="dotR" :fill="stroke" stroke="var(--card)" stroke-width="2" />
            </g>
        </svg>

        <Tooltip :open="hover && hoverIndex >= 0" :anchor="anchor" placement="top" :offset="10" size="small">
            <template #content>
                <div class="font-semibold tabular-nums leading-tight">{{ hoverValueText }}</div>
                <div v-if="hoverLabelText" class="text-[11px] opacity-70 leading-tight">{{ hoverLabelText }}</div>
            </template>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import type { Chart } from '../../../interfaces/data-display/Chart.interface';
import Tooltip from '../../feedback/Tooltip.vue';
import { resolveColor } from './useChart';

const props = withDefaults(defineProps<Chart>(), {
    type: 'sparkline',
    color: 'primary',
    height: 40,
    smooth: true,
    area: true,
    strokeWidth: 2,
    showDot: false,
    hover: true,
});

const gradId = `modo-chart-grad-${String(useId()).replace(/[^a-zA-Z0-9_-]/g, '')}`;
const dotR = 3.5;

const stroke = computed(() => resolveColor(props.color, 0));
const data = computed(() => (props.data ?? []) as number[]);

/* ---------- Responsive width ---------- */
const wrapEl = ref<HTMLElement | null>(null);
const w = ref(0);
let ro: ResizeObserver | null = null;
onMounted(() => {
    const measure = () => { w.value = wrapEl.value?.clientWidth ?? 0; };
    measure();
    if (typeof ResizeObserver !== 'undefined' && wrapEl.value) { ro = new ResizeObserver(measure); ro.observe(wrapEl.value); }
});
onBeforeUnmount(() => ro?.disconnect());

/* ---------- Geometry ---------- */
const padY = computed(() => (props.showDot ? dotR + 1 : props.strokeWidth));
const padX = computed(() => (props.showDot ? dotR + 1 : 0));

const points = computed<{ x: number; y: number }[]>(() => {
    const d = data.value;
    const nn = d.length;
    if (nn < 2 || w.value < 1) return [];
    const min = props.min ?? Math.min(...d);
    const max = props.max ?? Math.max(...d);
    const span = max - min || 1;
    const innerW = w.value - 2 * padX.value;
    const innerH = props.height - 2 * padY.value;
    return d.map((v, i) => ({
        x: padX.value + (i / (nn - 1)) * innerW,
        y: padY.value + (1 - (v - min) / span) * innerH,
    }));
});
const last = computed(() => points.value[points.value.length - 1] ?? null);

function buildLine(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return '';
    if (!props.smooth || pts.length === 2) {
        return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    }
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
}

const linePath = computed(() => buildLine(points.value));
const areaPath = computed(() => {
    const pts = points.value;
    if (pts.length < 2) return '';
    const baseline = props.height;
    return `${buildLine(pts)} L ${pts[pts.length - 1].x.toFixed(2)} ${baseline} L ${pts[0].x.toFixed(2)} ${baseline} Z`;
});

/* ---------- Hover / tooltip ---------- */
const hoverIndex = ref(-1);
const anchor = ref({ x: 0, y: 0 });
let raf = 0;
let pendingX = 0;

const hoverPt = computed(() => (hoverIndex.value >= 0 ? points.value[hoverIndex.value] ?? null : null));
const hoverValueText = computed(() => {
    const i = hoverIndex.value;
    if (i < 0) return '';
    const v = data.value[i];
    return props.valueFormat ? props.valueFormat(v, i) : String(v);
});
const hoverLabelText = computed(() => {
    const i = hoverIndex.value;
    if (i < 0 || !props.labels) return '';
    return String(props.labels[i] ?? '');
});

function onMove(e: PointerEvent) {
    if (!props.hover || points.value.length < 2 || !wrapEl.value) return;
    pendingX = e.clientX;
    if (raf) return;
    raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = wrapEl.value?.getBoundingClientRect();
        if (!rect) return;
        const nn = data.value.length;
        const innerW = w.value - 2 * padX.value;
        let idx = Math.round(((pendingX - rect.left - padX.value) / (innerW || 1)) * (nn - 1));
        idx = Math.max(0, Math.min(nn - 1, idx));
        if (idx === hoverIndex.value) return;
        hoverIndex.value = idx;
        const pt = points.value[idx];
        if (pt) anchor.value = { x: rect.left + pt.x, y: rect.top + pt.y };
    });
}
function onLeave() { if (raf) { cancelAnimationFrame(raf); raf = 0; } hoverIndex.value = -1; }
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); });

const resolvedAriaLabel = computed(() => props.ariaLabel ?? 'Trend chart');
</script>
