<template> 
    <div 
        ref="rootRef" 
        tabindex="-1" 
        :class="['relative flex flex-col bg-card overflow-hidden focus:outline-none isolate', containerRadiusClass, bordered ? 'border border-border' : '']" 
        :style="{ maxHeight: toCssLength(maxHeight) }"
        @keydown="handleKeydown" 
        @pointerdown="hasKeyboardFocus = false" 
    > 
        <slot name="header" :rangeLabel="rangeLabel" :goToToday="handleToday" :prev="handlePrev" :next="handleNext" :prevYear="handlePrevYear" :nextYear="handleNextYear"> 
            <CalendarHeader 
                :label="rangeLabel" 
                :showHeader="showHeader" 
                :showYearJump="showYearJump" 
                :showTodayButton="showTodayButton" 
                :showMonthYearSelects="showMonthYearSelects" 
                :showWeekSelect="showWeekSelect" 
                :monthOptions="monthOptions" 
                :yearOptions="yearOptions" 
                :weekOptions="weekOptions" 
                v-model:selectedMonth="selectedMonth" 
                v-model:selectedYear="selectedYear" 
                v-model:selectedWeek="selectedWeek" 
                :isPrevDisabled="isPrevDisabled" 
                :isNextDisabled="isNextDisabled" 
                prevLabel="Previous week" 
                nextLabel="Next week" 
                :color="resolvedColor" 
                :focusRingColorClass="focusRingColorClass" 
                :todayTextClass="todayTextClass" 
                :todayRadiusClass="pillRadiusClass" 
                :dayNameCaseClass="dayNameCaseClass" 
                @prev="handlePrev" 
                @next="handleNext" 
                @prevYear="handlePrevYear" 
                @nextYear="handleNextYear" 
                @today="handleToday" 
            /> 
        </slot> 
 
        <div ref="scrollRef" class="flex-1 overflow-y-scroll overflow-x-auto relative" style="scrollbar-gutter: stable;"> 
            <div 
                class="relative flex flex-col" 
                :style="{ minWidth: `calc(3.5rem + 7 * ${minDayWidth}px)` }" 
            > 
                <!-- Day header (sticky vertically). --> 
                <div class="grid border-b border-border bg-card sticky top-0 z-40" :style="headerGridStyle"> 
                    <div class="w-14 shrink-0 sticky left-0 z-10 bg-card border-l border-r border-border"></div> 
                    <div 
                        v-for="(day, i) in days" 
                        :key="day.date.toISOString()" 
                        @click="handleDayHeaderClick(day, $event)" 
                        :class="[ 
                            'relative flex flex-col items-center justify-center py-2 border-l border-border transition-colors', 
                            isDayDisabled(day.date) ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted', 
                        ]" 
                        :style="isDayDisabled(day.date) ? disabledStripePattern : undefined" 
                    > 
                        <span 
                            :class="[ 
                                'text-[11px] font-medium tracking-wider', 
                                dayNameCaseClass, 
                                isDayDisabled(day.date) ? 'text-muted-foreground/60' : 'text-muted-foreground', 
                            ]" 
                        > 
                            {{ weekDayLabels[i] }} 
                        </span> 
                        <span 
                            :class="[ 
                                'mt-0.5 inline-flex items-center justify-center text-sm font-semibold w-7 h-7', 
                                pillRadiusClass, 
                                isDayDisabled(day.date) 
                                    ? 'text-muted-foreground/60' 
                                    : day.isToday 
                                        ? [todayBgClass] 
                                        : 'text-foreground', 
                            ]" 
                        > 
                            {{ day.day }} 
                        </span> 
                        <span v-if="headerDotClass(day, i)" :class="['mt-0.5 w-1 h-1 rounded-full', headerDotClass(day, i)]"></span> 
                    </div> 
                </div> 
 
                <!-- All-day row (sticky vertically below day header). --> 
                <div 
                    v-if="showAllDayRow && allDayRows > 0" 
                    class="grid border-b border-border bg-card sticky z-30" 
                    :style="[headerGridStyle, { top: '3.5rem' }]" 
                > 
                    <div class="w-14 shrink-0 flex items-start justify-end pr-2 pt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider sticky left-0 z-20 bg-card border-l border-r border-border"> 
                        all-day 
                    </div> 
                    <div class="relative" :style="{ gridColumn: '2 / span 7', height: `${allDayRows * 22 + 4}px` }"> 
                        <div class="absolute inset-0 grid grid-cols-7"> 
                            <div 
                                v-for="day in days" 
                                :key="day.date.toISOString()" 
                                @click="handleAllDayCellClick(day, $event)" 
                                @dblclick="handleAllDayCellDblClick(day, $event)" 
                                @dragover.prevent="onAllDayDragOver(day, $event)" 
                                @drop.prevent="onAllDayDrop(day, $event)" 
                                :class="[ 
                                    'border-l border-border transition-colors', 
                                    isDayDisabled(day.date) ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted/60', 
                                    allDayDragOver === day.date.toDateString() ? 'bg-muted' : '', 
                                ]" 
                                :style="isDayDisabled(day.date) ? disabledStripePattern : undefined" 
                            ></div> 
                        </div> 
                        <div 
                            v-for="seg in allDaySegments" 
                            :key="seg.key" 
                            :data-eid="seg.event.id" 
                            :draggable="draggableEvents && isEventInteractive(seg.event)" 
                            @dragstart="onDragStart(seg.event, $event, 'move')" 
                            @dragend="onDragEnd" 
                            @click.stop="handleEventClick(seg.event, $event)" 
                            @mouseenter="onEventEnter(seg.event, true, $event)" 
                            @mousemove="onEventMove" 
                            @mouseleave="onEventLeave" 
                            :style="[ 
                                { 
                                    left: `calc(${(seg.startCol / 7) * 100}% + 2px)`, 
                                    width: `calc(${(seg.span / 7) * 100}% - 4px)`, 
                                    top: `${seg.lane * 22 + 2}px`, 
                                    height: '20px', 
                                }, 
                                eventInlineStyle(seg.event), 
                            ]" 
                            :class="[ 
                                'absolute z-10 truncate text-xs px-1.5 flex items-center cursor-pointer transition-all hover:opacity-80 select-none', 
                                eventRadiusClass, 
                                draggableEvents ? 'cursor-grab active:cursor-grabbing' : '', 
                                seg.event.colorHex ? '' : eventColorClass(seg.event.color, showEventAccent), 
                                draggingId === seg.event.id ? 'opacity-70 scale-95' : '', 
                            ]" 
                        > 
                            <slot name="event" :event="seg.event" :allDay="true"> 
                                <span class="truncate font-medium">{{ seg.event.title }}</span> 
                            </slot> 
                        </div> 
                    </div> 
                </div> 
 
                <!-- Time-grid body. --> 
                <div class="grid" :style="headerGridStyle"> 
                    <div class="w-14 shrink-0 relative sticky left-0 z-[25] bg-card border-l border-r border-border" :style="{ height: `${totalPixels}px` }"> 
                        <div 
                            v-for="h in hourLabels" 
                            :key="h.offset" 
                            class="absolute right-0 pr-2 text-[10px] font-medium text-muted-foreground tracking-wide -translate-y-1/2" 
                            :style="{ top: `${h.offset * 60 * (slotHeight / slotMinutes)}px` }" 
                        > 
                            <span v-if="h.offset !== 0 && h.offset !== windowHours">{{ h.label }}</span> 
                        </div> 
                        <span 
                            v-if="showCurrentTime && showCurrentTimeLabel && anyDayIsToday" 
                            :class="['absolute right-1 -translate-y-1/2 px-1 py-0.5 text-[10px] font-semibold text-white leading-none z-30 pointer-events-none', eventRadiusClass, currentTimeSolidClass]" 
                            :style="{ top: `${currentTimeTop}px` }" 
                        >{{ currentTimeLabel }}</span> 
                        <span 
                            v-else-if="showCurrentTime && !showCurrentTimeLabel && anyDayIsToday" 
                            :class="['absolute right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-30 pointer-events-none', currentTimeSolidClass]" 
                            :style="{ top: `${currentTimeTop}px` }" 
                        ></span> 
                    </div> 
 
                <div 
                    v-for="(day, dIdx) in days" 
                    :key="day.date.toISOString()" 
                    :ref="(el: unknown) => setDayColRef(day.date, el as HTMLElement | null)" 
                    :class="['relative border-l border-border']" 
                    @pointerdown="onColPointerDown(day, dIdx, $event)" 
                    @click="handleSlotClick(day, $event)" 
                    @dblclick="handleSlotDblClick(day, $event)" 
                    @dragover.prevent="onDragOver(day, $event)" 
                    @drop.prevent="onDrop(day, $event)" 
                > 
                    <div 
                        v-for="(_, idx) in totalSlots" 
                        :key="idx" 
                        :style="[ 
                            { height: `${slotHeight}px` }, 
                            isSlotDisabled(day.date, idx) 
                                ? disabledStripePattern 
                                : !isBusinessHour(day.date, idx) 
                                    ? { backgroundColor: 'rgba(0,0,0,0.015)' } 
                                    : undefined, 
                        ]" 
                        :class="[ 
                            'border-t', 
                            idx === 0 ? 'border-transparent' : idx % slotsPerHour === 0 ? 'border-border' : 'border-dashed border-border/70', 
                            isSlotDisabled(day.date, idx) ? 'cursor-not-allowed' : '', 
                        ]" 
                    ></div> 
 
                    <div 
                        v-if="isDayDisabled(day.date)" 
                        class="absolute inset-0 pointer-events-none" 
                        :style="disabledStripePattern" 
                    ></div> 
 
                    <div 
                        v-for="seg in segmentsByDay[dIdx]" 
                        :key="seg.key" 
                        :data-eid="seg.event.id" 
                        :draggable="draggableEvents && resizingId !== seg.event.id && isEventInteractive(seg.event)" 
                        @dragstart.stop="onDragStart(seg.event, $event, 'move')" 
                        @dragend="onDragEnd" 
                        @click.stop="handleEventClick(seg.event, $event)" 
                        @pointerdown.stop 
                        @mouseenter="onEventEnter(seg.event, false, $event)" 
                        @mousemove="onEventMove" 
                        @mouseleave="onEventLeave" 
                        :style="[seg.style, eventInlineStyle(seg.event)]" 
                        :class="[ 
                            'absolute z-10 overflow-hidden transition-all hover:opacity-90 select-none flex flex-col', 
                            eventRadiusClass, 
                            isEventInteractive(seg.event) ? 'cursor-pointer' : 'cursor-default', 
                            draggableEvents && isEventInteractive(seg.event) ? 'cursor-grab active:cursor-grabbing' : '', 
                            seg.event.colorHex ? (showEventAccent ? 'border-l-2' : '') : eventColorClass(seg.event.color, showEventAccent), 
                            draggingId === seg.event.id ? 'opacity-70 scale-95' : '', 
                        ]" 
                    > 
                        <slot name="event" :event="seg.event" :allDay="false"> 
                            <div class="px-1.5 py-0.5 flex-1 min-h-0"> 
                                <div class="text-[10px] font-semibold leading-tight opacity-80">{{ formatEventTime(seg.event.start) }}</div> 
                                <div class="text-xs font-medium truncate leading-tight">{{ seg.event.title }}</div> 
                            </div> 
                        </slot> 
                        <div 
                            v-if="resizableEvents && isEventInteractive(seg.event)" 
                            draggable="false" 
                            @mousedown.stop.prevent 
                            @dragstart.stop.prevent 
                            @pointerdown.stop="onResizeStart(seg.event, $event)" 
                            class="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-black/10" 
                        ></div> 
                    </div> 
 
                    <div 
                        v-if="showCurrentTime && (currentTimeSpan === 'week' || day.date.toDateString() === nowOwnerKey)" 
                        class="absolute left-0 right-0 h-px pointer-events-none z-20" 
                        :class="currentTimeSpan === 'week' && currentTimeDimOtherDays && day.date.toDateString() !== nowOwnerKey ? currentTimeFadedClass : currentTimeSolidClass" 
                        :style="{ top: `${currentTimeTop}px` }" 
                    ></div> 
 
                    <div 
                        v-if="dragOverKey === day.date.toDateString()" 
                        class="absolute inset-0 pointer-events-none z-0 bg-muted/60" 
                    ></div> 
 
                    <div 
                        v-if="rangeSelect && rangeSelect.colIdx === dIdx" 
                        :class="['absolute left-1 right-1 pointer-events-none z-20 border border-dashed', eventRadiusClass, rangeSelectClass]" 
                        :style="{ top: `${rangeSelect.topPx}px`, height: `${rangeSelect.heightPx}px` }" 
                    ></div> 
 
                    <div 
                        v-if="resizingPreview && resizingPreview.colIdx === dIdx" 
                        :class="['absolute left-1 right-1 pointer-events-none z-20 border border-dashed border-muted-foreground bg-foreground/5', eventRadiusClass]" 
                        :style="{ top: `${resizingPreview.topPx}px`, height: `${resizingPreview.heightPx}px` }" 
                    ></div> 
 
                    <div 
                        v-if="enableKeyboardNavigation && showFocusIndicator && hasKeyboardFocus && day.date.getTime() === focusedDate.getTime()" 
                        :class="['absolute inset-0 pointer-events-none z-30 ring-1 ring-inset', focusRingColorClass]" 
                    ></div> 
                </div> 
                </div> 
            </div> 
        </div> 
 
        <button 
            v-if="showNowPill && anyDayIsToday" 
            type="button" 
            @click="scrollToCurrentTime" 
            :class="['absolute bottom-4 right-6 z-40 px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium shadow-lg bg-card border border-border hover:bg-muted transition-all cursor-pointer', pillRadiusClass]" 
        > 
            <span class="w-1.5 h-1.5" :class="[pillRadiusClass, currentTimeSolidClass]"></span> 
            <span class="text-foreground/80">Now</span> 
        </button> 
 
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'; 
import gsap from 'gsap'; 
import { useCalendar, isSameDay, startOfDay } from '../../../composables/useCalendar'; 
import { useCalendarTheme } from '../../../composables/useCalendarTheme'; 
import { useEventHover } from '../../../composables/useEventHover'; 
import { useAutoScroll } from '../../../composables/useAutoScroll'; 
import { useCurrentTimeLine } from '../../../composables/useCurrentTimeLine'; 
import { useTimeGrid, MS_MIN } from '../../../composables/useTimeGrid'; 
import { eventColorClass, hexToRgba } from '../../../composables/eventColors'; 
import CalendarEventTooltip from './CalendarEventTooltip.vue'; 
import CalendarHeader from './CalendarHeader.vue'; 
import type { WeekView, BusinessHours } from '../../../interfaces/data-display/calendar/WeekView.interface'; 
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface'; 
 
