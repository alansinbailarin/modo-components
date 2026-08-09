<script setup lang="ts">
import { ref, computed } from "vue";
import { Scheduler, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type {
  SchedulerEvent,
  SchedulerResource,
} from "../../../interfaces/data-display/calendar/Scheduler.interface";
import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.scheduler.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.scheduler.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.scheduler.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.scheduler.a11y.focusNative"),
]);

// ── Sample resources & events ────────────────────────────────────────────────
const resources: SchedulerResource[] = [
  { id: "r1", title: "Atlas Room", subtitle: "Capacity 12", color: "primary" },
  { id: "r2", title: "Boreal Room", subtitle: "Capacity 6", color: "success" },
  { id: "r3", title: "Cosmos Room", subtitle: "Capacity 20", color: "warning" },
  { id: "r4", title: "Drift Room", subtitle: "Capacity 4", color: "info" },
];

const today = new Date();
function at(h: number, m = 0, dayOffset = 0): Date {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}
const sampleEvents: SchedulerEvent[] = [
  {
    id: "e1",
    resourceId: "r1",
    title: "Stand-up",
    start: at(9),
    end: at(9, 30),
    color: "primary",
  },
  {
    id: "e2",
    resourceId: "r1",
    title: "UI Design",
    start: at(10),
    end: at(12),
    color: "primary",
  },
  {
    id: "e3",
    resourceId: "r2",
    title: "Interview",
    start: at(11),
    end: at(12),
    color: "success",
  },
  {
    id: "e4",
    resourceId: "r3",
    title: "Workshop",
    start: at(13),
    end: at(15),
    color: "warning",
  },
  {
    id: "e5",
    resourceId: "r4",
    title: "Client demo",
    start: at(15, 0, 1),
    end: at(16, 30, 1),
    color: "info",
  },
  {
    id: "e6",
    resourceId: "r2",
    title: "Code review",
    start: at(16),
    end: at(17),
    color: "success",
  },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgDate = ref(new Date());
const pgFormat = ref<"12h" | "24h">("24h");
const pgBordered = ref(true);
const pgShowAllDay = ref(true);
const pgUseResColor = ref(true);

function resetPlayground() {
  pgDate.value = new Date();
  pgFormat.value = "24h";
  pgBordered.value = true;
  pgShowAllDay.value = true;
  pgUseResColor.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = [
    'v-model="date"',
    ':resources="resources"',
    ':events="events"',
  ];
  if (pgFormat.value !== "24h") parts.push(`format="${pgFormat.value}"`);
  if (!pgBordered.value) parts.push(':bordered="false"');
  if (!pgShowAllDay.value) parts.push(':show-all-day-row="false"');
  if (!pgUseResColor.value) parts.push(':use-resource-color="false"');
  return `<Scheduler ${parts.join(" ")} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic = ref(new Date());
const dateEvents = ref(new Date());
const date12h = ref(new Date());
const dateBiz = ref(new Date());

const emptyEvents: SchedulerEvent[] = [];

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Scheduler } from 'mood-ui';
import type { SchedulerResource, SchedulerEvent } from 'mood-ui';

const date = ref(new Date());
const resources: SchedulerResource[] = [
  { id: 'r1', title: 'Atlas Room', subtitle: 'Capacity 12', color: 'primary' },
];
const events: SchedulerEvent[] = [];
<\/script>

<template>
  <Scheduler v-model="date" :resources="resources" :events="events" />
</template>`;

const eventsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Scheduler } from 'mood-ui';
import type { SchedulerResource, SchedulerEvent } from 'mood-ui';

const date = ref(new Date());
const resources: SchedulerResource[] = [
  { id: 'r1', title: 'Atlas Room', subtitle: 'Capacity 12', color: 'primary' },
];
const events: SchedulerEvent[] = [
  { id: 'e1', resourceId: 'r1', title: 'Stand-up', start: new Date(), end: new Date(), color: 'primary' },
];
<\/script>

<template>
  <Scheduler v-model="date" :resources="resources" :events="events" />
</template>`;

const fmt12hCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Scheduler } from 'mood-ui';
import type { SchedulerResource, SchedulerEvent } from 'mood-ui';

const date = ref(new Date());
const resources: SchedulerResource[] = [
  { id: 'r1', title: 'Atlas Room', subtitle: 'Capacity 12', color: 'primary' },
];
const events: SchedulerEvent[] = [];
<\/script>

<template>
  <Scheduler v-model="date" :resources="resources" :events="events" format="12h" />
</template>`;

const bizCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Scheduler } from 'mood-ui';
import type { SchedulerResource, SchedulerEvent } from 'mood-ui';

