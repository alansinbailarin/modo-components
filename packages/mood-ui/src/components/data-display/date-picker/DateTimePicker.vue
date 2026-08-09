<template>
  <div
    :class="[
      'relative inline-flex flex-col items-stretch bg-card w-fit self-start',
      !timeOnly ? 'sm:flex-row max-w-65 sm:max-w-none' : '',
      variant === 'outline' ? 'border border-border' : '',
      containerRadiusClass,
    ]"
  >
    <Calendar
      v-if="!timeOnly"
      v-model="dateOnly"
      :locale="locale"
      :first-day-of-week="firstDayOfWeek"
      :min-date="minDate"
      :max-date="maxDate"
      :disabled-dates="disabledDates"
      :color="color"
      variant="filled"
      :radius="radius"
    />

    <div :class="['relative shrink-0', timePanelWidthClass]">
      <div
        :class="[
          'flex flex-col h-52',
          !timeOnly ? 'border-t border-border sm:border-t-0 sm:border-l sm:absolute sm:inset-0 sm:h-auto' : '',
        ]"
      >
        <div class="px-3 py-3 border-b border-border text-center shrink-0">
          <span class="text-sm font-semibold text-foreground">{{
            timeLabel
          }}</span>
        </div>

        <div class="flex flex-1 min-h-0 overflow-hidden">
          <div
            v-for="col in columns"
            :key="col.key"
            class="flex flex-col flex-1 border-r last:border-r-0 border-border"
          >
            <div
              class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground border-b border-border"
            >
              {{ col.label }}
            </div>
            <div
              :ref="
                (el: unknown) => setScrollRef(col.key, el as HTMLElement | null)
              "
              class="flex-1 overflow-y-auto scroll-smooth"
              style="scrollbar-width: thin"
            >
              <div class="py-14">
                <button
                  v-for="item in col.items"
                  :key="item.value"
                  type="button"
                  :disabled="item.disabled"
                  :data-col="col.key"
                  :data-value="item.value"
                  @click="selectTimeItem(col.key, item.value)"
                  :class="[
                    'w-full px-2 py-1.5 text-sm text-center transition-colors cursor-pointer focus:outline-none',
                    item.disabled
                      ? 'text-muted-foreground/60 cursor-not-allowed'
                      : item.value === col.selected
                        ? selectedItemClasses
                        : 'text-foreground/80 hover:bg-muted',
                  ]"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="px-3 py-2 border-t border-border flex justify-end gap-2 shrink-0"
        >
          <Button
            variant="text"
            size="xs"
            radius="medium"
            label="Now"
            :class="todayTextClass"
            @click="handleNow"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import gsap from "gsap";
import Calendar from "../calendar/Calendar.vue";
import Button from "../../forms/Button.vue";
import {
  useResolvedColor,
  useResolvedRadius,
} from "../../../composables/useModoConfig";
import type { DateTimePicker } from "../../../interfaces/data-display/date-picker/DateTimePicker.interface";

const props = withDefaults(defineProps<DateTimePicker>(), {
  modelValue: null,
  locale: "default",
  firstDayOfWeek: 0,
  color: "default",
  variant: "outline",
  format: "24h",
  step: 5,
  showSeconds: false,
  timeOnly: false,
});

const resolvedColor = useResolvedColor(() => props.color);
const resolvedRadius = useResolvedRadius(() => props.radius);

const emit = defineEmits<{
  "update:modelValue": [date: Date];
}>();

type ColKey = "hour" | "minute" | "second" | "period";

const scrollRefs = ref<Record<ColKey, HTMLElement | null>>({
  hour: null,
  minute: null,
  second: null,
  period: null,
});
const setScrollRef = (key: ColKey, el: HTMLElement | null) => {
  scrollRefs.value[key] = el;
};

const initialDate = props.modelValue ?? new Date();

const dateOnly = ref<Date>(new Date(initialDate));
const hour = ref(initialDate.getHours());
const minute = ref(
  Math.round(initialDate.getMinutes() / props.step) * props.step,
);
const second = ref(initialDate.getSeconds());