import { toCssLength } from '../../../utils/cssLength';

import { CALENDAR_TOOLTIP_SURFACE } from '../../../utils/calendarTooltip';

const props = withDefaults(defineProps<WeekView>(), { 
    modelValue: () => new Date(), 
    events: () => [], 
    locale: 'default', 
    firstDayOfWeek: 0, 
    color: 'default', 
    bordered: true, 
    dayNameFormat: 'short', 
    dayNameCase: 'upper', 
    highlightedWeekdays: () => [], 
    highlightedDates: () => [], 
    disabledDates: () => [], 
    disabledWeekdays: () => [], 
    disabledTimeRanges: () => [], 
    showHeader: true, 
    showYearJump: false, 
    showTodayButton: true, 
    showMonthYearSelects: false, 
    showWeekSelect: false, 
    hourStart: 0, 
    hourEnd: 24, 
    slotMinutes: 30, 
    slotHeight: 24, 
    minDayWidth: 140, 
    format: '24h', 
    showCurrentTime: true, 
    showCurrentTimeLabel: true, 
    currentTimeSpan: 'week', 
    currentTimeColor: 'red', 
    currentTimeDimOtherDays: true, 
    currentTimeUpdateInterval: 60000, 
    draggableEvents: true, 
    resizableEvents: true, 
    allowRangeSelection: true, 
    allowDropOnDisabled: false, 
    allowResizeOverDisabled: false, 
    readonly: false, 
    preventOverlap: false, 
    autoScrollOnDrag: true, 
    showAllDayRow: true, 
    enableKeyboardNavigation: true, 
    showFocusIndicator: true, 
    showNowPill: true, 
}); 
 
