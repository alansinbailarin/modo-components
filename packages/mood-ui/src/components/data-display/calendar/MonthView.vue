<template> 
    <div 
        ref="rootRef" 
        tabindex="-1" 
        :class="['flex flex-col bg-card overflow-hidden focus:outline-none', containerRadiusClass, bordered ? 'border border-border' : '']" 
        :style="{ maxHeight: toCssLength(maxHeight) }"
        @keydown="handleKeydown" 
    > 
        <slot name="header" :monthLabel="monthLabel" :year="currentYear" :goToToday="handleToday" :prev="handlePrevMonth" :next="handleNextMonth"> 
            <CalendarHeader 
                :label="`${monthLabel} ${currentYear}`" 
                :showHeader="showHeader" 
                :showYearJump="showYearJump" 
                :showTodayButton="true" 
                :showMonthYearSelects="showMonthYearSelects" 
                :monthOptions="monthOptions" 
                :yearOptions="yearOptions" 
                v-model:selectedMonth="selectedMonth" 
                v-model:selectedYear="selectedYear" 
                :isMonthDisabled="(i: number) => isMonthDisabled(i, currentYear)" 
                :isPrevMonthDisabled="false" 
                :isPrevDisabled="isPrevMonthDisabled" 
                :isNextDisabled="isNextMonthDisabled" 
                :isPrevYearDisabled="isPrevYearDisabled" 
                :isNextYearDisabled="isNextYearDisabled" 
                :useFocusRingForToday="true" 
                prevLabel="Previous month" 
                nextLabel="Next month" 
                :color="resolvedColor" 
                :focusRingColorClass="focusRingColorClass" 
                :todayTextClass="todayTextClass" 
                :todayRadiusClass="pillRadiusClass" 
                :dayNameCaseClass="dayNameCaseClass" 
                @prev="handlePrevMonth" 
                @next="handleNextMonth" 
                @prevYear="handlePrevYear" 
                @nextYear="handleNextYear" 
                @today="handleToday" 
            /> 
        </slot> 
 
        <div class="grid border-b border-border" :style="gridTemplateColumns"> 
            <div v-if="showWeekNumbers" class="px-2 py-2 text-center text-xs font-medium text-muted-foreground border-r border-border"> 
                # 
            </div> 
            <div 
                v-for="(label, i) in weekDayLabels" 
                :key="i" 
                :class="[ 
                    'px-2 py-2 text-center text-xs font-medium tracking-wide truncate', 
                    dayNameCaseClass, 
                    highlightWeekends && isWeekendCol(i) ? 'text-rose-500' : 'text-muted-foreground', 
                ]" 
            > 
                {{ label }} 
            </div> 
        </div> 
 
        <!--
            The week rows keep their `min-h-24`, so a capped `maxHeight` has to
            scroll here rather than clip against the root's `overflow-hidden`.
            With no cap there is nothing to overflow and no scrollbar appears.
        -->
        <div ref="gridRef" class="flex-1 flex flex-col overflow-y-auto">
            <div 
                v-for="(week, wIdx) in weeksData" 
                :key="wIdx" 
                class="flex-1 flex min-h-24 relative border-t border-border first:border-t-0" 
            > 
                <div 
                    v-if="showWeekNumbers" 
                    class="w-10 shrink-0 px-2 py-1 flex items-start justify-center text-xs font-medium text-muted-foreground border-r border-border" 
                > 
                    {{ getWeekNumber(week.days[0].date) }} 
                </div> 
 
                <div class="flex-1 relative grid grid-cols-7"> 
                    <div 
                        v-for="(day, dIdx) in week.days" 
                        :key="day.date.toISOString()" 
                        :tabindex="keyboardNavigation && day.date.getTime() === focusedDate.getTime() ? 0 : -1"
                        :ref="(el: unknown) => setDayRef(day.date, el as HTMLElement | null)"
                        :data-day-key="day.date.toDateString()"
                        @click="handleDayClick(day, $event)"
                        @dblclick="handleDayDblClick(day, $event)"
                        @focus="keyboardNavigation && (focusedDate = day.date)"
                        @dragover.prevent="onDragOver(day, $event)"
                        @drop.prevent="onDrop(day, $event)" 
                        :class="[ 
                            'relative flex flex-col border-l border-border first:border-l-0 transition-colors focus:outline-none', 
                            day.isOutside ? 'bg-muted/50' : 'bg-card', 
                            day.disabled 
                                ? 'cursor-not-allowed bg-muted text-muted-foreground month-disabled-day' 
                                : 'cursor-pointer hover:bg-muted', 
                            highlightWeekends && isWeekendCol(dIdx) && !day.isOutside && !day.disabled ? 'bg-rose-50/40' : '', 
                            dragOverKey === day.date.toDateString() ? dropTargetBgClass : '', 
                        ]" 
                    > 
                        <div 
                            v-if="keyboardNavigation && day.date.getTime() === focusedDate.getTime()" 
                            :class="['absolute inset-0 pointer-events-none z-30 ring-2 ring-inset', focusRingColorClass]" 
                        ></div> 
                        <slot name="day" :day="day" :events="eventsForDay(day.date)"> 
                            <div class="flex items-center justify-end px-1.5 pt-1 pb-0.5 h-7"> 
                                <span 
                                    :class="[ 
                                        'inline-flex items-center justify-center text-xs font-medium w-6 h-6', 
                                        day.isToday ? [todayBgClass, pillRadiusClass] : '', 
                                        !day.isToday && day.isOutside ? 'text-muted-foreground/40' : '', 
                                        !day.isToday && !day.isOutside ? 'text-foreground/80' : '', 
                                    ]" 
                                > 
                                    {{ day.day }} 
                                </span> 
                            </div> 
 
                            <div class="flex-1" :style="{ paddingBottom: `${visibleLanes * laneHeight + (week.overflow[dIdx] > 0 ? 18 : 0)}px` }"></div> 
 
                            <button 
                                v-if="week.overflow[dIdx] > 0" 
                                type="button" 
                                @click.stop="handleMoreClick(day.date, $event)" 
                                class="absolute left-1.5 right-1.5 text-left text-[11px] text-muted-foreground hover:text-foreground font-medium px-1 py-0.5 cursor-pointer focus:outline-none z-20" 
                                :style="{ bottom: '2px' }" 
                            > 
                                + {{ week.overflow[dIdx] }} more 
                            </button> 
                        </slot> 
                    </div> 
 
                    <div
                        v-for="seg in week.visibleSegments"
                        :key="seg.key"
                        :draggable="draggableEvents && !seg.event.allDay ? true : draggableEvents"
                        @dragstart="onDragStart(seg.event, $event)"
                        @dragend="onDragEnd"
                        @click.stop="handleEventClick(seg.event, $event)"
                        @mouseenter="onEventEnter(seg.event, !!seg.event.allDay, $event)"
                        @mousemove="onEventMove"
                        @mouseleave="onEventLeave"
                        @touchstart.passive="draggableEvents && onEventTouchStart(seg.event, $event)"
                        @touchmove="draggableEvents && onEventTouchMove($event)"
                        @touchend.passive="draggableEvents && onEventTouchEnd($event)"
                        @touchcancel.passive="onTouchDragCancel" 
                        :style="{ 
                            left: `calc(${(seg.startCol / 7) * 100}% + 4px)`, 
                            width: `calc(${(seg.span / 7) * 100}% - 8px)`, 
                            top: `${28 + seg.lane * laneHeight}px`, 
                            height: `${laneHeight - 2}px`, 
                        }" 
                        :class="[ 
                            'absolute z-10 truncate text-xs px-1.5 flex items-center cursor-pointer transition-opacity hover:opacity-80 select-none', 
                            eventRadiusClass, 
                            draggableEvents ? 'cursor-grab active:cursor-grabbing' : '', 
                            eventColorClass(seg.event.color, showEventAccent), 
                            draggingId === seg.event.id ? 'opacity-50' : '', 
                        ]" 
                    > 
                        <slot name="event" :event="seg.event" :segment="seg"> 
                            <span v-if="!seg.event.allDay && seg.isFirst" class="font-semibold mr-1"> 
                                {{ formatEventTime(seg.event.start) }} 
                            </span> 
                            <span class="truncate">{{ seg.event.title }}</span> 
                        </slot> 
                    </div> 
                </div> 
            </div> 
        </div> 
 
        <CalendarEventTooltip :state="hoverState" :style="tooltipStyle" :formatTime="formatEventTime"> 
            <!--
                A provided slot replaces the built-in card, so it gets the surface
                here; with no slot the fallback content keeps rendering its own.
            -->
            <template v-if="$slots['event-tooltip']" #default="{ event, allDay }">
                <div :class="CALENDAR_TOOLTIP_SURFACE">
                    <slot name="event-tooltip" :event="event" :allDay="allDay" />
                </div>
            </template>
        </CalendarEventTooltip> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, watch, nextTick } from 'vue'; 
