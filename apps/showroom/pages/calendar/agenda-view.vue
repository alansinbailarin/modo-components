<script setup lang="ts">
import { ref, computed } from "vue";
import { AgendaView, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { CalendarEvent } from "../../../interfaces/data-display/calendar/MonthView.interface";
import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.agendaView.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.agendaView.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.agendaView.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.agendaView.a11y.focusNative"),
]);

// ── Sample events ─────────────────────────────────────────────────────────────
const today = new Date();
function at(h: number, m = 0, dayOffset = 0): Date {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Stand-up",
    start: at(9, 0, 0),
    end: at(9, 30, 0),
    color: "primary",
  },
  {
    id: "2",
    title: "Sprint review",
    start: at(11, 0, 0),
    end: at(12, 0, 0),
    color: "success",
  },
  {
    id: "3",
    title: "Client demo",
    start: at(15, 0, 1),
    end: at(16, 0, 1),
    color: "info",
  },
  {
    id: "4",
    title: "Onboarding",
    start: at(10, 0, 3),
    end: at(11, 30, 3),
    color: "warning",
  },
  {
    id: "5",
    title: "UX Workshop",
    start: at(14, 0, 5),
    end: at(17, 0, 5),
    color: "purple",
  },
  {
    id: "6",
    title: "Launch",
    start: at(9, 0, 7),
    end: at(18, 0, 7),
    color: "danger",
    allDay: true,
  },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgDate = ref(new Date());
const pgDaysToShow = ref(7);
const pgShowEmptyDays = ref(false);
const pgFormat = ref<"12h" | "24h">("24h");
const pgBordered = ref(true);