const emit = defineEmits<{ 
    'update:modelValue': [date: Date]; 
    'event-click': [event: CalendarEvent, nativeEvent: MouseEvent]; 
    'day-click': [date: Date, events: CalendarEvent[], nativeEvent: MouseEvent]; 
    'slot-click': [date: Date, nativeEvent: MouseEvent]; 
    'create-event': [date: Date, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent]; 
    'event-drop': [event: CalendarEvent, newStart: Date, newEnd: Date | undefined]; 
    'event-resize': [event: CalendarEvent, newStart: Date, newEnd: Date]; 
    'select-range': [start: Date, end: Date]; 
}>(); 
 
const currentDate = ref(new Date(props.modelValue)); 
const focusedDate = ref(startOfDay(new Date(props.modelValue))); 
watch(() => props.modelValue, (v) => { if (v) { currentDate.value = new Date(v); focusedDate.value = startOfDay(new Date(v)); } }); 
 
const localeRef = computed(() => props.locale); 
const firstDowRef = computed(() => props.firstDayOfWeek); 
const weekdayFormatRef = computed(() => props.dayNameFormat); 
const minDateRef = computed(() => props.minDate); 
const maxDateRef = computed(() => props.maxDate); 
 
const { weekDayLabels } = useCalendar({ 
    locale: localeRef, 
    firstDayOfWeek: firstDowRef, 
    weekdayFormat: weekdayFormatRef, 
    minDate: minDateRef, 
    maxDate: maxDateRef, 
}); 
 
const rootRef = ref<HTMLElement | null>(null); 
const scrollRef = ref<HTMLElement | null>(null); 
const hasKeyboardFocus = ref(false); 
 
const { hoverState, onEventEnter, onEventMove, onEventLeave, tooltipStyle } = useEventHover<CalendarEvent>(); 
 
const { handleAutoScroll, stopAutoScroll } = useAutoScroll({ 
    scrollRef, 
    enabled: () => props.autoScrollOnDrag, 
}); 
 
const dayColRefs = ref<Map<string, HTMLElement>>(new Map()); 
const setDayColRef = (date: Date, el: HTMLElement | null) => { 
    const k = date.toDateString(); 
    if (el) dayColRefs.value.set(k, el); 
    else dayColRefs.value.delete(k); 
}; 
 
const today = new Date(); 
const now = ref(new Date()); 
const scrollbarWidth = ref(0); 
let tickInterval: ReturnType<typeof setInterval> | null = null; 
 
const disabledStripePattern = { 
    backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 5px, rgba(0,0,0,0.035) 5px 6px)', 
}; 
 
onMounted(() => { 
    if (props.currentTimeUpdateInterval > 0) { 
        tickInterval = setInterval(() => { now.value = new Date(); }, props.currentTimeUpdateInterval); 
    } 
    if (scrollRef.value) { 
        scrollbarWidth.value = scrollRef.value.offsetWidth - scrollRef.value.clientWidth; 
        scrollRef.value.addEventListener('scroll', updateNowPill); 
    } 
    scrollToCurrentTime(); 
    updateNowPill(); 
    nextTick(() => { 
        if (!rootRef.value) return; 
        const els = rootRef.value.querySelectorAll<HTMLElement>('[data-eid]'); 
        if (els.length) { 
            gsap.fromTo( 
                els, 
                { opacity: 0, y: 6, scale: 0.96 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out', stagger: { amount: 0.2, from: 'start' } } 
            ); 
        } 
    }); 
}); 
onUnmounted(() => { 
    if (tickInterval) clearInterval(tickInterval); 
    if (scrollRef.value) scrollRef.value.removeEventListener('scroll', updateNowPill); 
}); 
 
const weekStart = computed(() => { 
    const d = new Date(currentDate.value); 
    const dow = d.getDay(); 
    const diff = (dow - props.firstDayOfWeek + 7) % 7; 
    return startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)); 
}); 
 
const weekEnd = computed(() => { 
    const d = new Date(weekStart.value); 
    d.setDate(d.getDate() + 6); 
    return d; 
}); 
 
interface WeekDay { date: Date; day: number; isToday: boolean; } 
 
const days = computed<WeekDay[]>(() => { 
    const list: WeekDay[] = []; 
    for (let i = 0; i < 7; i++) { 
        const d = new Date(weekStart.value); 
        d.setDate(d.getDate() + i); 
        list.push({ date: d, day: d.getDate(), isToday: isSameDay(d, today) }); 
    } 
    return list; 
}); 
 
const rangeLabel = computed(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    const s = weekStart.value; 
    const e = weekEnd.value; 
    if (s.getMonth() === e.getMonth()) { 
        return `${s.toLocaleString(locale, { month: 'long' })} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`; 
    } 
    return `${s.toLocaleString(locale, { month: 'short' })} ${s.getDate()} – ${e.toLocaleString(locale, { month: 'short' })} ${e.getDate()}, ${e.getFullYear()}`; 
}); 
 
const isPrevDisabled = computed(() => { 
    if (!props.minDate) return false; 
    const prev = new Date(weekStart.value); 
    prev.setDate(prev.getDate() - 1); 
    return prev < startOfDay(props.minDate); 
}); 
const isNextDisabled = computed(() => { 
    if (!props.maxDate) return false; 
    const next = new Date(weekEnd.value); 
    next.setDate(next.getDate() + 1); 
    return next > startOfDay(props.maxDate); 
}); 
 
const weekdayOfCol = (colIdx: number) => (props.firstDayOfWeek + colIdx) % 7; 
const isHighlightedWeekday = (colIdx: number) => props.highlightedWeekdays.includes(weekdayOfCol(colIdx)); 
const isHighlightedDate = (d: Date) => props.highlightedDates.some(h => isSameDay(h, d)); 
const isDisabledWeekday = (d: Date) => props.disabledWeekdays.includes(d.getDay()); 
const isDisabledDate = (d: Date) => props.disabledDates.some(x => isSameDay(x, d)); 
const isDayDisabled = (d: Date) => { 
    if (props.minDate && startOfDay(d) < startOfDay(props.minDate)) return true; 
    if (props.maxDate && startOfDay(d) > startOfDay(props.maxDate)) return true; 
    return isDisabledDate(d) || isDisabledWeekday(d); 
}; 
 
const parseHM = (s: string) => { 
    const [h, m] = s.split(':').map(Number); 
    return h * 60 + (m || 0); 
}; 
 