const parseTimeStr = (t?: string): number | null => {
  if (!t) return null;
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + (m || 0) * 60 + (s || 0);
};
const minTimeSec = computed(() => parseTimeStr(props.minTime));
const maxTimeSec = computed(() => parseTimeStr(props.maxTime));

const pad2 = (n: number) => n.toString().padStart(2, "0");

const is12h = computed(() => props.format === "12h");

const hourValues = computed(() => {
  if (is12h.value) {
    return Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  }
  return Array.from({ length: 24 }, (_, i) => i);
});

const minuteValues = computed(() => {
  const values: number[] = [];
  for (let i = 0; i < 60; i += props.step) values.push(i);
  return values;
});

const secondValues = computed(() => {
  const values: number[] = [];
  for (let i = 0; i < 60; i += props.step) values.push(i);
  return values;
});

const currentPeriod = computed<"AM" | "PM">(() =>
  hour.value < 12 ? "AM" : "PM",
);

const hourDisplay = computed(() => {
  if (!is12h.value) return hour.value;
  const h = hour.value % 12;
  return h === 0 ? 12 : h;
});

const isTimeDisabled = (h: number, m: number, s: number): boolean => {
  const total = h * 3600 + m * 60 + s;
  if (minTimeSec.value !== null && total < minTimeSec.value) return true;
  if (maxTimeSec.value !== null && total > maxTimeSec.value) return true;
  return false;
};

interface TimeItem {
  value: number;
  label: string;
  disabled: boolean;
}

interface TimeColumn {
  key: ColKey;
  label: string;
  items: TimeItem[];
  selected: number;
}

const columns = computed<TimeColumn[]>(() => {
  const cols: TimeColumn[] = [];

  cols.push({
    key: "hour",
    label: "Hour",
    selected: hourDisplay.value,
    items: hourValues.value.map((v) => {
      const h24 = is12h.value
        ? currentPeriod.value === "AM"
          ? v === 12
            ? 0
            : v
          : v === 12
            ? 12
            : v + 12
        : v;
      return {
        value: v,
        label: pad2(v),
        disabled: isTimeDisabled(h24, minute.value, second.value),
      };
    }),
  });

  cols.push({
    key: "minute",
    label: "Min",
    selected: minute.value,
    items: minuteValues.value.map((v) => ({
      value: v,
      label: pad2(v),
      disabled: isTimeDisabled(hour.value, v, second.value),
    })),
  });

  if (props.showSeconds) {
    cols.push({
      key: "second",
      label: "Sec",
      selected: second.value,
      items: secondValues.value.map((v) => ({
        value: v,
        label: pad2(v),
        disabled: isTimeDisabled(hour.value, minute.value, v),
      })),
    });
  }

  if (is12h.value) {
    cols.push({
      key: "period",
      label: "AM/PM",
      selected: currentPeriod.value === "AM" ? 0 : 1,
      items: [
        { value: 0, label: "AM", disabled: false },
        { value: 1, label: "PM", disabled: false },
      ],
    });
  }

  return cols;
});

const timeLabel = computed(() => {
  const h = is12h.value ? hourDisplay.value : hour.value;
  let s = `${pad2(h)}:${pad2(minute.value)}`;
  if (props.showSeconds) s += `:${pad2(second.value)}`;
  if (is12h.value) s += ` ${currentPeriod.value}`;
  return s;
});

const commitDate = () => {
  const d = new Date(dateOnly.value);
  d.setHours(hour.value, minute.value, props.showSeconds ? second.value : 0, 0);
  if (props.modelValue && d.getTime() === props.modelValue.getTime()) return;
  emit("update:modelValue", d);
};

