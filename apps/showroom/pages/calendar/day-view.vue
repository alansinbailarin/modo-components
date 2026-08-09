<script setup lang="ts">
import { ref, computed } from "vue";
import { DayView, Typography } from "mood-ui";
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
  { keys: ["Tab"], action: t("pages.data-display.dayView.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.dayView.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.dayView.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.dayView.a11y.focusNative"),
]);

// ── Sample events ─────────────────────────────────────────────────────────────
const today = new Date();
function at(h: number, m = 0): Date {
  const d = new Date(today);
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
  {
    id: "2",
    title: "UI Design",
    start: at(10, 30),
    end: at(12, 30),
    color: "success",
  },
  { id: "3", title: "Lunch", start: at(13), end: at(14), color: "warning" },
  {
    id: "4",
    title: "Client demo",
    start: at(15),
    end: at(16, 30),
    color: "danger",
  },
  { id: "5", title: "Infra sync", start: at(17), end: at(18), color: "info" },
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
  return `<DayView ${parts.join(" ")} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic = ref(new Date());
const dateEvents = ref(new Date());
const date12h = ref(new Date());
const dateBiz = ref(new Date());

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DayView } from 'mood-ui';

const date = ref(new Date());
<\/script>

<template>
  <DayView v-model="date" />
</template>`;

const eventsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DayView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <DayView v-model="date" :events="events" />
</template>`;

const fmt12hCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DayView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <DayView v-model="date" :events="events" format="12h" />
</template>`;

const bizCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DayView } from 'mood-ui';
import type { CalendarEvent } from 'mood-ui';

const date = ref(new Date());
const events: CalendarEvent[] = [];
<\/script>

<template>
  <DayView
    v-model="date"
    :events="events"
    :business-hours="{ start: '08:00', end: '18:00' }"
    :hour-start="7"
    :hour-end="20"
  />