import gsap from 'gsap'; 
import { useCalendar, startOfDay, type CalendarDay } from '../../../composables/useCalendar'; 
import { useCalendarTheme } from '../../../composables/useCalendarTheme'; 
import { useEventHover } from '../../../composables/useEventHover'; 
import { useResolvedColor, useResolvedRadius } from '../../../composables/useModoConfig'; 
import { eventColorClassStrong as eventColorClass } from '../../../composables/eventColors'; 
import CalendarEventTooltip from './CalendarEventTooltip.vue'; 
import CalendarHeader from './CalendarHeader.vue'; 
import type { MonthView, CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface'; 
 
import { toCssLength } from '../../../utils/cssLength';

import { CALENDAR_TOOLTIP_SURFACE } from '../../../utils/calendarTooltip';

const props = withDefaults(defineProps<MonthView>(), { 
    modelValue: () => new Date(), 
    events: () => [], 
    locale: 'default', 
    firstDayOfWeek: 0, 
    color: 'default', 
    maxEventsPerDay: 3, 
    showWeekNumbers: false, 
    fixedWeeks: true, 
    showHeader: true, 
    bordered: true, 
    keyboardNavigation: true, 
    dayNameFormat: 'short', 
    dayNameCase: 'upper', 
    highlightWeekends: false, 
    showOutsideDays: true, 
    showMonthYearSelects: true, 
    showYearJump: true, 
    draggableEvents: true, 
    laneHeight: 22, 
}); 
 
const emit = defineEmits<{ 
    'update:modelValue': [date: Date]; 
    'event-click': [event: CalendarEvent, nativeEvent: MouseEvent]; 
    'day-click': [date: Date, events: CalendarEvent[], nativeEvent: MouseEvent]; 
    'more-click': [date: Date, events: CalendarEvent[], nativeEvent: MouseEvent]; 
    'create-event': [date: Date, nativeEvent: MouseEvent | KeyboardEvent]; 
    'event-drop': [event: CalendarEvent, newStart: Date, newEnd: Date | undefined]; 
}>(); 
 
const currentDate = ref(new Date(props.modelValue)); 
const focusedDate = ref(startOfDay(new Date(props.modelValue))); 
watch(() => props.modelValue, (v) => { if (v) { currentDate.value = new Date(v); focusedDate.value = startOfDay(new Date(v)); } }); 
 
const modelRef = computed({ 
    get: () => currentDate.value, 
    set: (v) => { currentDate.value = v; }, 
}); 
 
const localeRef = computed(() => props.locale); 
const firstDowRef = computed(() => props.firstDayOfWeek); 
const fixedWeeksRef = computed(() => props.fixedWeeks); 
const minDateRef = computed(() => props.minDate); 
const maxDateRef = computed(() => props.maxDate); 
const weekdayFormatRef = computed(() => props.dayNameFormat); 
const showOutsideRef = computed(() => props.showOutsideDays); 
const disabledDatesRef = computed(() => props.disabledDates); 
const disabledDowRef = computed(() => props.disabledDaysOfWeek); 
 
const { 
    currentMonth, 
    currentYear, 
    monthLabel, 
    weekDayLabels, 
    calendarDays, 
    prevMonth, 
    nextMonth, 
    prevYear, 
    nextYear, 
    goToToday, 
} = useCalendar({ 
    modelValue: modelRef as unknown as import('vue').Ref<Date | null | undefined>, 
    locale: localeRef, 
    firstDayOfWeek: firstDowRef, 
    fixedWeeks: fixedWeeksRef, 
    minDate: minDateRef, 
    maxDate: maxDateRef, 
    disabledDates: disabledDatesRef, 
    disabledDaysOfWeek: disabledDowRef, 
    weekdayFormat: weekdayFormatRef, 
    showOutsideDays: showOutsideRef, 
}); 
 
const gridRef = ref<HTMLElement | null>(null); 
const rootRef = ref<HTMLElement | null>(null); 
const dayRefs = ref<Map<string, HTMLElement>>(new Map()); 
const setDayRef = (date: Date, el: HTMLElement | null) => { 
    const k = date.toDateString(); 
    if (el) dayRefs.value.set(k, el); 
    else dayRefs.value.delete(k); 
}; 
 
const selectedMonth = computed({ 
    get: () => currentMonth.value, 
    set: (v: number) => { const dir = v > currentMonth.value ? 1 : -1; currentMonth.value = v; nextTick(() => animateChange(dir)); }, 
}); 
const selectedYear = computed({ 
    get: () => currentYear.value, 
    set: (v: number) => { const dir = v > currentYear.value ? 1 : -1; currentYear.value = v; nextTick(() => animateChange(dir)); }, 
}); 
 
const monthOptions = computed(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return Array.from({ length: 12 }, (_, i) => 
        new Date(2024, i, 1).toLocaleString(locale, { month: 'long' }) 
    ); 
}); 
 
