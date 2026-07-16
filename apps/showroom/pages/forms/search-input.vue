<script setup lang="ts">
import { ref, computed } from "vue";
import { SearchInput, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  HomeIcon,
  Cog6ToothIcon,
  UserIcon,
  DocumentTextIcon,
} from "@heroicons/vue/24/outline";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc, EmitDoc } from "~/types/component-doc";
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
  { keys: ["Tab"], action: t("pages.forms.searchInput.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.searchInput.a11y.kbShiftTab") },
  { keys: ["Type"], action: t("pages.forms.searchInput.a11y.kbType") },
  { keys: ["Enter"], action: t("pages.forms.searchInput.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.forms.searchInput.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"search"',
    desc: t("pages.forms.searchInput.a11y.ariaSearch"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.searchInput.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.searchInput.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.searchInput.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.searchInput.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.searchInput.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.searchInput.a11y.focusNative"),
  t("pages.forms.searchInput.a11y.focusShortcut"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref("");
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgShortcut = ref(false);
const pgLoading = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = "";
  pgVariant.value = "outline";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgShortcut.value = false;
  pgLoading.value = false;
  pgDisabled.value = false;
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

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "outline") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgShortcut.value) parts.push('shortcut="cmd+k"');
  if (pgLoading.value) parts.push(':loading="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<SearchInput v-model="query" placeholder="Buscar componentes…"${attrs} />`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { SearchInput } from 'mood-ui';

const query = ref('');
<\/script>

<template>
  <SearchInput v-model="query" placeholder="Buscar componentes…" />
</template>`;

const debounceCode = `<script setup lang="ts">
import { ref } from 'vue';
import { SearchInput } from 'mood-ui';

const query = ref('');

function onSearch(value: string) {
  console.log('Search:', value);
}
<\/script>

<template>
  <SearchInput
    v-model="query"
    :debounce="400"
    placeholder="Búsqueda con debounce 400ms"
    @search="onSearch"
  />
</template>`;

const shortcutCode = `<script setup lang="ts">
import { SearchInput } from 'mood-ui';
<\/script>

<template>
  <SearchInput placeholder="Buscar" shortcut="cmd+k" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { SearchInput } from 'mood-ui';
<\/script>

<template>
  <SearchInput size="small"  placeholder="small"  />
  <SearchInput size="medium" placeholder="medium" />
  <SearchInput size="large"  placeholder="large"  />
</template>`;

const loadingCode = `<script setup lang="ts">
import { ref } from 'vue';
import { SearchInput } from 'mood-ui';

const query = ref('vue');
<\/script>

<template>
  <SearchInput v-model="query" :loading="true" placeholder="Buscando…" />
</template>`;

// Example state
const exBasic = ref("");
const exDebounce = ref("");

// Results dropdown example — host-owned filtering fed into :items
const allResults = [
  { id: "dash", label: "Dashboard", group: "Go to", icon: HomeIcon, shortcut: "⌘D" },
  { id: "settings", label: "Settings", group: "Go to", icon: Cog6ToothIcon },
  { id: "ana", label: "Ana López", description: "ana@acme.com", group: "Clients", icon: UserIcon },
  { id: "bruno", label: "Bruno Díaz", description: "bruno@beta.io", group: "Clients", icon: UserIcon },
  { id: "inv", label: "Invoice #1042", description: "Paid · $2,300", group: "Records", icon: DocumentTextIcon },
];
const exResultsQuery = ref("");
const exResults = computed(() => {
  const q = exResultsQuery.value.trim().toLowerCase();
  if (!q) return allResults;
  return allResults.filter(
    (r) => r.label.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q),
  );
});

const resultsCode = `<script setup lang="ts">
import { ref, computed } from 'vue';
import { SearchInput } from 'mood-ui';

const query = ref('');
const all = [
  { label: 'Dashboard', group: 'Go to', shortcut: '⌘D' },
  { label: 'Ana López', description: 'ana@acme.com', group: 'Clients' },
  // …
];
const items = computed(() =>
  all.filter((r) => r.label.toLowerCase().includes(query.value.toLowerCase())),
);
<\/script>

<template>
  <SearchInput
    v-model="query"
    :items="items"
    empty-text="No matches"
    placeholder="Search people & pages…"
    @select="(item) => console.log(item.label)"
  />
</template>`;

const typesCode = `interface SearchResultItem {
  id?: string | number;
  label: string;
  description?: string;
  icon?: Component;
  group?: string;      // consecutive items share one header
  shortcut?: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
}

export interface SearchInput {
  modelValue?: string | null;
  items?: SearchResultItem[];   // renders a results popover under the field
  open?: boolean;               // v-model:open
  emptyText?: string;
  resultsPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  variant?: 'outline' | 'filled' | 'ghost';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  halo?: 'tinted' | 'neutral' | 'off';
  fullWidth?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  debounce?: number;
  shortcut?: string;
  id?: string;
  name?: string;
  autofocus?: boolean;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string | null",
    description: t("pages.forms.searchInput.props.modelValue"),
  },
  {
    name: "items",
    type: "SearchResultItem[]",
    description: t("pages.forms.searchInput.props.items"),
  },
  {
    name: "emptyText",
    type: "string",
    description: t("pages.forms.searchInput.props.emptyText"),
  },
  {
    name: "resultsPlacement",
    type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'",
    default: "'bottom-start'",
    description: t("pages.forms.searchInput.props.resultsPlacement"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.searchInput.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Search…'",
    description: t("pages.forms.searchInput.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.searchInput.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.searchInput.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.searchInput.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.searchInput.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.searchInput.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.forms.searchInput.props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    description: t("pages.forms.searchInput.props.halo"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.searchInput.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.searchInput.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.searchInput.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.searchInput.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.searchInput.props.loading"),
  },
  {
    name: "maxLength",
    type: "number",
    description: t("pages.forms.searchInput.props.maxLength"),
  },
  {
    name: "showCounter",
    type: "boolean",
    default: "false",
    description: t("pages.forms.searchInput.props.showCounter"),
  },
  {
    name: "debounce",
    type: "number",
    default: "0",
    description: t("pages.forms.searchInput.props.debounce"),
  },
  {
    name: "shortcut",
    type: "string",
    description: t("pages.forms.searchInput.props.shortcut"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.searchInput.props.name"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.searchInput.props.id"),
  },
  {
    name: "autofocus",
    type: "boolean",
    default: "false",
    description: t("pages.forms.searchInput.props.autofocus"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.searchInput.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string",
    description: t("pages.forms.searchInput.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string",
    description: t("pages.forms.searchInput.emits.change"),
  },
  {
    name: "focus",
    payload: "FocusEvent",
    description: t("pages.forms.searchInput.emits.focus"),
  },
  {
    name: "blur",
    payload: "FocusEvent",
    description: t("pages.forms.searchInput.emits.blur"),
  },
  {
    name: "clear",
    payload: "void",
    description: t("pages.forms.searchInput.emits.clear"),
  },
  {
    name: "search",
    payload: "string",
    description: t("pages.forms.searchInput.emits.search"),
  },
  {
    name: "select",
    payload: "SearchResultItem",
    description: t("pages.forms.searchInput.emits.select"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.searchInput.title')"
    category="Forms"
    import-path="import { SearchInput } from 'mood-ui'"
    :description="t('pages.forms.searchInput.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.forms.searchInput.controls.variant')"
            :options="[
              { value: 'outline' },
              { value: 'filled' },
              { value: 'ghost' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.searchInput.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.searchInput.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.forms.searchInput.controls.shortcut')"
            v-model="pgShortcut"
          />
          <TbToggle
            :label="t('pages.forms.searchInput.controls.loading')"
            v-model="pgLoading"
          />
          <TbToggle
            :label="t('pages.forms.searchInput.controls.disabled')"
            v-model="pgDisabled"
          />
        </template>

        <SearchInput
          v-model="pgValue"
          :placeholder="t('pages.forms.searchInput.playground.placeholder')"
          ariaLabel="Search"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :shortcut="pgShortcut ? 'cmd+k' : undefined"
          :loading="pgLoading"
          :disabled="pgDisabled"
          style="width: 320px"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.searchInput.examples.results.title')"
        :description="t('pages.forms.searchInput.examples.results.desc')"
        :code="resultsCode"
      >
        <SearchInput
          v-model="exResultsQuery"
          :items="exResults"
          empty-text="No matches"
          :placeholder="t('pages.forms.searchInput.examples.results.ph')"
          ariaLabel="Search"
          style="width: 340px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.searchInput.examples.basic.title')"
        :description="t('pages.forms.searchInput.examples.basic.desc')"
        :code="basicCode"
      >
        <SearchInput
          v-model="exBasic"
          :placeholder="t('pages.forms.searchInput.examples.basic.ph')"
          ariaLabel="Search"
          style="width: 320px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.searchInput.examples.debounce.title')"
        :description="t('pages.forms.searchInput.examples.debounce.desc')"
        :code="debounceCode"
      >
        <SearchInput
          v-model="exDebounce"
          :debounce="400"
          :placeholder="t('pages.forms.searchInput.examples.debounce.ph')"
          ariaLabel="Search"
          style="width: 320px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.searchInput.examples.shortcut.title')"
        :description="t('pages.forms.searchInput.examples.shortcut.desc')"
        :code="shortcutCode"
      >
        <SearchInput
          :placeholder="t('pages.forms.searchInput.examples.shortcut.ph')"
          ariaLabel="Search"
          shortcut="cmd+k"
          style="width: 320px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.searchInput.examples.sizes.title')"
        :description="t('pages.forms.searchInput.examples.sizes.desc')"
        :code="sizesCode"
      >
        <SearchInput size="small" placeholder="small" ariaLabel="small" style="width: 260px" />
        <SearchInput size="medium" placeholder="medium" ariaLabel="medium" style="width: 260px" />
        <SearchInput size="large" placeholder="large" ariaLabel="large" style="width: 260px" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.searchInput.examples.loading.title')"
        :description="t('pages.forms.searchInput.examples.loading.desc')"
        :code="loadingCode"
      >
        <SearchInput
          model-value="vue"
          :loading="true"
          :placeholder="t('pages.forms.searchInput.examples.loading.ph')"
          ariaLabel="Search"
          style="width: 320px"
        />
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
        {{ t("pages.forms.searchInput.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.searchInput.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