const splitDayRange = (absStart: number, absEnd: number) => { 
    const parts: { dayOffset: number; startMin: number; endMin: number }[] = []; 
    let s = absStart; 
    while (s < absEnd) { 
        const dayOffset = Math.floor(s / 1440); 
        const dayStart = dayOffset * 1440; 
        const chunkEnd = Math.min(absEnd, dayStart + 1440); 
        parts.push({ 
            dayOffset, 
            startMin: s - dayStart, 
            endMin: chunkEnd - dayStart, 
        }); 
        s = chunkEnd; 
    } 
    return parts; 
}; 
 
const rangeMatchesDisabled = (baseDow: number, absStart: number, absEnd: number) => { 
    if (!props.disabledTimeRanges.length) return false; 
    const parts = splitDayRange(absStart, absEnd); 
    return parts.some(p => { 
        const dow = (baseDow + p.dayOffset) % 7; 
        return props.disabledTimeRanges.some(r => { 
            if (r.daysOfWeek && !r.daysOfWeek.includes(dow)) return false; 
            const rs = parseHM(r.start); 
            const re = parseHM(r.end); 
            return p.startMin < re && p.endMin > rs; 
        }); 
    }); 
}; 
 
const isSlotDisabled = (date: Date, slotIdx: number) => { 
    if (isDayDisabled(date)) return true; 
    if (!props.disabledTimeRanges.length) return false; 
    const slotStartMin = props.hourStart * 60 + slotIdx * props.slotMinutes; 
    const slotEndMin = slotStartMin + props.slotMinutes; 
    return rangeMatchesDisabled(date.getDay(), slotStartMin, slotEndMin); 
}; 
 
const rangeHitsDisabled = (date: Date, startMinFromHourStart: number, endMinFromHourStart: number) => { 
    if (isDayDisabled(date)) return true; 
    if (!props.disabledTimeRanges.length) return false; 
    const absStart = props.hourStart * 60 + startMinFromHourStart; 
    const absEnd = props.hourStart * 60 + endMinFromHourStart; 
    return rangeMatchesDisabled(date.getDay(), absStart, absEnd); 
}; 
 
const rangeOverlapsEvent = (date: Date, startMs: number, endMs: number, ignoreId: CalendarEvent['id']) => { 
    return props.events.some(ev => { 
        if (ev.id === ignoreId) return false; 
        if (ev.allDay) return false; 
        if (!isSameDay(ev.start, date)) return false; 
        const es = ev.start.getTime(); 
        const ee = (ev.end ?? ev.start).getTime(); 
        return startMs < ee && endMs > es; 
    }); 
}; 
 
const isEventInteractive = (ev: CalendarEvent) => !props.readonly && !ev.readonly; 
 
const businessHoursList = computed<BusinessHours[]>(() => { 
    if (!props.businessHours) return []; 
    return Array.isArray(props.businessHours) ? props.businessHours : [props.businessHours]; 
}); 
 
const isBusinessHour = (date: Date, slotIdx: number) => { 
    if (!businessHoursList.value.length) return true; 
    const slotStartMin = props.hourStart * 60 + slotIdx * props.slotMinutes; 
    const slotEndMin = slotStartMin + props.slotMinutes; 
    const parts = splitDayRange(slotStartMin, slotEndMin); 
    const baseDow = date.getDay(); 
    return parts.some(p => { 
        const dow = (baseDow + p.dayOffset) % 7; 
        return businessHoursList.value.some(b => { 
            if (b.daysOfWeek && !b.daysOfWeek.includes(dow)) return false; 
            return p.startMin >= parseHM(b.start) && p.startMin < parseHM(b.end); 
        }); 
    }); 
}; 
 
const headerDotClass = (day: WeekDay, colIdx: number): string | null => { 
    if (isHighlightedDate(day.date)) return highlightDotClass.value; 
    if (isHighlightedWeekday(colIdx)) return 'bg-muted-foreground/40'; 
    return null; 
}; 
 
const { slotsPerHour, windowHours, totalSlots, windowMinutes, totalPixels, hourLabels, dayStartMs, dayEndMs } = useTimeGrid({ 
    hourStart: () => props.hourStart, 
    hourEnd: () => props.hourEnd, 
    slotMinutes: () => props.slotMinutes, 
    slotHeight: () => props.slotHeight, 
    format: () => props.format, 
}); 
 
const headerGridStyle = computed(() => ({ 
    gridTemplateColumns: '3.5rem repeat(7, minmax(0, 1fr))', 
})); 
 
interface TimedSeg { key: string; event: CalendarEvent; style: Record<string, string>; } 
 
const segmentsByDay = computed<TimedSeg[][]>(() => { 
    const result: TimedSeg[][] = Array.from({ length: 7 }, () => []); 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
 
    for (let i = 0; i < 7; i++) { 
        const day = days.value[i]; 
        const dStart = dayStartMs(day.date); 
        const dEnd = dayEndMs(day.date); 
 
        const dayEvents = props.events 
            .filter(ev => !ev.allDay) 
            .filter(ev => { 
                const es = ev.start.getTime(); 
                const ee = (ev.end ?? ev.start).getTime(); 
                if (ee <= dStart || es >= dEnd) return false; 
                return true; 
            }) 
            .sort((a, b) => a.start.getTime() - b.start.getTime()); 
 
        const clusters: CalendarEvent[][] = []; 
        for (const ev of dayEvents) { 
            const evStart = Math.max(ev.start.getTime(), dStart); 
            let placed = false; 
            for (const cluster of clusters) { 
                const clusterEnd = Math.max(...cluster.map(e => Math.min((e.end ?? e.start).getTime(), dEnd))); 
                if (evStart < clusterEnd) { cluster.push(ev); placed = true; break; } 
            } 
            if (!placed) clusters.push([ev]); 
        } 
 
        for (const cluster of clusters) { 
            const columns: CalendarEvent[][] = []; 
            for (const ev of cluster) { 
                const evStart = Math.max(ev.start.getTime(), dStart); 
                let placed = false; 
                for (const col of columns) { 
                    const last = col[col.length - 1]; 
                    const lastEnd = Math.min((last.end ?? last.start).getTime(), dEnd); 
                    if (lastEnd <= evStart) { col.push(ev); placed = true; break; } 
                } 
                if (!placed) columns.push([ev]); 
            } 
 
            const colCount = columns.length; 
            columns.forEach((col, colIdx) => { 
                for (const ev of col) { 
                    const startMs = Math.max(ev.start.getTime(), dStart); 
                    const endMsRaw = (ev.end ?? new Date(ev.start.getTime() + 30 * MS_MIN)).getTime(); 
                    const endMs = Math.min(endMsRaw, dEnd); 
                    const startMin = (startMs - dStart) / MS_MIN; 
                    const endMin = (endMs - dStart) / MS_MIN; 
                    const top = startMin * pxPerMin; 
                    const height = Math.max((endMin - startMin) * pxPerMin - 1, 16); 
                    const width = 100 / colCount; 
                    const left = colIdx * width; 
 
                    result[i].push({ 
                        key: `${ev.id}-${i}`, 
                        event: ev, 
                        style: { 
                            top: `${top}px`, 
                            height: `${height}px`, 
                            left: `calc(${left}% + 2px)`, 
                            width: `calc(${width}% - 4px)`, 
                        }, 
                    }); 
                } 
            }); 
        } 
    } 
    return result; 
}); 
 
interface AllDaySeg { key: string; event: CalendarEvent; startCol: number; span: number; lane: number; } 
 
const allDayList = computed(() => { 
    const ws = weekStart.value.getTime(); 
    const we = startOfDay(weekEnd.value).getTime(); 
    return props.events 
        .filter(ev => ev.allDay || (ev.end && startOfDay(ev.end).getTime() > startOfDay(ev.start).getTime())) 
        .filter(ev => { 
            const sd = startOfDay(ev.start).getTime(); 
            const ed = startOfDay(ev.end ?? ev.start).getTime(); 
            return ed >= ws && sd <= we; 
        }) 
        .sort((a, b) => { 
            const aLen = startOfDay(a.end ?? a.start).getTime() - startOfDay(a.start).getTime(); 
            const bLen = startOfDay(b.end ?? b.start).getTime() - startOfDay(b.start).getTime(); 
            if (bLen !== aLen) return bLen - aLen; 
            return a.start.getTime() - b.start.getTime(); 
        }); 
}); 
 