const yearOptions = computed(() => { 
    const min = props.minYear ?? (props.minDate ? props.minDate.getFullYear() : currentYear.value - 10); 
    const max = props.maxYear ?? (props.maxDate ? props.maxDate.getFullYear() : currentYear.value + 10); 
    const out: number[] = []; 
    for (let y = min; y <= max; y++) out.push(y); 
    if (!out.includes(currentYear.value)) out.push(currentYear.value); 
    return out.sort((a, b) => a - b); 
}); 
 
const gridTemplateColumns = computed(() => { 
    if (props.showWeekNumbers) return { gridTemplateColumns: '2.5rem repeat(7, minmax(0, 1fr))' }; 
    return { gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }; 
}); 
 
const isWeekendCol = (colIdx: number) => { 
    const dow = (props.firstDayOfWeek + colIdx) % 7; 
    return dow === 0 || dow === 6; 
}; 
 
const getWeekNumber = (date: Date) => { 
    const target = new Date(date.valueOf()); 
    const dayNr = (date.getDay() + 6) % 7; 
    target.setDate(target.getDate() - dayNr + 3); 
    const firstThursday = target.valueOf(); 
    target.setMonth(0, 1); 
    if (target.getDay() !== 4) { 
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7); 
    } 
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000); 
}; 
 