const selectTimeItem = (col: ColKey, value: number) => {
  if (col === "hour") {
    if (is12h.value) {
      const base = value === 12 ? 0 : value;
      hour.value = currentPeriod.value === "AM" ? base : base + 12;
    } else {
      hour.value = value;
    }
  } else if (col === "minute") {
    minute.value = value;
  } else if (col === "second") {
    second.value = value;
  } else if (col === "period") {
    const targetAM = value === 0;
    if (targetAM && hour.value >= 12) hour.value -= 12;
    else if (!targetAM && hour.value < 12) hour.value += 12;
  }
  commitDate();
  scrollColumnToSelected(col);
};

const scrollColumnToSelected = (col: ColKey, animate = true) => {
  nextTick(() => {
    const container = scrollRefs.value[col];
    if (!container) return;
    const colInfo = columns.value.find((c) => c.key === col);
    if (!colInfo) return;
    const targetBtn = container.querySelector<HTMLElement>(
      `button[data-col="${col}"][data-value="${colInfo.selected}"]`,
    );
    if (!targetBtn) return;
    const apply = () => {
      // Measured against the scroll container itself rather than
      // `targetBtn.offsetTop`: the nearest positioned ancestor is the time
      // panel wrapper, not this container, so offsetTop also carries the
      // "Time" header and the column label. That constant error is what
      // pushed the selected option up behind the hour/min label — most
      // visible in `timeOnly`, where the column is only h-52 tall.
      const offsetWithinScroller =
        targetBtn.getBoundingClientRect().top
        - container.getBoundingClientRect().top
        + container.scrollTop;
      const targetTop =
        offsetWithinScroller -
        container.clientHeight / 2 +
        targetBtn.clientHeight / 2;
      if (animate) {
        gsap.to(container, {
          scrollTop: targetTop,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        container.scrollTop = targetTop;
      }
    };
    // Defer hasta un segundo frame para que el layout esté asentado
    // (especialmente en mount, cuando el Calendar todavía no determinó altura final).
    requestAnimationFrame(() => requestAnimationFrame(apply));
  });
};

watch(dateOnly, () => commitDate());

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return;
    dateOnly.value = new Date(v);
    hour.value = v.getHours();
    minute.value = v.getMinutes();
    second.value = v.getSeconds();
    columns.value.forEach((c) => scrollColumnToSelected(c.key));
  },
);

onMounted(() => {
  if (!props.modelValue) commitDate();
  nextTick(() => {
    columns.value.forEach((c) => scrollColumnToSelected(c.key, false));
  });
});

const handleNow = () => {
  const now = new Date();
  dateOnly.value = new Date(now);
  hour.value = now.getHours();
  minute.value = Math.round(now.getMinutes() / props.step) * props.step;
  second.value = now.getSeconds();
  commitDate();
  columns.value.forEach((c) => scrollColumnToSelected(c.key));
};

const timePanelWidthClass = computed(() => {
  const n = columns.value.length;
  // Mobile: stretches to full calendar width. sm+: fixed width per column count.
  if (n <= 2) return "sm:w-32"; // 128px
  if (n === 3) return "sm:w-48"; // 192px sm+
  return "sm:w-64"; // 256px sm+
});

const selectedItemClasses = computed(
  () =>
    ({
      default: "bg-foreground text-background font-semibold",
      primary: "bg-primary text-primary-foreground font-semibold",
      danger: "bg-destructive text-destructive-foreground font-semibold",
      success: "bg-success text-success-foreground font-semibold",
      warning: "bg-warning text-warning-foreground font-semibold",
    })[resolvedColor.value] ??
    "bg-primary text-primary-foreground font-semibold",
);

const todayTextClass = computed(
  () =>
    ({
      default: "text-foreground",
      primary: "text-primary",
      danger: "text-destructive",
      success: "text-success",
      warning: "text-warning",
    })[resolvedColor.value] ?? "text-primary",
);

const containerRadiusClass = computed(
  () =>
    ({
      none: "rounded-none",
      small: "rounded-sm",
      medium: "rounded-md",
      large: "rounded-lg",
      full: "rounded-xl",
    })[resolvedRadius.value] ?? "rounded-lg",
);
</script>