const allDayLayout = computed<{ segs: AllDaySeg[]; rows: number }>(() => { 
    const segs: AllDaySeg[] = []; 
    const lanesTaken: Set<number>[] = Array.from({ length: 7 }, () => new Set()); 
    const wStart = weekStart.value; 
    for (const ev of allDayList.value) { 
        const sd = startOfDay(ev.start); 
        const ed = startOfDay(ev.end ?? ev.start); 
        const segStart = sd < wStart ? wStart : sd; 
        const segEnd = ed > weekEnd.value ? weekEnd.value : ed; 
        const startCol = Math.round((segStart.getTime() - wStart.getTime()) / 86400000); 
        const span = Math.round((segEnd.getTime() - segStart.getTime()) / 86400000) + 1; 
        let lane = 0; 
        while (true) { 
            let ok = true; 
            for (let c = startCol; c < startCol + span; c++) if (lanesTaken[c].has(lane)) { ok = false; break; } 
            if (ok) break; 
            lane++; 
        } 
        for (let c = startCol; c < startCol + span; c++) lanesTaken[c].add(lane); 
        segs.push({ key: `ad-${ev.id}`, event: ev, startCol, span, lane }); 
    } 
    const rows = segs.length ? Math.max(...segs.map(s => s.lane)) + 1 : 0; 
    return { segs, rows }; 
}); 
 
const allDaySegments = computed(() => allDayLayout.value.segs); 
const allDayRows = computed(() => allDayLayout.value.rows); 
 
const nowOwnerKey = computed(() => { 
    const nt = now.value.getTime(); 
    for (const d of days.value) { 
        const s = dayStartMs(d.date); 
        const e = s + windowMinutes.value * MS_MIN; 
        if (nt >= s && nt < e) return d.date.toDateString(); 
    } 
    return null; 
}); 
const anyDayIsToday = computed(() => nowOwnerKey.value !== null); 
 
const currentTimeTop = computed(() => { 
    const key = nowOwnerKey.value; 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    if (!key) return 0; 
    const owner = days.value.find(d => d.date.toDateString() === key); 
    if (!owner) return 0; 
    const min = (now.value.getTime() - dayStartMs(owner.date)) / MS_MIN; 
    return Math.max(0, Math.min(min, windowMinutes.value)) * pxPerMin; 
}); 
 
const currentTimeLabel = computed(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return now.value.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: props.format === '12h' }); 
}); 
 
const nowPillState = ref<'hidden' | 'above' | 'below'>('hidden'); 
const updateNowPill = () => { 
    if (!props.showNowPill || !scrollRef.value) return; 
    if (!nowOwnerKey.value) { nowPillState.value = 'hidden'; return; } 
    const top = currentTimeTop.value; 
    const st = scrollRef.value.scrollTop; 
    const ch = scrollRef.value.clientHeight; 
    if (top < st) nowPillState.value = 'above'; 
    else if (top > st + ch) nowPillState.value = 'below'; 
    else nowPillState.value = 'hidden'; 
}; 
watch([now, currentDate], updateNowPill); 
 
const formatEventTime = (d: Date) => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: props.format === '12h' }); 
}; 
 
const scrollToCurrentTime = () => { 
    nextTick(() => { 
        if (!scrollRef.value) return; 
        const key = nowOwnerKey.value; 
        let top = 0; 
        if (key) { 
            const owner = days.value.find(d => d.date.toDateString() === key); 
            if (owner) { 
                const min = (now.value.getTime() - dayStartMs(owner.date)) / MS_MIN; 
                top = Math.max(0, Math.min(min, windowMinutes.value)) * (props.slotHeight / props.slotMinutes); 
            } 
        } 
        const target = Math.max(0, top - scrollRef.value.clientHeight / 3); 
        gsap.to(scrollRef.value, { scrollTop: target, duration: 0.55, ease: 'power3.inOut', onUpdate: updateNowPill, onComplete: updateNowPill }); 
    }); 
}; 
 