</template>`;

const typesCode = `export interface DayView {
  modelValue?: Date;
  events?: CalendarEvent[];
  locale?: string;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  bordered?: boolean;
  minDate?: Date;
  maxDate?: Date;
  dayNameFormat?: 'narrow' | 'short' | 'long';
  dayNameCase?: 'upper' | 'lower' | 'capitalize' | 'normal';
  highlightedDates?: Date[];
  disabledDates?: Date[];
  disabledWeekdays?: number[];
  disabledTimeRanges?: DisabledTimeRange[];
  businessHours?: BusinessHours | BusinessHours[];
  showHeader?: boolean;
  showYearJump?: boolean;
  showTodayButton?: boolean;
  showMonthYearSelects?: boolean;
  hourStart?: number;
  hourEnd?: number;
  slotMinutes?: 15 | 30 | 60;
  slotHeight?: number;
  format?: '12h' | '24h';
  showCurrentTime?: boolean;
  showCurrentTimeLabel?: boolean;
  currentTimeColor?: 'red' | 'default' | 'primary' | 'danger' | 'success' | 'warning';
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
  showNowPill?: boolean;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date",
    description: t("pages.data-display.dayView.props.modelValue"),
  },
  {
    name: "events",
    type: "CalendarEvent[]",
    description: t("pages.data-display.dayView.props.events"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.data-display.dayView.props.locale"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    description: t("pages.data-display.dayView.props.color"),
  },
  {
    name: "format",
    type: "'12h' | '24h'",
    default: "'24h'",
    description: t("pages.data-display.dayView.props.format"),
  },
  {
    name: "hourStart",
    type: "number",
    default: "0",
    description: t("pages.data-display.dayView.props.hourStart"),
  },
  {
    name: "hourEnd",
    type: "number",
    default: "24",
    description: t("pages.data-display.dayView.props.hourEnd"),
  },
  {
    name: "slotMinutes",
    type: "15 | 30 | 60",
    default: "30",
    description: t("pages.data-display.dayView.props.slotMinutes"),
  },
  {
    name: "slotHeight",
    type: "number",
    description: t("pages.data-display.dayView.props.slotHeight"),
  },
  {
    name: "showAllDayRow",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.dayView.props.showAllDayRow"),
  },
  {
    name: "showHeader",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.dayView.props.showHeader"),
  },
  {
    name: "showCurrentTime",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.dayView.props.showCurrentTime"),
  },
  {
    name: "showNowPill",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.dayView.props.showNowPill"),
  },
  {
    name: "businessHours",
    type: "BusinessHours | BusinessHours[]",
    description: t("pages.data-display.dayView.props.businessHours"),
  },
  {
    name: "disabledTimeRanges",
    type: "DisabledTimeRange[]",
    description: t("pages.data-display.dayView.props.disabledTimeRanges"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.dayView.props.bordered"),
  },
  {
    name: "maxHeight",
    type: "number | string",
    description: t("pages.data-display.dayView.props.maxHeight"),
  },
  {
    name: "draggableEvents",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.dayView.props.draggableEvents"),
  },
  {
    name: "resizableEvents",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.dayView.props.resizableEvents"),
  },
  {
    name: "allowRangeSelection",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.dayView.props.allowRangeSelection"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date",
    description: t("pages.data-display.dayView.emits.updateModelValue"),
  },
  {
    name: "event-click",
    payload: "(event: CalendarEvent, nativeEvent: MouseEvent)",
    description: t("pages.data-display.dayView.emits.eventClick"),
  },
  {
    name: "slot-click",
    payload: "(date: Date, nativeEvent: MouseEvent)",
    description: t("pages.data-display.dayView.emits.slotClick"),
  },
  {
    name: "create-event",
    payload:
      "(date: Date, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent)",
    description: t("pages.data-display.dayView.emits.createEvent"),
  },
  {
    name: "event-drop",
    payload: "(event: CalendarEvent, newStart: Date, newEnd: Date | undefined)",
    description: t("pages.data-display.dayView.emits.eventDrop"),
  },
  {
    name: "event-resize",
    payload: "(event: CalendarEvent, newStart: Date, newEnd: Date)",
    description: t("pages.data-display.dayView.emits.eventResize"),
  },
  {
    name: "select-range",
    payload: "(start: Date, end: Date)",
    description: t("pages.data-display.dayView.emits.selectRange"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.dayView.title')"
    category="Calendar"
    import-path="import { DayView } from 'mood-ui'"
    :description="t('pages.data-display.dayView.description')"
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
              >{{ t("pages.data-display.dayView.controls.format") }}</span
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
            {{ t("pages.data-display.dayView.controls.allDayRow") }}
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
            {{ t("pages.data-display.dayView.controls.borders") }}
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
            {{ t("pages.data-display.dayView.controls.currentTime") }}
          </button>
        </template>

        <div class="w-full">
          <DayView
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
        :title="t('pages.data-display.dayView.examples.basic.title')"
        :description="t('pages.data-display.dayView.examples.basic.desc')"
        :code="basicCode"
        min-height="400px"
      >
        <div class="w-full"><DayView v-model="dateBasic" /></div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.dayView.examples.events.title')"
        :description="t('pages.data-display.dayView.examples.events.desc')"
        :code="eventsCode"
        min-height="400px"
      >
        <div class="w-full">
          <DayView v-model="dateEvents" :events="sampleEvents" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.dayView.examples.format12h.title')"
        :description="t('pages.data-display.dayView.examples.format12h.desc')"
        :code="fmt12hCode"
        min-height="400px"
      >
        <div class="w-full">
          <DayView v-model="date12h" :events="sampleEvents" format="12h" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.dayView.examples.businessHours.title')"
        :description="
          t('pages.data-display.dayView.examples.businessHours.desc')
        "
        :code="bizCode"
        min-height="400px"
      >
        <div class="w-full">
          <DayView
            v-model="dateBiz"
            :events="sampleEvents"
            :business-hours="{ start: '08:00', end: '18:00' }"
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
        {{ t("pages.data-display.dayView.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.dayView.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
