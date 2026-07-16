<template>
    <!-- Single public entry point. `type` picks the renderer; the sub-components
         are private implementation detail. Only `type`/`data` are declared here;
         everything else falls through via `$attrs` so absent boolean props are
         NOT cast to `false` and clobber a renderer's own default (Vue quirk). -->
    <Sparkline v-if="!type || type === 'sparkline'" v-bind="$attrs" :data="data" type="sparkline" />
    <Radar v-else-if="type === 'radar'" v-bind="$attrs" :data="data" type="radar" />
    <Heatmap v-else-if="type === 'heatmap'" v-bind="$attrs" :data="data" type="heatmap" />
    <Polar v-else-if="isPolar" v-bind="$attrs" :data="data" :type="type" />
    <Cartesian v-else v-bind="$attrs" :data="data" :type="type" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Chart, ChartType } from '../../interfaces/data-display/Chart.interface';
import Sparkline from './chart/Sparkline.vue';
import Cartesian from './chart/Cartesian.vue';
import Polar from './chart/Polar.vue';
import Radar from './chart/Radar.vue';
import Heatmap from './chart/Heatmap.vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<{ type?: ChartType; data: Chart['data'] }>();

const type = computed(() => props.type);
const isPolar = computed(() => ['donut', 'pie', 'gauge', 'radial'].includes(props.type as string));
</script>