const lastDayOfMonth = (y: number, mo: number) => new Date(y, mo + 1, 0); 
const firstDayOfMonth = (y: number, mo: number) => new Date(y, mo, 1); 
 
const isMonthDisabled = (month: number, year: number) => { 
    const min = props.minDate; 
    const max = props.maxDate; 
    const end = lastDayOfMonth(year, month); 
    const start = firstDayOfMonth(year, month); 
    if (min && end < startOfDay(min)) return true; 
    if (max && start > startOfDay(max)) return true; 
    return false; 
}; 
 
const isPrevMonthDisabled = computed(() => { 
    if (!props.minDate) return false; 
    const prev = new Date(currentYear.value, currentMonth.value, 0); 
    return prev < startOfDay(props.minDate); 
}); 
const isNextMonthDisabled = computed(() => { 
    if (!props.maxDate) return false; 
    const next = new Date(currentYear.value, currentMonth.value + 1, 1); 
    return next > startOfDay(props.maxDate); 
}); 
const isPrevYearDisabled = computed(() => { 
    if (props.minYear !== undefined && currentYear.value <= props.minYear) return true; 
    if (props.minDate && new Date(currentYear.value - 1, 11, 31) < startOfDay(props.minDate)) return true; 
    return false; 
}); 
const isNextYearDisabled = computed(() => { 
    if (props.maxYear !== undefined && currentYear.value >= props.maxYear) return true; 
    if (props.maxDate && new Date(currentYear.value + 1, 0, 1) > startOfDay(props.maxDate)) return true; 
    return false; 
}); 
 
interface EventSegment { 
    key: string; 
    event: CalendarEvent; 
    startCol: number; 
    span: number; 
    lane: number; 
    isFirst: boolean; 
} 
 
interface WeekData { 
    days: CalendarDay[]; 
    visibleSegments: EventSegment[]; 
    overflow: number[]; 
} 
 
const visibleLanes = computed(() => props.maxEventsPerDay); 
 
const dayMs = 86400000; 
 
const getEventDayRange = (ev: CalendarEvent) => { 
    const s = startOfDay(ev.start); 
    const e = startOfDay(ev.end ?? ev.start); 
    return { s, e }; 
}; 
 
