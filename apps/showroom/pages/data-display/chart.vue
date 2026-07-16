<script setup lang="ts">
import { ref, computed } from "vue";
import { Chart, Stat, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import { CurrencyDollarIcon } from "@heroicons/vue/24/outline";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import type { PropDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── Sample data ───────────────────────────────────────────────────────────────
const rows = [
  { month: "Jan", revenue: 44, cost: 28 },
  { month: "Feb", revenue: 52, cost: 31 },
  { month: "Mar", revenue: 48, cost: 35 },
  { month: "Apr", revenue: 61, cost: 30 },
  { month: "May", revenue: 75, cost: 42 },
  { month: "Jun", revenue: 68, cost: 38 },
  { month: "Jul", revenue: 82, cost: 45 },
];
const series = [
  { key: "revenue", name: "Revenue" },
  { key: "cost", name: "Cost" },
];
const single = [12, 18, 9, 22, 16, 28, 24, 31, 26, 34];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const dist = [
  { label: "Direct", value: 45 },
  { label: "Social", value: 25 },
  { label: "Referral", value: 18 },
  { label: "Email", value: 12 },
];
const progress = [
  { label: "To do", value: 12 },
  { label: "In progress", value: 23 },
  { label: "Done", value: 64 },
];
const radarRows = [
  { axis: "Speed", A: 80, B: 55 },
  { axis: "Power", A: 62, B: 78 },
  { axis: "Range", A: 70, B: 45 },
  { axis: "Agility", A: 88, B: 60 },
  { axis: "Defense", A: 50, B: 82 },
  { axis: "Support", A: 65, B: 70 },
];
const radarSeries = [
  { key: "A", name: "Team A" },
  { key: "B", name: "Team B" },
];
const heatX = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatY = ["12a", "4a", "8a", "12p", "4p", "8p"];
const heat = [
  [2, 1, 2, 3, 2, 6, 8],
  [1, 0, 1, 1, 2, 4, 5],
  [8, 12, 10, 11, 14, 9, 6],
  [22, 24, 26, 20, 28, 12, 9],
  [30, 34, 31, 36, 40, 18, 14],
  [16, 18, 15, 20, 26, 22, 19],
];
const money = (v: number) => "$" + (v * 1000).toLocaleString("en-US");

// ── Overview playground ───────────────────────────────────────────────────────
type PgType = "line" | "area" | "bar" | "donut" | "radar" | "heatmap";
const pgType = ref<PgType>("line");
const pgStacked = ref(false);
const pgLegend = ref(true);
const pgGrid = ref(true);
const pgCurve = ref<"smooth" | "linear" | "step">("smooth");

const isCartesian = computed(() => ["line", "area", "bar"].includes(pgType.value));
const isLineArea = computed(() => ["line", "area"].includes(pgType.value));
const canStack = computed(() => ["area", "bar"].includes(pgType.value));
const canGrid = computed(() => isCartesian.value || pgType.value === "radar");

function resetPlayground() {
  pgType.value = "line";
  pgStacked.value = false;
  pgLegend.value = true;
  pgGrid.value = true;
  pgCurve.value = "smooth";
}

const pgBind = computed(() => {
  const type = pgType.value;
  const base: Record<string, unknown> = { type, height: 280, showLegend: pgLegend.value };
  if (isCartesian.value) {
    const b: Record<string, unknown> = { ...base, data: rows, index: "month", series, showGrid: pgGrid.value };
    if (canStack.value) b.stacked = pgStacked.value;
    if (isLineArea.value) b.curve = pgCurve.value;
    return b;
  }
  if (type === "donut") return { ...base, data: dist, centerLabel: "Sessions" };
  if (type === "radar") return { ...base, data: radarRows, index: "axis", series: radarSeries, showGrid: pgGrid.value, height: 300 };
  return { ...base, data: heat, labels: heatX, yLabels: heatY, showValues: true };
});

const overviewCode = computed(() => {
  const type = pgType.value;
  const a: string[] = [`type="${type}"`];
  if (isCartesian.value) {
    a.push(':data="rows"', 'index="month"', ':series="series"');
    if (canStack.value && pgStacked.value) a.push("stacked");
    if (isLineArea.value && pgCurve.value !== "smooth") a.push(`curve="${pgCurve.value}"`);
    if (!pgGrid.value) a.push(':show-grid="false"');
  } else if (type === "donut") {
    a.push(':data="dist"', 'center-label="Sessions"');
  } else if (type === "radar") {
    a.push(':data="radar"', 'index="axis"', ':series="radarSeries"');
    if (!pgGrid.value) a.push(':show-grid="false"');
  } else {
    a.push(':data="matrix"', ':labels="x"', ':y-labels="y"', "show-values");
  }
  if (!pgLegend.value) a.push(':show-legend="false"');
  a.push(':height="280"');
  return `<Chart ${a.join(" ")} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const linesCode = `<Chart type="line" :data="rows" index="month" :series="series" />
<Chart type="area" :data="rows" index="month" :series="series" stacked />`;
const barsCode = `<Chart type="bar" :data="rows" index="month" :series="series" />
<Chart type="bar" :data="rows" index="month" :series="series" stacked
  :reference-lines="[{ value: 70, label: 'Target' }]" />`;
const scatterCode = `<Chart type="scatter" :data="[12,18,9,22,16,28,24,31]" :labels="months" />
<Chart type="sparkline" :data="[12,18,9,22,16,28,24,31]" color="primary" show-dot />`;
const polarCode = `<Chart type="donut" :data="dist" center-label="Sessions" />
<Chart type="pie"   :data="dist" />
<Chart type="gauge" :data="[72]" :gauge-max="100" center-label="Score" />
<Chart type="radial" :data="progress" :gauge-max="100" />`;
const radarCode = `<Chart
  type="radar"
  :data="radar"
  index="axis"
  :series="[{ key: 'A', name: 'Team A' }, { key: 'B', name: 'Team B' }]"
/>`;
const heatmapCode = `<Chart
  type="heatmap"
  :data="matrix"
  :labels="['Mon','Tue','Wed','Thu','Fri','Sat','Sun']"
  :y-labels="['12a','4a','8a','12p','4p','8p']"
  show-values
/>`;
const statCode = `<Stat label="Revenue" value="$48.5k" :icon="CurrencyDollarIcon"
  color="primary" :trend="{ value: 12.5 }">
  <template #chart>
    <Chart type="sparkline" :data="single" color="primary" show-dot :height="44" />
  </template>
</Stat>`;

const typesCode = `type ChartType =
  | 'sparkline' | 'line' | 'area' | 'bar' | 'scatter'
  | 'donut' | 'pie' | 'gauge' | 'radial'
  | 'radar' | 'heatmap';

// data is polymorphic:
//   number[]                     → single series / slices / radar axes
//   number[][]                   → heatmap matrix (rows × columns)
//   Record<string, unknown>[]    → row objects; pair with index + series
<Chart :data="[12, 18, 9, 22]" />                       // sparkline
<Chart type="bar" :data="rows" index="month" :series="['revenue','cost']" />`;

// ── API ───────────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  { name: "type", type: "ChartType", default: "'sparkline'", description: "Which renderer to draw." },
  { name: "data", type: "number[] | number[][] | Record<string, unknown>[]", required: true, description: "Polymorphic: a single series, a heatmap matrix, or row objects paired with index + series." },
  { name: "index", type: "string", description: "X-axis key when data is row objects." },
  { name: "series", type: "(string | { key; name?; color? })[]", description: "Which keys to plot from row data." },
  { name: "labels", type: "(string | number)[]", description: "X labels for number[] data (point / category / slice / heatmap column)." },
  { name: "yLabels", type: "(string | number)[]", description: "Y (row) labels for a heatmap." },
  { name: "color", type: "string", description: "Single-series color: a semantic token, a chart-N palette index, or raw CSS." },
  { name: "stacked", type: "boolean", default: "false", description: "Stack series (area / bar)." },
  { name: "curve", type: "'smooth' | 'linear' | 'step'", default: "'smooth'", description: "Line / area interpolation." },
  { name: "area", type: "boolean", description: "Fill under a line (turns line into area). On by default for sparkline." },
  { name: "showDots", type: "boolean", default: "false", description: "Show a dot on every data point (line / area)." },
  { name: "showGrid", type: "boolean", default: "true", description: "Show gridlines." },
  { name: "showXAxis", type: "boolean", default: "true", description: "Show the x axis." },
  { name: "showYAxis", type: "boolean", default: "true", description: "Show the y axis." },
  { name: "showLegend", type: "boolean", description: "Show the legend. Auto when there are ≥ 2 series." },
  { name: "showValues", type: "boolean", default: "false", description: "Print each cell's value inside a heatmap." },
  { name: "valueFormat", type: "(value, index) => string", description: "Format a value for the tooltip + y ticks." },
  { name: "referenceLines", type: "{ value; label?; color?; axis? }[]", description: "Threshold / target lines." },
  { name: "innerRadius", type: "number", default: "0.62", description: "Donut hole size as a fraction of the radius (0 = pie)." },
  { name: "centerLabel", type: "string", description: "Center label shown inside a donut / gauge." },
  { name: "gaugeMax", type: "number", description: "Denominator for a gauge / radial ratio." },
  { name: "height", type: "number", default: "40 / 220", description: "Height in px; width fills the container." },
  { name: "hover", type: "boolean", default: "true", description: "Hover crosshair + tooltip." },
  { name: "ariaLabel", type: "string", description: "Accessible label for the graphic." },
]);

const typePills = [
  { value: "line" }, { value: "area" }, { value: "bar" },
  { value: "donut" }, { value: "radar" }, { value: "heatmap" },
];
const curvePills = [{ value: "smooth" }, { value: "linear" }, { value: "step" }];
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.chart.title')"
    category="Data Display"
    import-path="import { Chart } from 'mood-ui'"
    :description="t('pages.data-display.chart.description')"
    :props-list="propsList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="340px" @reset="resetPlayground">
        <template #controls>
          <TbPills :label="t('pages.data-display.chart.controls.type')" :options="typePills" v-model="pgType" />
          <template v-if="isLineArea">
            <TbSep />
            <TbPills :label="t('pages.data-display.chart.controls.curve')" :options="curvePills" v-model="pgCurve" />
          </template>
          <template v-if="canStack">
            <TbSep />
            <TbToggle :label="t('pages.data-display.chart.controls.stacked')" v-model="pgStacked" />
          </template>
          <template v-if="canGrid">
            <TbSep />
            <TbToggle :label="t('pages.data-display.chart.controls.grid')" v-model="pgGrid" />
          </template>
          <TbSep />
          <TbToggle :label="t('pages.data-display.chart.controls.legend')" v-model="pgLegend" />
        </template>

        <div class="w-full max-w-2xl">
          <Chart v-bind="pgBind" />
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.chart.examples.lines.title')"
        :description="t('pages.data-display.chart.examples.lines.desc')"
        :code="linesCode"
      >
        <div class="grid sm:grid-cols-2 gap-6 w-full">
          <Chart type="line" :data="rows" index="month" :series="series" :value-format="money" :height="200" />
          <Chart type="area" :data="rows" index="month" :series="series" stacked :height="200" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.chart.examples.bars.title')"
        :description="t('pages.data-display.chart.examples.bars.desc')"
        :code="barsCode"
      >
        <div class="grid sm:grid-cols-2 gap-6 w-full">
          <Chart type="bar" :data="rows" index="month" :series="series" :height="200" />
          <Chart type="bar" :data="rows" index="month" :series="series" stacked :reference-lines="[{ value: 70, label: 'Target' }]" :height="200" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.chart.examples.scatter.title')"
        :description="t('pages.data-display.chart.examples.scatter.desc')"
        :code="scatterCode"
      >
        <div class="grid sm:grid-cols-2 gap-6 w-full items-center">
          <Chart type="scatter" :data="single" :labels="months" color="chart-4" :height="200" />
          <Chart type="sparkline" :data="single" color="primary" show-dot :height="60" :labels="months" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.chart.examples.polar.title')"
        :description="t('pages.data-display.chart.examples.polar.desc')"
        :code="polarCode"
      >
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <Chart type="donut" :data="dist" center-label="Sessions" :height="190" />
          <Chart type="pie" :data="dist" :height="190" />
          <Chart type="gauge" :data="[72]" :gauge-max="100" center-label="Score" color="primary" :height="190" />
          <Chart type="radial" :data="progress" :gauge-max="100" :height="190" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.chart.examples.radar.title')"
        :description="t('pages.data-display.chart.examples.radar.desc')"
        :code="radarCode"
      >
        <div class="w-full max-w-md mx-auto">
          <Chart type="radar" :data="radarRows" index="axis" :series="radarSeries" :height="300" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.chart.examples.heatmap.title')"
        :description="t('pages.data-display.chart.examples.heatmap.desc')"
        :code="heatmapCode"
      >
        <div class="w-full">
          <Chart type="heatmap" :data="heat" :labels="heatX" :y-labels="heatY" show-values :height="240" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.chart.examples.stat.title')"
        :description="t('pages.data-display.chart.examples.stat.desc')"
        :code="statCode"
      >
        <div class="grid sm:grid-cols-2 gap-4 w-full">
          <Stat label="Revenue" value="$48.5k" :icon="CurrencyDollarIcon" color="primary" :trend="{ value: 12.5 }">
            <template #chart><Chart type="sparkline" :data="single" color="primary" show-dot :height="44" /></template>
          </Stat>
          <Stat variant="outlined" label="Traffic">
            <template #chart><Chart type="sparkline" :data="single" color="chart-3" area :height="80" :labels="months" /></template>
          </Stat>
        </div>
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.data-display.chart.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.chart.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
