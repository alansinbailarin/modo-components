<template>
    <!-- Card variants delegate to the shared <Card> so the surface/shadow/radius
         stay identical everywhere (no bespoke shadow on `outlined`). `plain`
         renders no container. -->
    <component
        :is="isCard ? Card : 'div'"
        v-bind="wrapperAttrs"
    >
        <div :class="['relative flex flex-col', gapClass, paddingClasses]">
        <!-- Header: icon + label, left-aligned. Only when there's something to show. -->
        <div v-if="icon || label" class="flex items-center gap-2.5">
            <span
                v-if="icon"
                :class="[
                    'shrink-0 inline-flex items-center justify-center rounded-xl',
                    iconBoxClass,
                    iconColorClasses,
                ]"
            >
                <component :is="icon" :class="iconSizeClass" aria-hidden="true" />
            </span>
            <span v-if="label" :class="['font-normal text-muted-foreground leading-none', labelSizeClass]">{{ label }}</span>
        </div>

        <!-- Value (left) + optional chart (right). With no `value`, the chart
             fills the card — a "chart-only" stat. -->
        <div v-if="loading || value !== undefined || $slots.chart" class="flex items-center gap-4">
            <div v-if="loading || value !== undefined" class="shrink-0">
                <div v-if="loading" :class="['bg-muted animate-pulse rounded-lg', skeletonClass]" />
                <span v-else :class="['font-semibold text-foreground tabular-nums leading-none', valueSizeClass]">
                    {{ value }}
                </span>
            </div>
            <div v-if="$slots.chart" class="flex-1 min-w-0">
                <slot name="chart" />
            </div>
        </div>

        <!-- Trend + description -->
        <div v-if="trend || description" class="flex items-center gap-2 flex-wrap">
            <span
                v-if="trend"
                :class="[
                    'inline-flex items-center gap-0.5 font-medium tabular-nums rounded-md px-1.5 py-0.5',
                    trendSizeClass,
                    trendBadgeClasses,
                ]"
            >
                <ArrowUpIcon v-if="trendDirection === 'up'" :class="trendIconClass" />
                <ArrowDownIcon v-else-if="trendDirection === 'down'" :class="trendIconClass" />
                <MinusIcon v-else :class="trendIconClass" />
                {{ trendLabel }}
            </span>
            <span v-if="description" :class="['text-muted-foreground', descSizeClass]">{{ description }}</span>
        </div>
        </div>
    </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/vue/20/solid';
import type { Stat } from '../../interfaces/data-display/Stat.interface';
import { useResolvedColor, useResolvedSize } from '../../composables/useModoConfig';
import Card from './Card.vue';

const props = withDefaults(defineProps<Stat>(), {
    variant: 'plain',
    color: 'default',
    loading: false,
});

const resolvedSize = useResolvedSize(() => props.size);
const resolvedColor = useResolvedColor(() => props.color);

// Card variants render through the shared <Card>; `plain` renders a bare div.
const isCard = computed(() => props.variant !== 'plain');
const wrapperAttrs = computed(() =>
    isCard.value
        ? { variant: props.variant, radius: props.radius, padding: 'none' as const }
        : {},
);

const trendDirection = computed<'up' | 'down' | 'neutral'>(() => {
    if (!props.trend) return 'neutral';
    if (props.trend.direction) return props.trend.direction;
    if (props.trend.value > 0) return 'up';
    if (props.trend.value < 0) return 'down';
    return 'neutral';
});

const trendLabel = computed(() => {
    if (!props.trend) return '';
    if (props.trend.label) return props.trend.label;
    const sign = props.trend.value > 0 ? '+' : '';
    return `${sign}${props.trend.value}%`;
});

const paddingClasses = computed(() => {
    if (props.variant === 'plain') return '';
    switch (resolvedSize.value) {
        case 'small':  return 'p-3.5';
        case 'large':  return 'p-6';
        case 'medium':
        default:       return 'p-5';
    }
});

const labelSizeClass = computed(() => {
    // Normal case, no letter-spacing — reads like a plain label, not a caps eyebrow.
    switch (resolvedSize.value) {
        case 'small':  return 'text-xs';
        case 'large':  return 'text-base';
        case 'medium':
        default:       return 'text-sm';
    }
});

const valueSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-2xl';
        case 'large':  return 'text-4xl';
        case 'medium':
        default:       return 'text-3xl';
    }
});

// Vertical rhythm between header / value+chart / trend (gap, so a missing row
// never leaves a dangling margin).
const gapClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'gap-2.5';
        case 'large':  return 'gap-4';
        default:       return 'gap-3';
    }
});

const skeletonClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'h-7 w-20 mt-3';
        case 'large':  return 'h-10 w-32 mt-3';
        default:       return 'h-8 w-24 mt-3';
    }
});

const descSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-[11px]';
        case 'large':  return 'text-sm';
        case 'medium':
        default:       return 'text-xs';
    }
});

const trendSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'large':  return 'text-xs';
        default:       return 'text-[11px]';
    }
});

const trendIconClass = computed(() => {
    switch (resolvedSize.value) {
        case 'large':  return 'w-3.5 h-3.5';
        default:       return 'w-3 h-3';
    }
});

const iconBoxClass = computed(() => {
    // Kept modest so the icon never competes with the value, even at `large`.
    switch (resolvedSize.value) {
        case 'small':  return 'w-7 h-7 rounded-lg';
        case 'large':  return 'w-10 h-10 rounded-xl';
        case 'medium':
        default:       return 'w-8 h-8 rounded-lg';
    }
});

const iconSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-3.5 h-3.5';
        case 'large':  return 'w-5 h-5';
        case 'medium':
        default:       return 'w-4 h-4';
    }
});

const iconColorClasses = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'bg-primary/10 text-primary';
        case 'danger':  return 'bg-destructive/10 text-destructive';
        case 'success': return 'bg-success/10 text-success';
        case 'warning': return 'bg-warning/10 text-warning';
        case 'default':
        default:        return 'bg-muted text-muted-foreground';
    }
});

const trendBadgeClasses = computed(() => {
    if (trendDirection.value === 'up')   return 'bg-success/10 text-success';
    if (trendDirection.value === 'down') return 'bg-destructive/10 text-destructive';
    return 'bg-muted text-muted-foreground';
});
</script>

