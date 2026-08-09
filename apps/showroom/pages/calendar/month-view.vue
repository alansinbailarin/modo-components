<script setup lang="ts">
import { ref, computed } from "vue";
import { MonthView, Typography } from "mood-ui";
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
  { keys: ["Tab"], action: t("pages.data-display.monthView.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.monthView.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.monthView.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.monthView.a11y.focusNative"),
]);

// ── Sample events ─────────────────────────────────────────────────────────────
const today = new Date();
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Stand-up",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      9,
      0,
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      9,
      30,
    ),
    color: "primary",
  },
  {
    id: "2",
    title: "UI Design",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      11,
      0,
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
    ),
    color: "success",
  },
  {
    id: "3",
    title: "Client demo",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 2,
      15,
      0,
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 2,
      16,
      30,
    ),
    color: "warning",
  },
  {
    id: "4",
    title: "Workshop",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 3,
      10,
      0,
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 3,
      12,
      0,
    ),
    color: "info",
    allDay: true,
  },
  {
    id: "5",
    title: "Launch",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 5,
      9,
      0,
    ),
    end: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 5,
      18,
      0,
    ),
    color: "danger",
  },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgDate = ref(new Date());
const pgShowWeekNumbers = ref(false);
const pgFirstDayOfWeek = ref<0 | 1>(1);
const pgFixedWeeks = ref(true);
const pgShowOutsideDays = ref(true);

function resetPlayground() {
  pgDate.value = new Date();
  pgShowWeekNumbers.value = false;
  pgFirstDayOfWeek.value = 1;
  pgFixedWeeks.value = true;
  pgShowOutsideDays.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="date"', ':events="events"'];
  if (pgShowWeekNumbers.value) parts.push("show-week-numbers");
  if (pgFirstDayOfWeek.value !== 1)
    parts.push(`:first-day-of-week="${pgFirstDayOfWeek.value}"`);
  if (!pgFixedWeeks.value) parts.push(':fixed-weeks="false"');
  if (!pgShowOutsideDays.value) parts.push(':show-outside-days="false"');
  return `<MonthView ${parts.join(" ")} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic = ref(new Date());
const dateEvents = ref(new Date());
const dateWeekN = ref(new Date());
const dateSunday = ref(new Date());

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MonthView } from 'mood-ui';

const date = ref(new Date());
<\/script>

<template>
  <MonthView v-model="date" />
</template>`;

const eventsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MonthView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [
  { id: '1', title: 'Stand-up', start: new Date(), end: new Date(), color: 'primary' },
];
<\/script>

<template>
  <MonthView v-model="date" :events="events" />
</template>`;

const weekNumCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MonthView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <MonthView v-model="date" :events="events" show-week-numbers />
</template>`;

const sundayCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MonthView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <MonthView v-model="date" :events="events" :first-day-of-week="0" />
</template>`;

const typesCode = `export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'info' | 'purple' | 'pink';
  colorHex?: string;
  resourceId?: string | number;
  readonly?: boolean;
  description?: string;
  meta?: Record<string, unknown>;
}

