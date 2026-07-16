<script setup lang="ts">
import { ref, computed } from "vue";
import { Stat, Chart, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  UsersIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.stat.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.data-display.stat.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.stat.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.stat.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"plain" | "outlined" | "filled">("outlined");
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgTrend = ref<"up" | "down" | "none">("up");
const pgLoading = ref(false);

function resetPlayground() {
  pgVariant.value = "outlined";
  pgSize.value = "medium";
  pgColor.value = "primary";
  pgTrend.value = "up";
  pgLoading.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  {
    value: "success" as const,
    bg: "var(--color-emerald-500)",
    label: "Success",
  },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

const typesCode = `export interface Stat {
  label: string;
  value: string | number;
  description?: string;
  icon?: Component;
  trend?: {
    value: number;
    label?: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  variant?: 'plain' | 'outlined' | 'filled';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}`;

const playgroundTrend = computed(() => {
  if (pgTrend.value === "up") return { value: 12.5 };
  if (pgTrend.value === "down") return { value: -8.3 };
  return undefined;
});

const overviewCode = computed(() => {
  const parts: string[] = ['label="Revenue"', 'value="$48,592"'];
  if (pgVariant.value !== "plain") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgTrend.value === "up") parts.push(':trend="{ value: 12.5 }"');
  if (pgTrend.value === "down") parts.push(':trend="{ value: -8.3 }"');
  if (pgLoading.value) parts.push("loading");
  return `<Stat ${parts.join(" ")} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { Stat } from 'mood-ui';
<\/script>

<template>
  <Stat label="Revenue" value="$48,592" />
</template>`;

const trendCode = `<script setup lang="ts">
import { Stat } from 'mood-ui';
<\/script>

<template>
  <Stat
    label="Active users"
    value="12,403"
    :trend="{ value: 12.5 }"
    description="vs. last month"
  />
</template>`;

const iconCode = `<script setup lang="ts">
import { Stat } from 'mood-ui';
import { BanknotesIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Stat
    label="Revenue"
    value="$48,592"
    :icon="BanknotesIcon"
    color="success"
    variant="outlined"
    :trend="{ value: 12.5 }"
  />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Stat } from 'mood-ui';
<\/script>

<template>
  <Stat label="Small"  value="123" size="small"  variant="outlined" :trend="{ value: 5 }" />
  <Stat label="Medium" value="123" size="medium" variant="outlined" :trend="{ value: 5 }" />
  <Stat label="Large"  value="123" size="large"  variant="outlined" :trend="{ value: 5 }" />
</template>`;

const spark = [12, 18, 9, 22, 16, 28, 24, 31, 26, 34];

const chartCode = `<script setup lang="ts">
import { Stat, Chart } from 'mood-ui';
import { BanknotesIcon } from '@heroicons/vue/24/outline';

const data = [12, 18, 9, 22, 16, 28, 24, 31, 26, 34];
<\/script>

<template>
  <!-- KPI card with a sparkline -->
  <Stat label="Revenue" value="$48.5k" :icon="BanknotesIcon"
    color="primary" :trend="{ value: 12.5 }">
    <template #chart>
      <Chart type="sparkline" :data="data" color="primary" show-dot :height="44" />
    </template>
  </Stat>

  <!-- Chart-only tile (no value — the chart fills the card) -->
  <Stat variant="outlined" label="Traffic">
    <template #chart>
      <Chart type="sparkline" :data="data" color="chart-3" area :height="80" />
    </template>
  </Stat>
</template>`;

const gridCode = `<script setup lang="ts">
import { Stat } from 'mood-ui';
import { BanknotesIcon, UsersIcon, ShoppingCartIcon, ArrowTrendingUpIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <div class="grid sm:grid-cols-2 gap-4">
    <Stat label="Revenue"    value="$48,592" :icon="BanknotesIcon"      color="success" variant="outlined" :trend="{ value: 12.5 }" />
    <Stat label="Users"      value="12,403"  :icon="UsersIcon"          color="primary" variant="outlined" :trend="{ value: 8.2 }" />
    <Stat label="Orders"     value="3,201"   :icon="ShoppingCartIcon"   color="warning" variant="outlined" :trend="{ value: -3.1 }" />
    <Stat label="Conversion" value="3.42%"   :icon="ArrowTrendingUpIcon" color="danger"  variant="outlined" :trend="{ value: -1.5, label: '-1.5pp' }" />
  </div>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "label",
    type: "string",
    required: true,
    description: t("pages.data-display.stat.props.label"),
  },
  {
    name: "value",
    type: "string | number",
    required: true,
    description: t("pages.data-display.stat.props.value"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.data-display.stat.props.description"),
  },
  {
    name: "icon",
    type: "Component",
    description: t("pages.data-display.stat.props.icon"),
  },
  {
    name: "trend",
    type: "{ value: number; label?: string; direction?: 'up' | 'down' | 'neutral' }",
    description: t("pages.data-display.stat.props.trend"),
  },
  {
    name: "variant",
    type: "'plain' | 'outlined' | 'filled'",
    default: "'plain'",
    description: t("pages.data-display.stat.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'default'",
    description: t("pages.data-display.stat.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    description: t("pages.data-display.stat.props.size"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.stat.props.loading"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.stat.title')"
    category="Data Display"
    import-path="import { Stat } from 'mood-ui'"
    :description="t('pages.data-display.stat.description')"
    :props-list="propsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.data-display.stat.controls.variant')"
            :options="[
              { value: 'plain' },
              { value: 'outlined' },
              { value: 'filled' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.data-display.stat.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.stat.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.stat.controls.trend')"
            :options="[{ value: 'up' }, { value: 'down' }, { value: 'none' }]"
            v-model="pgTrend"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.data-display.stat.controls.loading')"
            v-model="pgLoading"
          />
        </template>

        <Stat
          label="Revenue"
          value="$48,592"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :icon="BanknotesIcon"
          :trend="playgroundTrend"
          description="vs. last month"
          :loading="pgLoading"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.stat.examples.basic.title')"
        :description="t('pages.data-display.stat.examples.basic.desc')"
        :code="basicCode"
      >
        <Stat label="Revenue" value="$48,592" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.stat.examples.trend.title')"
        :description="t('pages.data-display.stat.examples.trend.desc')"
        :code="trendCode"
      >
        <Stat
          label="Active users"
          value="12,403"
          :trend="{ value: 12.5 }"
          description="vs. last month"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.stat.examples.icon.title')"
        :description="t('pages.data-display.stat.examples.icon.desc')"
        :code="iconCode"
      >
        <Stat
          label="Revenue"
          value="$48,592"
          :icon="BanknotesIcon"
          color="success"
          variant="outlined"
          :trend="{ value: 12.5 }"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.stat.examples.sizes.title')"
        :description="t('pages.data-display.stat.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="grid sm:grid-cols-3 gap-4 w-full">
          <Stat
            label="Small"
            value="123"
            size="small"
            variant="outlined"
            :trend="{ value: 5 }"
          />
          <Stat
            label="Medium"
            value="123"
            size="medium"
            variant="outlined"
            :trend="{ value: 5 }"
          />
          <Stat
            label="Large"
            value="123"
            size="large"
            variant="outlined"
            :trend="{ value: 5 }"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.stat.examples.grid.title')"
        :description="t('pages.data-display.stat.examples.grid.desc')"
        :code="gridCode"
      >
        <div class="grid sm:grid-cols-2 gap-4 w-full">
          <Stat
            label="Revenue"
            value="$48,592"
            :icon="BanknotesIcon"
            color="success"
            variant="outlined"
            :trend="{ value: 12.5 }"
          />
          <Stat
            label="Users"
            value="12,403"
            :icon="UsersIcon"
            color="primary"
            variant="outlined"
            :trend="{ value: 8.2 }"
          />
          <Stat
            label="Orders"
            value="3,201"
            :icon="ShoppingCartIcon"
            color="warning"
            variant="outlined"
            :trend="{ value: -3.1 }"
          />
          <Stat
            label="Conversion"
            value="3.42%"
            :icon="ArrowTrendingUpIcon"
            color="danger"
            variant="outlined"
            :trend="{ value: -1.5, label: '-1.5pp' }"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.stat.examples.chart.title')"
        :description="t('pages.data-display.stat.examples.chart.desc')"
        :code="chartCode"
      >
        <div class="grid sm:grid-cols-2 gap-4 w-full">
          <Stat
            label="Revenue"
            value="$48.5k"
            :icon="BanknotesIcon"
            color="primary"
            :trend="{ value: 12.5 }"
          >
            <template #chart>
              <Chart type="sparkline" :data="spark" color="primary" show-dot :height="44" />
            </template>
          </Stat>
          <Stat variant="outlined" label="Traffic">
            <template #chart>
              <Chart type="sparkline" :data="spark" color="chart-3" area :height="80" />
            </template>
          </Stat>
        </div>
      </ComponentPreview>
    </template>

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.data-display.stat.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.stat.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