const animate = (dir: 1 | -1) => { 
    if (!scrollRef.value) return; 
    gsap.fromTo( 
        scrollRef.value, 
        { opacity: 0, x: 24 * dir }, 
        { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out' } 
    ); 
    nextTick(() => { 
        if (!scrollRef.value) return; 
        const els = scrollRef.value.querySelectorAll<HTMLElement>('[data-eid]'); 
        if (els.length) { 
            gsap.fromTo( 
                els, 
                { opacity: 0, y: 6, scale: 0.96 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out', stagger: { amount: 0.18, from: 'start' } } 
            ); 
        } 
    }); 
}; 
 
const findEventEls = (id: CalendarEvent['id']): HTMLElement[] => { 
    if (!rootRef.value) return []; 
    return Array.from(rootRef.value.querySelectorAll<HTMLElement>(`[data-eid="${id}"]`)); 
}; 
 
const dropGrowEvent = (id: CalendarEvent['id']) => { 
    nextTick(() => { 
        const els = findEventEls(id); 
        if (!els.length) return; 
        gsap.fromTo( 
            els, 
            { scale: 0.4, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(1.7)', transformOrigin: 'center center' } 
        ); 
    }); 
}; 
 
const stretchResize = (id: CalendarEvent['id'], oldHeightPx: number) => { 
    nextTick(() => { 
        const els = findEventEls(id); 
        if (!els.length) return; 
        els.forEach(el => { 
            const newH = el.offsetHeight; 
            if (newH <= 0 || oldHeightPx <= 0 || newH === oldHeightPx) return; 
            const fromScale = oldHeightPx / newH; 
            gsap.fromTo( 
                el, 
                { scaleY: fromScale }, 
                { scaleY: 1, duration: 0.32, ease: 'power3.out', transformOrigin: 'top center', overwrite: 'auto', clearProps: 'transform' } 
            ); 
        }); 
    }); 
}; 
 
const shiftWeek = (weeks: number) => { 
    const d = new Date(currentDate.value); 
    d.setDate(d.getDate() + weeks * 7); 
    currentDate.value = d; 
    emit('update:modelValue', d); 
    nextTick(() => { animate(weeks > 0 ? 1 : -1); updateNowPill(); }); 
}; 
 
const handlePrev = () => shiftWeek(-1); 
const handleNext = () => shiftWeek(1); 
const handlePrevYear = () => { 
    const d = new Date(currentDate.value); 
    d.setFullYear(d.getFullYear() - 1); 
    currentDate.value = d; 
    emit('update:modelValue', d); 
    nextTick(() => { animate(-1); updateNowPill(); }); 
}; 
const handleNextYear = () => { 
    const d = new Date(currentDate.value); 
    d.setFullYear(d.getFullYear() + 1); 
    currentDate.value = d; 
    emit('update:modelValue', d); 
    nextTick(() => { animate(1); updateNowPill(); }); 
}; 
const handleToday = () => { 
    const n = new Date(); 
    currentDate.value = n; 
    focusedDate.value = startOfDay(n); 
    emit('update:modelValue', n); 
    nextTick(() => { animate(1); scrollToCurrentTime(); }); 
}; 
 
const locale = computed(() => (props.locale === 'default' ? undefined : props.locale)); 
 
const monthOptions = computed(() => { 
    const base = new Date(2024, 0, 1); 
    return Array.from({ length: 12 }, (_, i) => { 
        const d = new Date(base); 
        d.setMonth(i); 
        return d.toLocaleString(locale.value, { month: 'long' }); 
    }); 
}); 
 
const yearOptions = computed(() => { 
    const min = props.minDate?.getFullYear() ?? currentDate.value.getFullYear() - 10; 
    const max = props.maxDate?.getFullYear() ?? currentDate.value.getFullYear() + 10; 
    const list: number[] = []; 
    for (let y = min; y <= max; y++) list.push(y); 
    return list; 
}); 
 
const firstWeekStartOfYear = (year: number) => { 
    const jan1 = new Date(year, 0, 1); 
    let offset = jan1.getDay() - props.firstDayOfWeek; 
    if (offset < 0) offset += 7; 
    return new Date(year, 0, 1 - offset); 
}; 
 
const weekOptions = computed(() => { 
    const yr = currentDate.value.getFullYear(); 
    const start = firstWeekStartOfYear(yr); 
    const list: { index: number; start: Date; end: Date }[] = []; 
    for (let i = 0; i < 53; i++) { 
        const s = new Date(start); 
        s.setDate(s.getDate() + i * 7); 
        const e = new Date(s); 
        e.setDate(e.getDate() + 6); 
        if (s.getFullYear() > yr) break; 
        if (e.getFullYear() < yr) continue; 
        list.push({ index: i + 1, start: s, end: e }); 
    } 
    return list; 
}); 
 
const selectedMonth = computed({ 
    get: () => currentDate.value.getMonth(), 
    set: (m: number) => { 
        const d = new Date(currentDate.value); 
        d.setDate(1); 
        d.setMonth(m); 
        const dir = m > currentDate.value.getMonth() ? 1 : -1; 
        currentDate.value = d; 
        emit('update:modelValue', d); 
        nextTick(() => { animate(dir); updateNowPill(); }); 
    }, 
}); 
 
const selectedYear = computed({ 
    get: () => currentDate.value.getFullYear(), 
    set: (y: number) => { 
        const dir = y > currentDate.value.getFullYear() ? 1 : -1; 
        const d = new Date(currentDate.value); 
        d.setFullYear(y); 
        currentDate.value = d; 
        emit('update:modelValue', d); 
        nextTick(() => { animate(dir); updateNowPill(); }); 
    }, 
}); 
 
const currentWeekIndex = computed(() => { 
    const start = firstWeekStartOfYear(currentDate.value.getFullYear()); 
    const diff = Math.floor((weekStart.value.getTime() - start.getTime()) / (7 * 86400000)); 
    return diff + 1; 
}); 
 
const selectedWeek = computed({ 
    get: () => currentWeekIndex.value, 
    set: (idx: number) => { 
        const dir = idx > currentWeekIndex.value ? 1 : -1; 
        const start = firstWeekStartOfYear(currentDate.value.getFullYear()); 
        const target = new Date(start); 
        target.setDate(target.getDate() + (idx - 1) * 7); 
        currentDate.value = target; 
        emit('update:modelValue', target); 
        nextTick(() => { animate(dir); updateNowPill(); }); 
    }, 
}); 
 
const clickTimer = ref<ReturnType<typeof setTimeout> | null>(null); 
const DOUBLE_CLICK_DELAY = 220; 
 
const handleDayHeaderClick = (day: WeekDay, e: MouseEvent) => { 
    if (isDayDisabled(day.date)) return; 
    currentDate.value = day.date; 
    focusedDate.value = startOfDay(day.date); 
    emit('update:modelValue', day.date); 
    emit('day-click', day.date, eventsForDay(day.date), e); 
}; 
 
const pxToSlotMin = (offsetY: number) => { 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const rawMin = offsetY / pxPerMin; 
    return Math.floor(rawMin / props.slotMinutes) * props.slotMinutes; 
}; 
 
const slotDateFromOffset = (day: WeekDay, offsetY: number): Date => { 
    const snapped = pxToSlotMin(offsetY); 
    const base = new Date(day.date); 
    base.setHours(props.hourStart, 0, 0, 0); 
    base.setMinutes(base.getMinutes() + snapped); 
    return base; 
}; 
 
const offsetFromEvent = (colEl: HTMLElement, clientY: number) => { 
    const rect = colEl.getBoundingClientRect(); 
    return Math.max(0, clientY - rect.top); 
}; 
 
const handleSlotClick = (day: WeekDay, e: MouseEvent) => { 
    if (rangeJustSelected.value) { rangeJustSelected.value = false; return; } 
    if (isDayDisabled(day.date)) return; 
    const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
    const dt = slotDateFromOffset(day, offsetY); 
    const slotIdx = Math.floor(((dt.getHours() - props.hourStart) * 60 + dt.getMinutes()) / props.slotMinutes); 
    if (isSlotDisabled(day.date, slotIdx)) return; 
    focusedDate.value = startOfDay(day.date); 
    if (clickTimer.value) clearTimeout(clickTimer.value); 
    clickTimer.value = setTimeout(() => { 
        emit('slot-click', dt, e); 
        clickTimer.value = null; 
    }, DOUBLE_CLICK_DELAY); 
}; 
 
const handleSlotDblClick = (day: WeekDay, e: MouseEvent) => { 
    if (props.readonly) return; 
    if (isDayDisabled(day.date)) return; 
    if (clickTimer.value) { clearTimeout(clickTimer.value); clickTimer.value = null; } 
    const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
    const dt = slotDateFromOffset(day, offsetY); 
    const slotIdx = Math.floor(((dt.getHours() - props.hourStart) * 60 + dt.getMinutes()) / props.slotMinutes); 
    if (isSlotDisabled(day.date, slotIdx)) return; 
    emit('create-event', dt, false, e); 
}; 
 
const handleAllDayCellClick = (day: WeekDay, _e: MouseEvent) => { 
    if (isDayDisabled(day.date)) return; 
    focusedDate.value = startOfDay(day.date); 
}; 
 
const handleAllDayCellDblClick = (day: WeekDay, e: MouseEvent) => { 
    if (props.readonly) return; 
    if (isDayDisabled(day.date)) return; 
    emit('create-event', startOfDay(day.date), true, e); 
}; 
 
const handleEventClick = (ev: CalendarEvent, e: MouseEvent) => { 
    if (resizeJustEnded.value) { resizeJustEnded.value = false; return; } 
    emit('event-click', ev, e); 
}; 
 
const eventsForDay = (date: Date): CalendarEvent[] => { 
    const d0 = startOfDay(date).getTime(); 
    return props.events 
        .filter(ev => { 
            const s = startOfDay(ev.start).getTime(); 
            const e = startOfDay(ev.end ?? ev.start).getTime(); 
            return d0 >= s && d0 <= e; 
        }) 
        .sort((a, b) => { 
            if (a.allDay && !b.allDay) return -1; 
            if (!a.allDay && b.allDay) return 1; 
            return a.start.getTime() - b.start.getTime(); 
        }); 
}; 
 
const draggingId = ref<string | number | null>(null); 
const dragOverKey = ref<string | null>(null); 
const allDayDragOver = ref<string | null>(null); 
 
const onDragStart = (ev: CalendarEvent, e: DragEvent, _mode: 'move') => { 
    if (!props.draggableEvents || !isEventInteractive(ev)) { e.preventDefault(); return; } 
    onEventLeave(); 
    draggingId.value = ev.id; 
    if (e.dataTransfer) { 
        e.dataTransfer.effectAllowed = 'move'; 
        e.dataTransfer.setData('text/plain', String(ev.id)); 
        const src = e.currentTarget as HTMLElement; 
        if (src && typeof e.dataTransfer.setDragImage === 'function') { 
            const rect = src.getBoundingClientRect(); 
            const scale = 0.7; 
            const w = Math.max(rect.width * scale, 90); 
            const h = Math.max(rect.height * scale, 26); 
            const wrap = document.createElement('div'); 
            wrap.style.cssText = [ 
                'position:absolute', 'top:-9999px', 'left:-9999px', 
                `width:${w}px`, `height:${h}px`, 
                'background:white', 'border-radius:4px', 'overflow:hidden', 
                'box-shadow:0 6px 18px rgba(0,0,0,0.22)', 
                'pointer-events:none', 'margin:0', 'transform:rotate(-1.5deg)', 
            ].join(';'); 
            const clone = src.cloneNode(true) as HTMLElement; 
            clone.style.position = 'static'; 
            clone.style.width = '100%'; 
            clone.style.height = '100%'; 
            clone.style.left = 'auto'; 
            clone.style.top = 'auto'; 
            clone.style.margin = '0'; 
            clone.style.opacity = '1'; 
            wrap.appendChild(clone); 
            document.body.appendChild(wrap); 
            e.dataTransfer.setDragImage(wrap, Math.round(w / 2), 14); 
            setTimeout(() => { wrap.parentNode?.removeChild(wrap); }, 0); 
        } 
    } 
}; 
const onDragEnd = () => { 
    draggingId.value = null; 
    dragOverKey.value = null; 
    allDayDragOver.value = null; 
    stopAutoScroll(); 
}; 
const onDragOver = (day: WeekDay, e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    const ev = props.events.find(x => x.id === draggingId.value); 
    let blocked = false; 
    if (!props.allowDropOnDisabled) { 
        if (isDayDisabled(day.date)) blocked = true; 
        else if (ev && !ev.allDay) { 
            const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
            const snappedMin = pxToSlotMin(offsetY); 
            const duration = ev.end ? ev.end.getTime() - ev.start.getTime() : 30 * MS_MIN; 
            const durationMin = duration / MS_MIN; 
            if (rangeHitsDisabled(day.date, snappedMin, snappedMin + durationMin)) blocked = true; 
        } 
    } 
    if (e.dataTransfer) e.dataTransfer.dropEffect = blocked ? 'none' : 'move'; 
    dragOverKey.value = blocked ? null : day.date.toDateString(); 
    handleAutoScroll(e.clientY); 
}; 
const onDrop = (day: WeekDay, e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    if (!props.allowDropOnDisabled && isDayDisabled(day.date)) { onDragEnd(); return; } 
    const ev = props.events.find(x => x.id === draggingId.value); 
    if (!ev) { onDragEnd(); return; } 
    const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
    const snappedMin = pxToSlotMin(offsetY); 
    const wasAllDay = !!ev.allDay; 
    const duration = !wasAllDay && ev.end ? ev.end.getTime() - ev.start.getTime() : 30 * MS_MIN; 
    const durationMin = duration / MS_MIN; 
    if (!props.allowDropOnDisabled && rangeHitsDisabled(day.date, snappedMin, snappedMin + durationMin)) { 
        onDragEnd(); 
        return; 
    } 
    const newStart = new Date(day.date); 
    newStart.setHours(props.hourStart, 0, 0, 0); 
    newStart.setMinutes(newStart.getMinutes() + snappedMin); 
    const newEnd = new Date(newStart.getTime() + duration); 
    if (props.preventOverlap && rangeOverlapsEvent(day.date, newStart.getTime(), newEnd.getTime(), ev.id)) { 
        onDragEnd(); 
        return; 
    } 
    const emitEv = wasAllDay ? { ...ev, allDay: false } as CalendarEvent : ev; 
    emit('event-drop', emitEv, newStart, newEnd); 
    dropGrowEvent(ev.id); 
    onDragEnd(); 
}; 
 
const onAllDayDragOver = (day: WeekDay, e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    const blocked = !props.allowDropOnDisabled && isDayDisabled(day.date); 
    if (e.dataTransfer) e.dataTransfer.dropEffect = blocked ? 'none' : 'move'; 
    allDayDragOver.value = blocked ? null : day.date.toDateString(); 
}; 
const onAllDayDrop = (day: WeekDay, _e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    if (!props.allowDropOnDisabled && isDayDisabled(day.date)) { onDragEnd(); return; } 
    const ev = props.events.find(x => x.id === draggingId.value); 
    if (!ev) { onDragEnd(); return; } 
    const wasAllDay = !!ev.allDay; 
    const duration = wasAllDay && ev.end ? startOfDay(ev.end).getTime() - startOfDay(ev.start).getTime() : 0; 
    const newStart = startOfDay(day.date); 
    const newEnd = new Date(newStart.getTime() + duration); 
    const emitEv = !wasAllDay ? { ...ev, allDay: true } as CalendarEvent : ev; 
    emit('event-drop', emitEv, newStart, wasAllDay ? newEnd : undefined); 
    dropGrowEvent(ev.id); 
    onDragEnd(); 
}; 
 
interface RangeSelect { colIdx: number; day: WeekDay; startMin: number; endMin: number; topPx: number; heightPx: number; } 
const rangeSelect = ref<RangeSelect | null>(null); 
const rangeJustSelected = ref(false); 
let rangePointerId: number | null = null; 
let rangeStartColEl: HTMLElement | null = null; 
 
const onColPointerDown = (day: WeekDay, dIdx: number, e: PointerEvent) => { 
    if (props.readonly) return; 
    if (!props.allowRangeSelection) return; 
    if (e.button !== 0) return; 
    if (isDayDisabled(day.date)) return; 
    const target = e.target as HTMLElement; 
    if (target.closest('[data-event]')) return; 
    rangeStartColEl = e.currentTarget as HTMLElement; 
    const offsetY = offsetFromEvent(rangeStartColEl, e.clientY); 
    const startMin = pxToSlotMin(offsetY); 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    rangeSelect.value = { 
        colIdx: dIdx, day, startMin, 
        endMin: startMin + props.slotMinutes, 
        topPx: startMin * pxPerMin, 
        heightPx: props.slotMinutes * pxPerMin, 
    }; 
    rangePointerId = e.pointerId; 
    rangeStartColEl.setPointerCapture(e.pointerId); 
    rangeStartColEl.addEventListener('pointermove', onRangePointerMove); 
    rangeStartColEl.addEventListener('pointerup', onRangePointerUp); 
    rangeStartColEl.addEventListener('pointercancel', onRangePointerUp); 
}; 
 
const onRangePointerMove = (e: PointerEvent) => { 
    if (!rangeSelect.value || !rangeStartColEl) return; 
    handleAutoScroll(e.clientY); 
    const offsetY = offsetFromEvent(rangeStartColEl, e.clientY); 
    const curMin = Math.max(0, Math.min(windowMinutes.value, pxToSlotMin(offsetY) + props.slotMinutes)); 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const s = Math.min(rangeSelect.value.startMin, curMin - props.slotMinutes); 
    const e2 = Math.max(rangeSelect.value.startMin + props.slotMinutes, curMin); 
    rangeSelect.value = { 
        ...rangeSelect.value, 
        topPx: s * pxPerMin, 
        heightPx: (e2 - s) * pxPerMin, 
        endMin: e2, 
        startMin: s, 
    }; 
}; 
 
const onRangePointerUp = (_e: PointerEvent) => { 
    if (!rangeSelect.value || !rangeStartColEl) return; 
    stopAutoScroll(); 
    const { day, startMin, endMin } = rangeSelect.value; 
    rangeStartColEl.removeEventListener('pointermove', onRangePointerMove); 
    rangeStartColEl.removeEventListener('pointerup', onRangePointerUp); 
    rangeStartColEl.removeEventListener('pointercancel', onRangePointerUp); 
    if (rangePointerId !== null) rangeStartColEl.releasePointerCapture?.(rangePointerId); 
    rangePointerId = null; 
    rangeStartColEl = null; 
 
    const durationMin = endMin - startMin; 
    if (durationMin > props.slotMinutes) { 
        const start = new Date(day.date); 
        start.setHours(props.hourStart, 0, 0, 0); 
        start.setMinutes(start.getMinutes() + startMin); 
        const end = new Date(start.getTime() + durationMin * MS_MIN); 
        rangeJustSelected.value = true; 
        emit('select-range', start, end); 
    } 
    rangeSelect.value = null; 
}; 
 
interface ResizePreview { colIdx: number; topPx: number; heightPx: number; } 
const resizingId = ref<string | number | null>(null); 
const resizingPreview = ref<ResizePreview | null>(null); 
const resizeJustEnded = ref(false); 
let resizeStartState: { event: CalendarEvent; startMin: number; minEndMin: number; colIdx: number; colEl: HTMLElement | null } | null = null; 
 
const onResizeStart = (ev: CalendarEvent, e: PointerEvent) => { 
    if (!props.resizableEvents || !isEventInteractive(ev)) return; 
    const colEl = (e.target as HTMLElement).closest('[data-col]') as HTMLElement | null 
        ?? (e.target as HTMLElement).closest('div.relative.border-l') as HTMLElement | null; 
    const dIdx = days.value.findIndex(d => isSameDay(d.date, ev.start)); 
    if (dIdx < 0) return; 
    const day = days.value[dIdx]; 
    const dStart = dayStartMs(day.date); 
    const startMin = Math.max(0, (ev.start.getTime() - dStart) / MS_MIN); 
    const minEndMin = startMin + props.slotMinutes; 
    resizingId.value = ev.id; 
    resizeStartState = { event: ev, startMin, minEndMin, colIdx: dIdx, colEl }; 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const curEndMin = ev.end ? (ev.end.getTime() - dStart) / MS_MIN : minEndMin; 
    resizingPreview.value = { 
        colIdx: dIdx, 
        topPx: startMin * pxPerMin, 
        heightPx: Math.max(curEndMin - startMin, props.slotMinutes) * pxPerMin, 
    }; 
    window.addEventListener('pointermove', onResizeMove); 
    window.addEventListener('pointerup', onResizeEnd); 
    window.addEventListener('pointercancel', onResizeEnd); 
}; 
 
const onResizeMove = (e: PointerEvent) => { 
    if (!resizeStartState || !resizingPreview.value) return; 
    handleAutoScroll(e.clientY); 
    const colEl = dayColRefs.value.get(days.value[resizeStartState.colIdx].date.toDateString()); 
    if (!colEl) return; 
    const rect = colEl.getBoundingClientRect(); 
    const offsetY = Math.max(0, Math.min(totalPixels.value, e.clientY - rect.top)); 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const rawMin = offsetY / pxPerMin; 
    const snapped = Math.ceil(rawMin / props.slotMinutes) * props.slotMinutes; 
    const endMin = Math.max(resizeStartState.minEndMin, Math.min(windowMinutes.value, snapped)); 
    resizingPreview.value = { 
        ...resizingPreview.value, 
        heightPx: (endMin - resizeStartState.startMin) * pxPerMin, 
    }; 
}; 
 
const onResizeEnd = () => { 
    window.removeEventListener('pointermove', onResizeMove); 
    window.removeEventListener('pointerup', onResizeEnd); 
    window.removeEventListener('pointercancel', onResizeEnd); 
    stopAutoScroll(); 
    if (resizeStartState && resizingPreview.value) { 
        const pxPerMin = props.slotHeight / props.slotMinutes; 
        const endMin = resizeStartState.startMin + resizingPreview.value.heightPx / pxPerMin; 
        const day = days.value[resizeStartState.colIdx]; 
        const newStart = new Date(resizeStartState.event.start); 
        const newEnd = new Date(day.date); 
        newEnd.setHours(props.hourStart, 0, 0, 0); 
        newEnd.setMinutes(newEnd.getMinutes() + endMin); 
        const hitsDisabled = !props.allowResizeOverDisabled && rangeHitsDisabled(day.date, resizeStartState.startMin, endMin); 
        const overlaps = props.preventOverlap && rangeOverlapsEvent(day.date, newStart.getTime(), newEnd.getTime(), resizeStartState.event.id); 
        if (!hitsDisabled && !overlaps) { 
            const ev = resizeStartState.event; 
            const oldEndMin = ev.end ? (ev.end.getTime() - dayStartMs(day.date)) / MS_MIN : resizeStartState.minEndMin; 
            const oldHeightPx = Math.max((oldEndMin - resizeStartState.startMin) * pxPerMin - 1, 16); 
            emit('event-resize', ev, newStart, newEnd); 
            stretchResize(ev.id, oldHeightPx); 
        } 
        resizeJustEnded.value = true; 
        setTimeout(() => { resizeJustEnded.value = false; }, 0); 
    } 
    resizingId.value = null; 
    resizingPreview.value = null; 
    resizeStartState = null; 
}; 
 
const handleKeydown = (e: KeyboardEvent) => { 
    if (!props.enableKeyboardNavigation) return; 
    const target = e.target as HTMLElement; 
    if (target.tagName === 'SELECT' || target.tagName === 'INPUT') return; 
    hasKeyboardFocus.value = true; 
    const d = new Date(focusedDate.value); 
    let handled = true; 
    if (e.key === 'ArrowLeft') d.setDate(d.getDate() - 1); 
    else if (e.key === 'ArrowRight') d.setDate(d.getDate() + 1); 
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') d.setDate(d.getDate() - 7); 
    else if (e.key === 'ArrowDown' || e.key === 'PageDown') d.setDate(d.getDate() + 7); 
    else if (e.key === 'Enter' || e.key === ' ') emit('day-click', focusedDate.value, eventsForDay(focusedDate.value), e as unknown as MouseEvent); 
    else if (e.key.toLowerCase() === 'c') { if (!props.readonly) emit('create-event', focusedDate.value, true, e); } 
    else if (e.key.toLowerCase() === 't') handleToday(); 
    else handled = false; 
 
    if (handled) { 
        e.preventDefault(); 
        if (e.key.startsWith('Arrow') || e.key === 'PageUp' || e.key === 'PageDown') { 
            const dir = d > focusedDate.value ? 1 : -1; 
            focusedDate.value = startOfDay(d); 
            if (d < weekStart.value || d > weekEnd.value) { 
                currentDate.value = d; 
                emit('update:modelValue', d); 
                nextTick(() => animate(dir)); 
            } 
            nextTick(() => focusGrid()); 
        } 
    } 
}; 
 
const focusGrid = () => { 
    nextTick(() => { 
        const el = dayColRefs.value.get(focusedDate.value.toDateString()); 
        if (el) el.focus?.(); 
        else rootRef.value?.focus(); 
    }); 
}; 
 
defineExpose({ focusGrid, scrollToCurrentTime }); 
 
const eventInlineStyle = (ev: CalendarEvent) => { 
    if (!ev.colorHex) return undefined; 
    return { 
        backgroundColor: hexToRgba(ev.colorHex, 0.12), 
        borderLeftColor: ev.colorHex, 
        color: ev.colorHex, 
    }; 
}; 
 
const { currentTimeSolidClass, currentTimeFadedClass } = useCurrentTimeLine(() => props.currentTimeColor); 
 
const { 
    todayTextClass, 
    todayBgClass, 
    rangeSelectClass, 
    focusRingColorClass, 
    highlightDotClass, 
    containerRadiusClass, 
    eventRadiusClass, 
    showEventAccent, 
    pillRadiusClass, 
    dayNameCaseClass, 
    resolvedColor, 
} = useCalendarTheme({ 
    color: () => props.color, 
    radius: () => props.radius, 
    dayNameCase: () => props.dayNameCase, 
}); 
</script>