const weeksData = computed<WeekData[]>(() => { 
    const days = calendarDays.value; 
    const weeks: CalendarDay[][] = []; 
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7)); 
 
    const sortedEvents = [...props.events].sort((a, b) => { 
        const aLen = (a.end ? startOfDay(a.end).getTime() : startOfDay(a.start).getTime()) - startOfDay(a.start).getTime(); 
        const bLen = (b.end ? startOfDay(b.end).getTime() : startOfDay(b.start).getTime()) - startOfDay(b.start).getTime(); 
        if (bLen !== aLen) return bLen - aLen; 
        return a.start.getTime() - b.start.getTime(); 
    }); 
 
    return weeks.map((weekDays) => { 
        const weekStart = startOfDay(weekDays[0].date); 
        const weekEnd = startOfDay(weekDays[6].date); 
 
        const segs: Omit<EventSegment, 'key'>[] = []; 
        const lanesTaken: Set<number>[] = Array.from({ length: 7 }, () => new Set()); 
 
        const weekEvents = sortedEvents.filter(ev => { 
            const { s, e } = getEventDayRange(ev); 
            return e.getTime() >= weekStart.getTime() && s.getTime() <= weekEnd.getTime(); 
        }); 
 
        for (const ev of weekEvents) { 
            const { s, e } = getEventDayRange(ev); 
            const segStart = s.getTime() < weekStart.getTime() ? weekStart : s; 
            const segEnd = e.getTime() > weekEnd.getTime() ? weekEnd : e; 
            const startCol = Math.round((segStart.getTime() - weekStart.getTime()) / dayMs); 
            const span = Math.round((segEnd.getTime() - segStart.getTime()) / dayMs) + 1; 
 
            let lane = 0; 
            while (true) { 
                let ok = true; 
                for (let c = startCol; c < startCol + span; c++) { 
                    if (lanesTaken[c].has(lane)) { ok = false; break; } 
                } 
                if (ok) break; 
                lane++; 
            } 
            for (let c = startCol; c < startCol + span; c++) lanesTaken[c].add(lane); 
 
            segs.push({ 
                event: ev, 
                startCol, 
                span, 
                lane, 
                isFirst: s.getTime() >= weekStart.getTime(), 
            }); 
        } 
 
        const visibleSegments: EventSegment[] = segs 
            .filter(s => s.lane < visibleLanes.value) 
            .map(s => ({ ...s, key: `${s.event.id}-${s.startCol}` })); 
 
        const overflow = Array.from({ length: 7 }, (_, c) => { 
            let count = 0; 
            for (const s of segs) { 
                if (s.lane >= visibleLanes.value && c >= s.startCol && c < s.startCol + s.span) count++; 
            } 
            return count; 
        }); 
 
        return { days: weekDays, visibleSegments, overflow }; 
    }); 
}); 
 
const eventsForDay = (date: Date): CalendarEvent[] => { 
    return props.events 
        .filter(ev => { 
            const { s, e } = getEventDayRange(ev); 
            const d0 = startOfDay(date).getTime(); 
            return d0 >= s.getTime() && d0 <= e.getTime(); 
        }) 
        .sort((a, b) => { 
            if (a.allDay && !b.allDay) return -1; 
            if (!a.allDay && b.allDay) return 1; 
            return a.start.getTime() - b.start.getTime(); 
        }); 
}; 
 
const formatEventTime = (d: Date) => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }); 
}; 
 
