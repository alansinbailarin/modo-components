<script setup lang="ts">
import { ref, computed } from "vue";
import { Typography, WeekView } from "mood-ui";
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
  { keys: ["Tab"], action: t("pages.data-display.weekView.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.weekView.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.weekView.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.weekView.a11y.focusNative"),
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
    start: at(9),
    end: at(9, 30),
    color: "primary",
  },
  { id: "2", title: "UI Design", start: at(10), end: at(12), color: "success" },
  { id: "3", title: "Lunch", start: at(13), end: at(14), color: "warning" },
  {
    id: "4",
    title: "Code review",
    start: at(15, 0, 1),
    end: at(16, 30, 1),
    color: "info",
  },
  {
    id: "5",
    title: "Client demo",
    start: at(11, 0, 2),
    end: at(12, 0, 2),
    color: "danger",
  },
  {
    id: "6",
    title: "Conference",
    start: at(0, 0, 3),
    end: at(23, 59, 3),
    color: "purple",
    allDay: true,
  },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgDate = ref(new Date());
const pgFormat = ref<"12h" | "24h">("24h");
const pgShowAllDay = ref(true);
const pgBordered = ref(true);
const pgShowNowPill = ref(true);

function resetPlayground() {
  pgDate.value = new Date();
  pgFormat.value = "24h";
  pgShowAllDay.value = true;
  pgBordered.value = true;
  pgShowNowPill.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="date"', ':events="events"'];
  if (pgFormat.value !== "24h") parts.push(`format="${pgFormat.value}"`);
  if (!pgShowAllDay.value) parts.push(':show-all-day-row="false"');
  if (!pgBordered.value) parts.push(':bordered="false"');
  if (!pgShowNowPill.value) parts.push(':show-now-pill="false"');
  return `<WeekView ${parts.join(" ")} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic = ref(new Date());
const dateAllDay = ref(new Date());
const date12h = ref(new Date());
const dateBiz = ref(new Date());

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { WeekView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <WeekView v-model="date" :events="events" />
</template>`;

const allDayCode = `<script setup lang="ts">
import { ref } from 'vue';
import { WeekView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <WeekView v-model="date" :events="events" show-all-day-row />
</template>`;

const fmt12hCode = `<script setup lang="ts">
import { ref } from 'vue';
import { WeekView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <WeekView v-model="date" :events="events" format="12h" />
</template>`;

const bizCode = `<script setup lang="ts">
import { ref } from 'vue';
import { WeekView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <WeekView
    v-model="date"
    :events="events"
    :business-hours="{ start: '09:00', end: '18:00' }"
    :hour-start="7"
    :hour-end="20"
  />
</template>`;

const typesCode = `export interface DisabledTimeRange {
  start: string;
  end: string;
  daysOfWeek?: number[];
}

export interface BusinessHours {
  start: string;
  end: string;
  daysOfWeek?: number[];
}

export interface WeekView {
  modelValue?: Date;
  events?: CalendarEvent[];
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  bordered?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dayNameFormat?: 'narrow' | 'short' | 'long';
  dayNameCase?: 'upper' | 'lower' | 'capitalize' | 'normal';
  highlightedWeekdays?: number[];
  highlightedDates?: Date[];
  disabledDates?: Date[];
  disabledWeekdays?: number[];
  disabledTimeRanges?: DisabledTimeRange[];
  businessHours?: BusinessHours | BusinessHours[];
  showHeader?: boolean;
  showYearJump?: boolean;
  showTodayButton?: boolean;
  showMonthYearSelects?: boolean;
  showWeekSelect?: boolean;
  hourStart?: number;
  hourEnd?: number;
  slotMinutes?: 15 | 30 | 60;
  slotHeight?: number;
  minDayWidth?: number;
  format?: '12h' | '24h';
  showCurrentTime?: boolean;
  showCurrentTimeLabel?: boolean;
  currentTimeSpan?: 'today' | 'week';
  currentTimeColor?: 'red' | 'default' | 'primary' | 'danger' | 'success' | 'warning';
  currentTimeDimOtherDays?: boolean;
  currentTimeUpdateInterval?: number;
  draggableEvents?: boolean;
  resizableEvents?: boolean;
  allowRangeSelection?: boolean;
  allowDropOnDisabled?: boolean;
  allowResizeOverDisabled?: boolean;
  readonly?: boolean;
  preventOverlap?: boolean;
  autoScrollOnDrag?: boolean;
  showAllDayRow?: boolean;
  enableKeyboardNavigation?: boolean;
  showFocusIndicator?: boolean;
  showNowPill?: boolean;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date",
    description: t("pages.data-display.weekView.props.modelValue"),
  },
  {
    name: "events",
    type: "CalendarEvent[]",
    description: t("pages.data-display.weekView.props.events"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.data-display.weekView.props.locale"),
  },
  {
    name: "firstDayOfWeek",
    type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
    description: t("pages.data-display.weekView.props.firstDayOfWeek"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    description: t("pages.data-display.weekView.props.color"),
  },
  {
    name: "format",
    type: "'12h' | '24h'",
    default: "'24h'",
    description: t("pages.data-display.weekView.props.format"),
  },
  {
    name: "hourStart",
    type: "number",
    default: "0",
    description: t("pages.data-display.weekView.props.hourStart"),
  },
  {
    name: "hourEnd",
    type: "number",
    default: "24",
    description: t("pages.data-display.weekView.props.hourEnd"),
  },
  {
    name: "slotMinutes",
    type: "15 | 30 | 60",
    default: "30",
    description: t("pages.data-display.weekView.props.slotMinutes"),
  },
  {
    name: "slotHeight",
    type: "number",
    description: t("pages.data-display.weekView.props.slotHeight"),
  },
  {
    name: "minDayWidth",
    type: "number",
    default: "140",
    description: t("pages.data-display.weekView.props.minDayWidth"),
  },
  {
    name: "showAllDayRow",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.weekView.props.showAllDayRow"),
  },
  {
    name: "showHeader",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.weekView.props.showHeader"),
  },
  {
    name: "showCurrentTime",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.weekView.props.showCurrentTime"),
  },
  {
    name: "showNowPill",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.weekView.props.showNowPill"),
  },
  {
    name: "businessHours",
    type: "BusinessHours | BusinessHours[]",
    description: t("pages.data-display.weekView.props.businessHours"),
  },
  {
    name: "disabledTimeRanges",
    type: "DisabledTimeRange[]",
    description: t("pages.data-display.weekView.props.disabledTimeRanges"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.weekView.props.bordered"),
  },
  {
    name: "maxHeight",
    type: "number | string",
    description: t("pages.data-display.weekView.props.maxHeight"),
  },
  {
    name: "draggableEvents",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.weekView.props.draggableEvents"),
  },
  {
    name: "resizableEvents",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.weekView.props.resizableEvents"),
  },
  {
    name: "allowRangeSelection",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.weekView.props.allowRangeSelection"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date",
    description: t("pages.data-display.weekView.emits.updateModelValue"),
  },
  {
    name: "event-click",
    payload: "(event: CalendarEvent, nativeEvent: MouseEvent)",
    description: t("pages.data-display.weekView.emits.eventClick"),
  },
  {
    name: "day-click",
    payload: "(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)",
    description: t("pages.data-display.weekView.emits.dayClick"),
  },
  {
    name: "slot-click",
    payload: "(date: Date, nativeEvent: MouseEvent)",
    description: t("pages.data-display.weekView.emits.slotClick"),
  },
  {
    name: "create-event",
    payload:
      "(date: Date, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent)",
    description: t("pages.data-display.weekView.emits.createEvent"),
  },
  {
    name: "event-drop",
    payload: "(event: CalendarEvent, newStart: Date, newEnd: Date | undefined)",
    description: t("pages.data-display.weekView.emits.eventDrop"),
  },
  {
    name: "event-resize",
    payload: "(event: CalendarEvent, newStart: Date, newEnd: Date)",
    description: t("pages.data-display.weekView.emits.eventResize"),
  },
  {
    name: "select-range",
    payload: "(start: Date, end: Date)",
    description: t("pages.data-display.weekView.emits.selectRange"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.weekView.title')"
    category="Calendar"
    import-path="import { WeekView } from 'mood-ui'"
    :description="t('pages.data-display.weekView.description')"
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
              >Format</span
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
              pgShowAllDay
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowAllDay = !pgShowAllDay"
          >
            All-day row
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
            Borders
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgShowNowPill
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowNowPill = !pgShowNowPill"
          >
            Current time
          </button>
        </template>

        <div class="w-full">
          <WeekView
            v-model="pgDate"
            :events="sampleEvents"
            :format="pgFormat"
            :show-all-day-row="pgShowAllDay"
            :bordered="pgBordered"
            :show-now-pill="pgShowNowPill"
          />
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.weekView.examples.basic.title')"
        :description="t('pages.data-display.weekView.examples.basic.desc')"
        :code="basicCode"
        min-height="400px"
      >
        <div class="w-full">
          <WeekView v-model="dateBasic" :events="sampleEvents" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.weekView.examples.allDay.title')"
        :description="t('pages.data-display.weekView.examples.allDay.desc')"
        :code="allDayCode"
        min-height="400px"
      >
        <div class="w-full">
          <WeekView
            v-model="dateAllDay"
            :events="sampleEvents"
            show-all-day-row
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.weekView.examples.format12h.title')"
        :description="t('pages.data-display.weekView.examples.format12h.desc')"
        :code="fmt12hCode"
        min-height="400px"
      >
        <div class="w-full">
          <WeekView v-model="date12h" :events="sampleEvents" format="12h" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.weekView.examples.businessHours.title')"
        :description="
          t('pages.data-display.weekView.examples.businessHours.desc')
        "
        :code="bizCode"
        min-height="400px"
      >
        <div class="w-full">
          <WeekView
            v-model="dateBiz"
            :events="sampleEvents"
            :business-hours="{ start: '09:00', end: '18:00' }"
            :hour-start="7"
            :hour-end="20"
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
        {{ t("pages.data-display.weekView.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.weekView.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