export interface MonthView {
  modelValue?: Date;
  events?: CalendarEvent[];
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  maxEventsPerDay?: number;
  showWeekNumbers?: boolean;
  fixedWeeks?: boolean;
  showHeader?: boolean;
  bordered?: boolean;
  keyboardNavigation?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDaysOfWeek?: number[];
  dayNameFormat?: 'narrow' | 'short' | 'long';
  dayNameCase?: 'upper' | 'lower' | 'capitalize' | 'normal';
  highlightWeekends?: boolean;
  showOutsideDays?: boolean;
  showMonthYearSelects?: boolean;
  showYearJump?: boolean;
  draggableEvents?: boolean;
  laneHeight?: number;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date",
    description: t("pages.data-display.monthView.props.modelValue"),
  },
  {
    name: "events",
    type: "CalendarEvent[]",
    description: t("pages.data-display.monthView.props.events"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.data-display.monthView.props.locale"),
  },
  {
    name: "firstDayOfWeek",
    type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
    description: t("pages.data-display.monthView.props.firstDayOfWeek"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    description: t("pages.data-display.monthView.props.color"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.monthView.props.radius"),
  },
  {
    name: "maxEventsPerDay",
    type: "number",
    description: t("pages.data-display.monthView.props.maxEventsPerDay"),
  },
  {
    name: "showWeekNumbers",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.monthView.props.showWeekNumbers"),
  },
  {
    name: "fixedWeeks",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.monthView.props.fixedWeeks"),
  },
  {
    name: "showOutsideDays",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.monthView.props.showOutsideDays"),
  },
  {
    name: "showHeader",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.monthView.props.showHeader"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.monthView.props.bordered"),
  },
  {
    name: "maxHeight",
    type: "number | string",
    description: t("pages.data-display.monthView.props.maxHeight"),
  },
  {
    name: "highlightWeekends",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.monthView.props.highlightWeekends"),
  },
  {
    name: "minDate / maxDate",
    type: "Date",
    description: t("pages.data-display.monthView.props.minDateMaxDate"),
  },
  {
    name: "disabledDates",
    type: "Date[]",
    description: t("pages.data-display.monthView.props.disabledDates"),
  },
  {
    name: "disabledDaysOfWeek",
    type: "number[]",
    description: t("pages.data-display.monthView.props.disabledDaysOfWeek"),
  },
  {
    name: "draggableEvents",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.monthView.props.draggableEvents"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date",
    description: t("pages.data-display.monthView.emits.updateModelValue"),
  },
  {
    name: "event-click",
    payload: "(event: CalendarEvent, nativeEvent: MouseEvent)",
    description: t("pages.data-display.monthView.emits.eventClick"),
  },
  {
    name: "day-click",
    payload: "(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)",
    description: t("pages.data-display.monthView.emits.dayClick"),
  },
  {
    name: "more-click",
    payload: "(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)",
    description: t("pages.data-display.monthView.emits.moreClick"),
  },
  {
    name: "create-event",
    payload: "(date: Date, nativeEvent: MouseEvent | KeyboardEvent)",
    description: t("pages.data-display.monthView.emits.createEvent"),
  },
  {
    name: "event-drop",
    payload: "(event: CalendarEvent, newStart: Date, newEnd: Date | undefined)",
    description: t("pages.data-display.monthView.emits.eventDrop"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.monthView.title')"
    category="Calendar"
    import-path="import { MonthView } from 'mood-ui'"
    :description="t('pages.data-display.monthView.description')"
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
              >{{ t("pages.data-display.monthView.controls.weekStart") }}</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="d in [
                  { v: 0, l: t('pages.data-display.monthView.controls.sun') },
                  { v: 1, l: t('pages.data-display.monthView.controls.mon') },
                ]"
                :key="d.v"
                type="button"
                class="px-2 py-1 text-xs transition-colors"
                :class="
                  pgFirstDayOfWeek === d.v
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgFirstDayOfWeek = d.v as 0 | 1"
              >
                {{ d.l }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgShowWeekNumbers
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowWeekNumbers = !pgShowWeekNumbers"
          >
            {{ t("pages.data-display.monthView.controls.weekNumbers") }}
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgFixedWeeks
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgFixedWeeks = !pgFixedWeeks"
          >
            {{ t("pages.data-display.monthView.controls.fixedWeeks") }}
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgShowOutsideDays
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowOutsideDays = !pgShowOutsideDays"
          >
            {{ t("pages.data-display.monthView.controls.outsideDays") }}
          </button>
        </template>

        <div class="w-full">
          <MonthView
            v-model="pgDate"
            :events="sampleEvents"
            :show-week-numbers="pgShowWeekNumbers"
            :first-day-of-week="pgFirstDayOfWeek"
            :fixed-weeks="pgFixedWeeks"
            :show-outside-days="pgShowOutsideDays"
          />
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.monthView.examples.basic.title')"
        :description="t('pages.data-display.monthView.examples.basic.desc')"
        :code="basicCode"
        min-height="400px"
      >
        <div class="w-full"><MonthView v-model="dateBasic" /></div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.monthView.examples.events.title')"
        :description="t('pages.data-display.monthView.examples.events.desc')"
        :code="eventsCode"
        min-height="400px"
      >
        <div class="w-full">
          <MonthView v-model="dateEvents" :events="sampleEvents" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.monthView.examples.weekNumbers.title')"
        :description="
          t('pages.data-display.monthView.examples.weekNumbers.desc')
        "
        :code="weekNumCode"
        min-height="400px"
      >
        <div class="w-full">
          <MonthView
            v-model="dateWeekN"
            :events="sampleEvents"
            show-week-numbers
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.monthView.examples.sundayStart.title')"
        :description="
          t('pages.data-display.monthView.examples.sundayStart.desc')
        "
        :code="sundayCode"
        min-height="400px"
      >
        <div class="w-full">
          <MonthView
            v-model="dateSunday"
            :events="sampleEvents"
            :first-day-of-week="0"
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
        {{ t("pages.data-display.monthView.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.monthView.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