const animateChange = (direction: 1 | -1) => { 
    if (!gridRef.value) return; 
    gsap.fromTo( 
        gridRef.value, 
        { opacity: 0, x: 20 * direction }, 
        { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' } 
    ); 
}; 
 
const handlePrevMonth = () => { prevMonth(); nextTick(() => animateChange(-1)); }; 
const handleNextMonth = () => { nextMonth(); nextTick(() => animateChange(1)); }; 
const handlePrevYear = () => { prevYear(); nextTick(() => animateChange(-1)); }; 
const handleNextYear = () => { nextYear(); nextTick(() => animateChange(1)); }; 
const handleToday = () => { 
    const now = goToToday(); 
    currentDate.value = now; 
    focusedDate.value = startOfDay(now); 
    emit('update:modelValue', now); 
    nextTick(() => animateChange(1)); 
}; 
 
const clickTimer = ref<ReturnType<typeof setTimeout> | null>(null); 
const DOUBLE_CLICK_DELAY = 220; 
 
const { hoverState, onEventEnter, onEventMove, onEventLeave, tooltipStyle } = useEventHover<CalendarEvent>(); 
 
const handleDayClick = (day: CalendarDay, e: MouseEvent) => { 
    if (day.disabled) return; 
    currentDate.value = day.date; 
    focusedDate.value = startOfDay(day.date); 
    emit('update:modelValue', day.date); 
    if (clickTimer.value) clearTimeout(clickTimer.value); 
    clickTimer.value = setTimeout(() => { 
        emit('day-click', day.date, eventsForDay(day.date), e); 
        clickTimer.value = null; 
    }, DOUBLE_CLICK_DELAY); 
}; 
 
const handleDayDblClick = (day: CalendarDay, e: MouseEvent) => { 
    if (day.disabled) return; 
    if (clickTimer.value) { clearTimeout(clickTimer.value); clickTimer.value = null; } 
    emit('create-event', day.date, e); 
}; 
 
const handleEventClick = (ev: CalendarEvent, e: MouseEvent) => emit('event-click', ev, e); 
const handleMoreClick = (date: Date, e: MouseEvent) => emit('more-click', date, eventsForDay(date), e); 
 
const draggingId = ref<string | number | null>(null);
const dragOverKey = ref<string | null>(null);

const onDragStart = (ev: CalendarEvent, e: DragEvent) => {
    if (!props.draggableEvents) return;
    draggingId.value = ev.id;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(ev.id));
    }
};
const onDragEnd = () => {
    draggingId.value = null;
    dragOverKey.value = null;
};
const onDragOver = (day: CalendarDay, e: DragEvent) => {
    if (!props.draggableEvents || draggingId.value === null) return;
    if (day.disabled) { if (e.dataTransfer) e.dataTransfer.dropEffect = 'none'; return; }
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dragOverKey.value = day.date.toDateString();
};
const onDrop = (day: CalendarDay, _e: DragEvent) => {
    if (!props.draggableEvents || draggingId.value === null) return;
    if (day.disabled) { onDragEnd(); return; }
    const ev = props.events.find(e => e.id === draggingId.value);
    if (!ev) { onDragEnd(); return; }
    const oldStart = startOfDay(ev.start);
    const diff = startOfDay(day.date).getTime() - oldStart.getTime();
    const newStart = new Date(ev.start.getTime() + diff);
    const newEnd = ev.end ? new Date(ev.end.getTime() + diff) : undefined;
    emit('event-drop', ev, newStart, newEnd);
    onDragEnd();
};

/* ---------- Touch drag (mobile — HTML5 drag API doesn't work on touch) ---------- */

let touchHoldTimer: ReturnType<typeof setTimeout> | null = null;
let touchDragEventId: string | number | null = null;
const touchDragActive = ref(false);
let touchDragEl: HTMLElement | null = null;

const onEventTouchStart = (ev: CalendarEvent, e: TouchEvent) => {
    touchDragEventId = ev.id;
    touchDragEl = e.currentTarget as HTMLElement;
    touchHoldTimer = setTimeout(() => {
        touchDragActive.value = true;
        draggingId.value = ev.id;
    }, 350);
};