const date = ref(new Date());
const resources: SchedulerResource[] = [
  { id: 'r1', title: 'Atlas Room', subtitle: 'Capacity 12', color: 'primary' },
];
const events: SchedulerEvent[] = [];
<\/script>

<template>
  <Scheduler
    v-model="date"
    :resources="resources"
    :events="events"
    :business-hours="{ start: '09:00', end: '18:00' }"
    :hour-start="7"
    :hour-end="20"
  />
</template>`;

const typesCode = `export interface SchedulerResource {
  id: string | number;
  title: string;
  subtitle?: string;
  avatar?: string;
  color?: CalendarEvent['color'];
  colorHex?: string;
  disabled?: boolean;
  meta?: Record<string, unknown>;
}

export interface SchedulerEvent extends CalendarEvent {
  resourceId?: string | number;
}

export interface Scheduler {
  modelValue?: Date;
  resources: SchedulerResource[];
  events?: SchedulerEvent[];
  resourceIdField?: string;
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
  showTodayButton?: boolean;
  showYearJump?: boolean;
  showMonthYearSelects?: boolean;
  showResourceHeader?: boolean;
  resourceHeaderHeight?: number;
  minResourceWidth?: number;
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
  allowCrossResourceDrag?: boolean;
  allowDropOnDisabled?: boolean;
  allowResizeOverDisabled?: boolean;
  readonly?: boolean;
  preventOverlap?: boolean;
  autoScrollOnDrag?: boolean;
  showAllDayRow?: boolean;
  enableKeyboardNavigation?: boolean;
  showNowPill?: boolean;
  useResourceColor?: boolean;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date",
    description: t("pages.data-display.scheduler.props.modelValue"),
  },
  {
    name: "resources",
    type: "SchedulerResource[]",
    required: true,
    description: t("pages.data-display.scheduler.props.resources"),
  },
  {
    name: "events",
    type: "SchedulerEvent[]",
    description: t("pages.data-display.scheduler.props.events"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.data-display.scheduler.props.locale"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    description: t("pages.data-display.scheduler.props.color"),
  },
  {
    name: "format",
    type: "'12h' | '24h'",
    default: "'24h'",
    description: t("pages.data-display.scheduler.props.format"),
  },
  {
    name: "hourStart",
    type: "number",
    default: "0",
    description: t("pages.data-display.scheduler.props.hourStart"),
  },
  {
    name: "hourEnd",
    type: "number",
    default: "24",
    description: t("pages.data-display.scheduler.props.hourEnd"),
  },
  {
    name: "slotMinutes",
    type: "15 | 30 | 60",
    default: "30",
    description: t("pages.data-display.scheduler.props.slotMinutes"),
  },
  {
    name: "slotHeight",
    type: "number",
    description: t("pages.data-display.scheduler.props.slotHeight"),
  },
  {
    name: "minResourceWidth",
    type: "number",
    description: t("pages.data-display.scheduler.props.minResourceWidth"),
  },
  {
    name: "showResourceHeader",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.scheduler.props.showResourceHeader"),
  },
  {
    name: "resourceHeaderHeight",
    type: "number",
    description: t("pages.data-display.scheduler.props.resourceHeaderHeight"),
  },
  {
    name: "showAllDayRow",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.scheduler.props.showAllDayRow"),
  },
  {
    name: "showCurrentTime",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.scheduler.props.showCurrentTime"),
  },
  {
    name: "businessHours",
    type: "BusinessHours | BusinessHours[]",
    description: t("pages.data-display.scheduler.props.businessHours"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.scheduler.props.bordered"),
  },
  {
    name: "maxHeight",
    type: "number | string",
    description: t("pages.data-display.scheduler.props.maxHeight"),
  },
  {
    name: "useResourceColor",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.scheduler.props.useResourceColor"),
  },
  {
    name: "draggableEvents",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.scheduler.props.draggableEvents"),
  },
  {
    name: "allowCrossResourceDrag",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.scheduler.props.allowCrossResourceDrag"),
  },
  {
    name: "resizableEvents",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.scheduler.props.resizableEvents"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date",
    description: t("pages.data-display.scheduler.emits.updateModelValue"),
  },
  {
    name: "event-click",
    payload: "(event: SchedulerEvent, nativeEvent: MouseEvent)",
    description: t("pages.data-display.scheduler.emits.eventClick"),
  },
  {
    name: "slot-click",
    payload:
      "(date: Date, resource: SchedulerResource, nativeEvent: MouseEvent)",
    description: t("pages.data-display.scheduler.emits.slotClick"),
  },
  {
    name: "create-event",
    payload:
      "(date: Date, resource: SchedulerResource, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent)",
    description: t("pages.data-display.scheduler.emits.createEvent"),
  },
  {
    name: "event-drop",
    payload:
      "(event: SchedulerEvent, newStart: Date, newEnd: Date | undefined, newResource: SchedulerResource)",
    description: t("pages.data-display.scheduler.emits.eventDrop"),
  },
  {
    name: "event-resize",
    payload: "(event: SchedulerEvent, newStart: Date, newEnd: Date)",
    description: t("pages.data-display.scheduler.emits.eventResize"),
  },
  {
    name: "select-range",
    payload: "(start: Date, end: Date, resource: SchedulerResource)",
    description: t("pages.data-display.scheduler.emits.selectRange"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.scheduler.title')"
    category="Calendar"
    import-path="import { Scheduler } from 'mood-ui'"
    :description="t('pages.data-display.scheduler.description')"
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
              >{{ t("pages.data-display.scheduler.controls.format") }}</span
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
              pgBordered
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgBordered = !pgBordered"
          >
            {{ t("pages.data-display.scheduler.controls.borders") }}
          </button>

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
            {{ t("pages.data-display.scheduler.controls.allDayRow") }}
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgUseResColor
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgUseResColor = !pgUseResColor"
          >
            {{ t("pages.data-display.scheduler.controls.resourceColor") }}
          </button>
        </template>

        <div class="w-full">
          <Scheduler
            v-model="pgDate"
            :resources="resources"
            :events="sampleEvents"
            :format="pgFormat"
            :bordered="pgBordered"
            :show-all-day-row="pgShowAllDay"
            :use-resource-color="pgUseResColor"
          />
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.scheduler.examples.basic.title')"
        :description="t('pages.data-display.scheduler.examples.basic.desc')"
        :code="basicCode"
        min-height="400px"
      >
        <div class="w-full">
          <Scheduler
            v-model="dateBasic"
            :resources="resources"
            :events="emptyEvents"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.scheduler.examples.events.title')"
        :description="t('pages.data-display.scheduler.examples.events.desc')"
        :code="eventsCode"
        min-height="400px"
      >
        <div class="w-full">
          <Scheduler
            v-model="dateEvents"
            :resources="resources"
            :events="sampleEvents"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.scheduler.examples.format12h.title')"
        :description="t('pages.data-display.scheduler.examples.format12h.desc')"
        :code="fmt12hCode"
        min-height="400px"
      >
        <div class="w-full">
          <Scheduler
            v-model="date12h"
            :resources="resources"
            :events="sampleEvents"
            format="12h"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.scheduler.examples.businessHours.title')"
        :description="
          t('pages.data-display.scheduler.examples.businessHours.desc')
        "
        :code="bizCode"
        min-height="400px"
      >
        <div class="w-full">
          <Scheduler
            v-model="dateBiz"
            :resources="resources"
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
        {{ t("pages.data-display.scheduler.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.scheduler.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