function resetPlayground() {
  pgDate.value = new Date();
  pgDaysToShow.value = 7;
  pgShowEmptyDays.value = false;
  pgFormat.value = "24h";
  pgBordered.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="date"', ':events="events"'];
  if (pgDaysToShow.value !== 7)
    parts.push(`:days-to-show="${pgDaysToShow.value}"`);
  if (pgShowEmptyDays.value) parts.push("show-empty-days");
  if (pgFormat.value !== "24h") parts.push(`format="${pgFormat.value}"`);
  if (!pgBordered.value) parts.push(':bordered="false"');
  return `<AgendaView ${parts.join(" ")} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic = ref(new Date());
const dateLong = ref(new Date());
const dateEmpty = ref(new Date());
const date12h = ref(new Date());

const emptyEvents: CalendarEvent[] = [];

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AgendaView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <AgendaView v-model="date" :events="events" :days-to-show="7" />
</template>`;

const longCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AgendaView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <AgendaView v-model="date" :events="events" :days-to-show="14" />
</template>`;

const emptyCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AgendaView } from 'mood-ui';

const date = ref(new Date());
<\/script>

<template>
  <AgendaView
    v-model="date"
    :events="[]"
    :days-to-show="7"
    show-empty-days
    empty-text="No upcoming events"
  />
</template>`;

const fmt12hCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AgendaView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <AgendaView v-model="date" :events="events" :days-to-show="7" format="12h" />
</template>`;

const typesCode = `export interface AgendaView {
  modelValue?: Date;
  events?: CalendarEvent[];
  locale?: string;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  bordered?: boolean;
  minDate?: Date;
  maxDate?: Date;
  daysToShow?: number;
  daysBefore?: number;
  showEmptyDays?: boolean;
  showHeader?: boolean;
  showMonthSeparator?: boolean;
  showYearNavigation?: boolean;
  showMonthYearSelects?: boolean;
  showTodayButton?: boolean;
  dayNameFormat?: 'narrow' | 'short' | 'long';
  dayNameCase?: 'upper' | 'lower' | 'capitalize' | 'normal';
  format?: '12h' | '24h';
  readonly?: boolean;
  highlightedDates?: Date[];
  disabledDates?: Date[];
  disabledWeekdays?: number[];
  emptyText?: string;
  loadMoreChunk?: number;
  enableKeyboardNavigation?: boolean;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date",
    description: t("pages.data-display.agendaView.props.modelValue"),
  },
  {
    name: "events",
    type: "CalendarEvent[]",
    description: t("pages.data-display.agendaView.props.events"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.data-display.agendaView.props.locale"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    description: t("pages.data-display.agendaView.props.color"),
  },
  {
    name: "daysToShow",
    type: "number",
    default: "30",
    description: t("pages.data-display.agendaView.props.daysToShow"),
  },
  {
    name: "daysBefore",
    type: "number",
    default: "0",
    description: t("pages.data-display.agendaView.props.daysBefore"),
  },
  {
    name: "showEmptyDays",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.agendaView.props.showEmptyDays"),
  },
  {
    name: "showMonthSeparator",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.agendaView.props.showMonthSeparator"),
  },
  {
    name: "showHeader",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.agendaView.props.showHeader"),
  },
  {
    name: "format",
    type: "'12h' | '24h'",
    default: "'24h'",
    description: t("pages.data-display.agendaView.props.format"),
  },
  {
    name: "emptyText",
    type: "string",
    description: t("pages.data-display.agendaView.props.emptyText"),
  },
  {
    name: "highlightedDates",
    type: "Date[]",
    description: t("pages.data-display.agendaView.props.highlightedDates"),
  },
  {
    name: "disabledDates",
    type: "Date[]",
    description: t("pages.data-display.agendaView.props.disabledDates"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.agendaView.props.bordered"),
  },
  {
    name: "maxHeight",
    type: "number | string",
    description: t("pages.data-display.agendaView.props.maxHeight"),
  },
  {
    name: "loadMoreChunk",
    type: "number",
    description: t("pages.data-display.agendaView.props.loadMoreChunk"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date",
    description: t("pages.data-display.agendaView.emits.updateModelValue"),
  },
  {
    name: "event-click",
    payload: "(event: CalendarEvent, nativeEvent: MouseEvent)",
    description: t("pages.data-display.agendaView.emits.eventClick"),
  },
  {
    name: "day-click",
    payload: "(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)",
    description: t("pages.data-display.agendaView.emits.dayClick"),
  },
  {
    name: "create-event",
    payload:
      "(date: Date, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent)",
    description: t("pages.data-display.agendaView.emits.createEvent"),
  },
  {
    name: "load-more",
    payload: "'forward' | 'backward'",
    description: t("pages.data-display.agendaView.emits.loadMore"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.agendaView.title')"
    category="Calendar"
    import-path="import { AgendaView } from 'mood-ui'"
    :description="t('pages.data-display.agendaView.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="400px"
        @reset="resetPlayground"
      >
        <template #controls>
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >{{ t("pages.data-display.agendaView.controls.days") }}</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="d in [3, 7, 14, 30]"
                :key="d"
                type="button"
                class="px-2 py-1 text-xs transition-colors"
                :class="
                  pgDaysToShow === d
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgDaysToShow = d"
              >
                {{ d }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >{{ t("pages.data-display.agendaView.controls.format") }}</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="f in ['24h', '12h']"
                :key="f"
                type="button"
                class="px-2 py-1 text-xs transition-colors"
                :class="
                  pgFormat === f
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgFormat = f as typeof pgFormat"
              >
                {{ f }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgShowEmptyDays
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowEmptyDays = !pgShowEmptyDays"
          >
            {{ t("pages.data-display.agendaView.controls.emptyDays") }}
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgBordered
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgBordered = !pgBordered"
          >
            {{ t("pages.data-display.agendaView.controls.borders") }}
          </button>
        </template>

        <div class="w-full max-w-2xl">
          <AgendaView
            v-model="pgDate"
            :events="sampleEvents"
            :days-to-show="pgDaysToShow"
            :show-empty-days="pgShowEmptyDays"
            :format="pgFormat"
            :bordered="pgBordered"
          />
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.agendaView.examples.basic.title')"
        :description="t('pages.data-display.agendaView.examples.basic.desc')"
        :code="basicCode"
        min-height="400px"
      >
        <div class="w-full max-w-2xl">
          <AgendaView
            v-model="dateBasic"
            :events="sampleEvents"
            :days-to-show="7"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.agendaView.examples.extendedRange.title')"
        :description="
          t('pages.data-display.agendaView.examples.extendedRange.desc')
        "
        :code="longCode"
        min-height="400px"
      >
        <div class="w-full max-w-2xl">
          <AgendaView
            v-model="dateLong"
            :events="sampleEvents"
            :days-to-show="14"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.agendaView.examples.emptyState.title')"
        :description="
          t('pages.data-display.agendaView.examples.emptyState.desc')
        "
        :code="emptyCode"
        min-height="320px"
      >
        <div class="w-full max-w-2xl">
          <AgendaView
            v-model="dateEmpty"
            :events="emptyEvents"
            :days-to-show="7"
            show-empty-days
            empty-text="No upcoming events"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.agendaView.examples.format12h.title')"
        :description="
          t('pages.data-display.agendaView.examples.format12h.desc')
        "
        :code="fmt12hCode"
        min-height="400px"
      >
        <div class="w-full max-w-2xl">
          <AgendaView
            v-model="date12h"
            :events="sampleEvents"
            :days-to-show="7"
            format="12h"
          />
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
        {{ t("pages.data-display.agendaView.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.agendaView.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