const onEventTouchMove = (e: TouchEvent) => {
    if (!touchDragActive.value) {
        // Touch moved before hold — cancel pending drag.
        if (touchHoldTimer) { clearTimeout(touchHoldTimer); touchHoldTimer = null; }
        touchDragEventId = null;
        return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    // Temporarily hide the dragged element so elementFromPoint returns the day underneath.
    if (touchDragEl) touchDragEl.style.pointerEvents = 'none';
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (touchDragEl) touchDragEl.style.pointerEvents = '';
    const dayEl = (target as Element | null)?.closest('[data-day-key]') as HTMLElement | null;
    dragOverKey.value = dayEl?.dataset.dayKey ?? null;
};

const onEventTouchEnd = (e: TouchEvent) => {
    if (touchHoldTimer) { clearTimeout(touchHoldTimer); touchHoldTimer = null; }
    if (!touchDragActive.value) { touchDragEventId = null; return; }

    const touch = e.changedTouches[0];
    if (touchDragEl) touchDragEl.style.pointerEvents = 'none';
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (touchDragEl) touchDragEl.style.pointerEvents = '';

    const dayKey = (target as Element | null)?.closest('[data-day-key]')
        ?.getAttribute('data-day-key');

    if (dayKey && touchDragEventId !== null) {
        for (const week of weeksData.value) {
            const day = week.days.find(d => d.date.toDateString() === dayKey);
            if (day) { onDrop(day, {} as DragEvent); break; }
        }
    }
    onTouchDragCancel();
};

const onTouchDragCancel = () => {
    if (touchHoldTimer) { clearTimeout(touchHoldTimer); touchHoldTimer = null; }
    touchDragActive.value = false;
    touchDragEventId = null;
    touchDragEl = null;
    draggingId.value = null;
    dragOverKey.value = null;
}; 
 
const focusDay = (date: Date) => { 
    focusedDate.value = startOfDay(date); 
    nextTick(() => { 
        const el = dayRefs.value.get(focusedDate.value.toDateString()); 
        if (el) el.focus(); 
        else rootRef.value?.focus(); 
    }); 
}; 
 
const handleKeydown = (e: KeyboardEvent) => { 
    if (!props.keyboardNavigation) return; 
    const target = e.target as HTMLElement; 
    if (target.tagName === 'SELECT' || target.tagName === 'INPUT') return; 
    const d = new Date(focusedDate.value); 
    let handled = true; 
    if (e.key === 'ArrowLeft') d.setDate(d.getDate() - 1); 
    else if (e.key === 'ArrowRight') d.setDate(d.getDate() + 1); 
    else if (e.key === 'ArrowUp') d.setDate(d.getDate() - 7); 
    else if (e.key === 'ArrowDown') d.setDate(d.getDate() + 7); 
    else if (e.key === 'Home') d.setDate(d.getDate() - ((d.getDay() - props.firstDayOfWeek + 7) % 7)); 
    else if (e.key === 'End') d.setDate(d.getDate() + (6 - ((d.getDay() - props.firstDayOfWeek + 7) % 7))); 
    else if (e.key === 'PageUp') d.setMonth(d.getMonth() - 1); 
    else if (e.key === 'PageDown') d.setMonth(d.getMonth() + 1); 
    else if (e.key === 'Enter' || e.key === ' ') { emit('day-click', focusedDate.value, eventsForDay(focusedDate.value), e as unknown as MouseEvent); handled = true; } 
    else if (e.key.toLowerCase() === 'c') { emit('create-event', focusedDate.value, e); handled = true; } 
    else if (e.key.toLowerCase() === 't') handleToday(); 
    else handled = false; 
 
    if (handled) { 
        e.preventDefault(); 
        if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown') { 
            if (d.getMonth() !== currentMonth.value || d.getFullYear() !== currentYear.value) { 
                currentMonth.value = d.getMonth(); 
                currentYear.value = d.getFullYear(); 
                nextTick(() => animateChange(d > focusedDate.value ? 1 : -1)); 
            } 
            focusDay(d); 
        } 
    } 
}; 
 
watch([currentMonth, currentYear], () => { 
    currentDate.value = new Date(currentYear.value, currentMonth.value, 1); 
    if (focusedDate.value.getMonth() !== currentMonth.value || focusedDate.value.getFullYear() !== currentYear.value) { 
        const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0).getDate(); 
        const targetDay = Math.min(focusedDate.value.getDate(), lastDay); 
        focusedDate.value = new Date(currentYear.value, currentMonth.value, targetDay); 
    } 
}); 
 
const focusGrid = () => { 
    nextTick(() => { 
        const el = dayRefs.value.get(focusedDate.value.toDateString()); 
        if (el) el.focus(); 
        else rootRef.value?.focus(); 
    }); 
}; 
 
defineExpose({ focusGrid }); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedRadius = useResolvedRadius(() => props.radius); 
 
const { 
    todayTextClass, 
    todayBgClass, 
    focusRingColorClass, 
    containerRadiusClass, 
    eventRadiusClass, 
    showEventAccent, 
    pillRadiusClass, 
    dayNameCaseClass, 
} = useCalendarTheme({ 
    color: () => resolvedColor.value, 
    radius: () => resolvedRadius.value, 
    dayNameCase: () => props.dayNameCase, 
}); 
 
const dropTargetBgClass = computed(() => ({ 
    default: 'bg-muted', 
    primary: 'bg-primary-subtle', 
    danger: 'bg-destructive-subtle', 
    success: 'bg-success-subtle', 
    warning: 'bg-warning-subtle', 
}[resolvedColor.value] ?? 'bg-primary-subtle')); 
</script> 
 
<style scoped> 
.month-disabled-day { 
    background-image: repeating-linear-gradient(135deg, transparent 0 6px, rgba(0, 0, 0, 0.04) 6px 7px); 
} 
</style>
