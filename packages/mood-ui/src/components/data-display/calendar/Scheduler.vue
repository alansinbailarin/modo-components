<template> 
    <div 
        ref="rootRef" 
        tabindex="-1" 
        :class="['relative flex flex-col bg-card overflow-hidden focus:outline-none isolate', containerRadiusClass, bordered ? 'border border-border' : '']" 
        :style="{ maxHeight: toCssLength(maxHeight) }"
        @keydown="handleKeydown" 
    > 
        <slot name="header" :label="headerLabel" :goToToday="handleToday" :prev="handlePrev" :next="handleNext" :prevYear="handlePrevYear" :nextYear="handleNextYear"> 
            <CalendarHeader 
                :label="headerLabel" 
                :weekdayLabel="weekdayLabel" 
                :showHeader="showHeader" 
                :showYearJump="showYearJump" 
                :showTodayButton="showTodayButton" 
                :showMonthYearSelects="showMonthYearSelects" 
                :monthOptions="monthOptions" 
                :yearOptions="yearOptions" 
                :dayOptions="dayOptions" 
                v-model:selectedDay="selectedDay" 
                v-model:selectedMonth="selectedMonth" 
                v-model:selectedYear="selectedYear" 
                :isPrevDisabled="isPrevDisabled" 
                :isNextDisabled="isNextDisabled" 
                prevLabel="Previous day" 
                nextLabel="Next day" 
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
            <!-- Inner container: width = hour-col + sum(minResourceWidth). Header + all-day + body live here so they share horizontal scroll. --> 
            <div 
                class="relative flex flex-col" 
                :style="{ minWidth: `calc(3.5rem + ${resources.length} * ${minResourceWidth}px)` }" 
            > 
                <!-- Resource header (sticky vertically). --> 
                <div 
                    v-if="showResourceHeader" 
                    class="flex border-b border-border bg-muted sticky top-0 z-40" 
                > 
                    <div class="w-14 shrink-0 sticky left-0 z-10 bg-muted border-l border-r border-border"></div> 
                    <div class="flex-1 flex min-w-0"> 
                        <div 
                            v-for="r in resources" 
                            :key="r.id" 
                            class="flex-1 min-w-0 border-l border-border px-3 py-2 flex items-center gap-2" 
                            :style="{ minWidth: `${minResourceWidth}px`, height: `${resourceHeaderHeight}px` }" 
                        > 
                            <slot name="resource-header" :resource="r"> 
                                <Avatar 
                                    :src="r.avatar" 
                                    :initials="resourceInitials(r.title)" 
                                    size="small" 
                                    :color="(r.color && !r.colorHex ? resourceAvatarColor(r) : 'default')" 
                                    :style="r.colorHex && !r.avatar ? { backgroundColor: r.colorHex, color: '#fff' } : undefined" 
                                /> 
                                <div class="flex flex-col min-w-0 flex-1"> 
                                    <span class="text-sm font-semibold text-foreground truncate leading-tight">{{ r.title }}</span> 
                                    <span v-if="r.subtitle" class="text-[11px] text-muted-foreground truncate leading-tight">{{ r.subtitle }}</span> 
                                </div> 
                            </slot> 
                        </div> 
                    </div> 
                </div> 
 
                <!-- All-day row (sticky vertically below the resource header). --> 
                <div 
                    v-if="showAllDayRow && maxAllDayRows > 0" 
                    class="flex border-b border-border bg-card sticky z-30" 
                    :style="{ top: showResourceHeader ? `${resourceHeaderHeight}px` : '0' }" 
                > 
                    <div class="w-14 shrink-0 flex items-start justify-end pr-2 pt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider sticky left-0 z-20 bg-card border-l border-r border-border"> 
                        all-day 
                    </div> 
                    <div class="flex-1 flex min-w-0"> 
                        <div 
                            v-for="r in resources" 
                            :key="`ad-${r.id}`" 
                            class="relative flex-1 min-w-0 border-l border-border" 
                            :style="[ 
                                { minWidth: `${minResourceWidth}px`, height: `${maxAllDayRows * 22 + 4}px` }, 
                                isResourceDisabled(r) ? disabledStripePattern : undefined, 
                            ]" 
                            @click="handleAllDayCellClick(r, $event)" 
                            @dblclick="handleAllDayCellDblClick(r, $event)" 
                            @dragover.prevent="onAllDayDragOver(r, $event)" 
                            @drop.prevent="onAllDayDrop(r, $event)" 
                            :class="[ 
                                'transition-colors', 
                                isResourceDisabled(r) ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted/60', 
                                allDayDragOverResourceId === r.id ? 'bg-muted' : '', 
                            ]" 
                        > 
                            <div 
                                v-for="seg in allDaySegmentsByResource.get(r.id) ?? []" 
                                :key="seg.key" 
                                :data-eid="seg.event.id" 
                                :data-rid="r.id" 
                                :draggable="draggableEvents && isEventInteractive(seg.event)" 
                                @dragstart="onDragStart(seg.event, $event)" 
                                @dragend="onDragEnd" 
                                @click.stop="handleEventClick(seg.event, $event)" 
                                @mouseenter="onEventEnter(seg.event, true, $event)" 
                                @mousemove="onEventMove" 
                                @mouseleave="onEventLeave" 
                                :style="[ 
                                    { 
                                        left: '2px', 
                                        right: '2px', 
                                        top: `${seg.lane * 22 + 2}px`, 
                                        height: '20px', 
                                    }, 
                                    eventInlineStyle(seg.event, r), 
                                ]" 
                                :class="[
                                    'absolute z-10 truncate text-xs px-1.5 flex items-center cursor-pointer transition-all hover:opacity-80 select-none',
                                    eventRadiusClass,
                                    draggableEvents ? 'cursor-grab active:cursor-grabbing touch-none' : '',
                                    seg.event.colorHex || (useResourceColor && r.colorHex) ? '' : eventColorClass(resolveEventColor(seg.event, r), showEventAccent),
                                    draggingId === seg.event.id ? 'opacity-70 scale-95' : '',
                                ]" 
                            > 
                                <slot name="event" :event="seg.event" :resource="r" :allDay="true"> 
                                    <span class="truncate font-medium">{{ seg.event.title }}</span> 
                                </slot> 
                            </div> 
                        </div> 
                    </div> 
                </div> 
 
                <!-- Time-grid body. --> 
                <div class="flex"> 
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
                            v-if="showCurrentTime && showCurrentTimeLabel && isTodayInView" 
                            :class="['absolute right-1 -translate-y-1/2 px-1 py-0.5 text-[10px] font-semibold text-white leading-none z-30 pointer-events-none', eventRadiusClass, currentTimeSolidClass]" 
                            :style="{ top: `${currentTimeTop}px` }" 
                        >{{ currentTimeLabel }}</span> 
                        <span 
                            v-else-if="showCurrentTime && !showCurrentTimeLabel && isTodayInView" 
                            :class="['absolute right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-30 pointer-events-none', currentTimeSolidClass]" 
                            :style="{ top: `${currentTimeTop}px` }" 
                        ></span> 
                    </div> 
 
                    <div class="flex-1 flex min-w-0 relative"> 
                    <div 
                        v-for="r in resources" 
                        :key="`col-${r.id}`" 
                        :ref="(el: unknown) => setColRef(r.id, el as HTMLElement | null)" 
                        class="relative flex-1 min-w-0 border-l border-border" 
                        :style="{ minWidth: `${minResourceWidth}px` }" 
                        @pointerdown="onColPointerDown(r, $event)" 
                        @click="handleSlotClick(r, $event)" 
                        @dblclick="handleSlotDblClick(r, $event)" 
                        @dragover.prevent="onDragOver(r, $event)" 
                        @drop.prevent="onDrop(r, $event)" 
                    > 
                        <div 
                            v-for="(_, idx) in totalSlots" 
                            :key="idx" 
                            :style="[ 
                                { height: `${slotHeight}px` }, 
                                isSlotDisabled(r, idx) 
                                    ? disabledStripePattern 
                                    : !isBusinessHourSlot(idx) 
                                        ? { backgroundColor: 'rgba(0,0,0,0.015)' } 
                                        : undefined, 
                            ]" 
                            :class="[ 
                                'border-t', 
                                idx === 0 ? 'border-transparent' : idx % slotsPerHour === 0 ? 'border-border' : 'border-dashed border-border/70', 
                                isSlotDisabled(r, idx) ? 'cursor-not-allowed' : '', 
                            ]" 
                        ></div> 
 
                        <div 
                            v-if="isResourceDisabled(r)" 
                            class="absolute inset-0 pointer-events-none" 
                            :style="disabledStripePattern" 
                        ></div> 
 
                        <div 
                            v-for="seg in timedSegmentsByResource.get(r.id) ?? []" 
                            :key="seg.key" 
                            :data-eid="seg.event.id" 
                            :data-rid="r.id" 
                            :draggable="draggableEvents && resizingId !== seg.event.id && isEventInteractive(seg.event)" 
                            @dragstart.stop="onDragStart(seg.event, $event)" 
                            @dragend="onDragEnd" 
                            @click.stop="handleEventClick(seg.event, $event)" 
                            @pointerdown.stop 
                            @mouseenter="onEventEnter(seg.event, false, $event)" 
                            @mousemove="onEventMove" 
                            @mouseleave="onEventLeave" 
                            :style="[seg.style, eventInlineStyle(seg.event, r)]" 
                            :class="[
                                'absolute z-10 overflow-hidden transition-all hover:opacity-90 select-none flex flex-col',
                                eventRadiusClass,
                                isEventInteractive(seg.event) ? 'cursor-pointer' : 'cursor-default',
                                draggableEvents && isEventInteractive(seg.event) ? 'cursor-grab active:cursor-grabbing touch-none' : '',
                                seg.event.colorHex || (useResourceColor && r.colorHex) ? (showEventAccent ? 'border-l-2' : '') : eventColorClass(resolveEventColor(seg.event, r), showEventAccent),
                                draggingId === seg.event.id ? 'opacity-70 scale-95' : '',
                            ]" 
                        > 
                            <slot name="event" :event="seg.event" :resource="r" :allDay="false"> 
                                <div class="px-2 py-1 flex-1 min-h-0"> 
                                    <div class="text-[10px] font-semibold leading-tight opacity-80">{{ formatEventTime(seg.event.start) }}<template v-if="seg.event.end"> – {{ formatEventTime(seg.event.end) }}</template></div> 
                                    <div class="text-xs font-medium truncate leading-tight">{{ seg.event.title }}</div> 
                                    <div v-if="seg.event.description" class="text-[11px] opacity-70 truncate leading-tight mt-0.5">{{ seg.event.description }}</div> 
                                </div> 
                            </slot> 
                            <div 
                                v-if="resizableEvents && isEventInteractive(seg.event)" 
                                draggable="false" 
                                @mousedown.stop.prevent 
                                @dragstart.stop.prevent 
                                @pointerdown.stop="onResizeStart(seg.event, r, $event)" 
                                class="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-black/10 touch-none" 
                            ></div> 
                        </div> 
 
                        <div 
                            v-if="dragOverResourceId === r.id" 
                            class="absolute inset-0 pointer-events-none z-0 bg-muted/60" 
                        ></div> 
 
                        <div 
                            v-if="rangeSelect && rangeSelect.resourceId === r.id" 
                            :class="['absolute left-1 right-1 pointer-events-none z-20 border border-dashed', eventRadiusClass, rangeSelectClass]" 
                            :style="{ top: `${rangeSelect.topPx}px`, height: `${rangeSelect.heightPx}px` }" 
                        ></div> 
 
                        <div 
                            v-if="resizingPreview && resizingPreview.resourceId === r.id" 
                            :class="['absolute left-1 right-1 pointer-events-none z-20 border border-dashed border-muted-foreground bg-foreground/5', eventRadiusClass]" 
                            :style="{ top: `${resizingPreview.topPx}px`, height: `${resizingPreview.heightPx}px` }" 
                        ></div> 
                    </div> 
 
                    <div 
                        v-if="showCurrentTime && isTodayInView" 
                        class="absolute left-0 right-0 h-px pointer-events-none z-20" 
                        :class="currentTimeSolidClass" 
                        :style="{ top: `${currentTimeTop}px` }" 
                    ></div> 
                </div> 
                </div> 
            </div> 
        </div> 
 
        <button 
            v-if="showNowPill && isTodayInView" 
            type="button" 
            @click="scrollToCurrentTime" 
            :class="['absolute bottom-4 right-6 z-40 px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium shadow-lg bg-card border border-border hover:bg-muted transition-all cursor-pointer', pillRadiusClass]" 
        > 
            <span class="w-1.5 h-1.5" :class="[pillRadiusClass, currentTimeSolidClass]"></span> 
            <span class="text-foreground/80">Now</span> 
        </button> 
 
        <CalendarEventTooltip :state="hoverState" :style="tooltipStyle" :formatTime="formatEventTime"> 
            <template #default="{ event, allDay }"> 
                <slot name="event-tooltip" :event="event" :allDay="allDay" /> 
            </template> 
        </CalendarEventTooltip> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'; 
import gsap from 'gsap'; 
import Avatar from '../avatar/Avatar.vue'; 
import { isSameDay, startOfDay } from '../../../composables/useCalendar'; 
import { useCalendarTheme } from '../../../composables/useCalendarTheme'; 
import { useEventHover } from '../../../composables/useEventHover'; 
import { useAutoScroll } from '../../../composables/useAutoScroll'; 
import { useCurrentTimeLine } from '../../../composables/useCurrentTimeLine'; 
import { useTimeGrid, MS_MIN } from '../../../composables/useTimeGrid'; 
import { eventColorClass, hexToRgba } from '../../../composables/eventColors'; 
import CalendarEventTooltip from './CalendarEventTooltip.vue'; 
import CalendarHeader from './CalendarHeader.vue'; 
import type { Scheduler, SchedulerResource, SchedulerEvent } from '../../../interfaces/data-display/calendar/Scheduler.interface'; 
import type { BusinessHours } from '../../../interfaces/data-display/calendar/WeekView.interface'; 
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface'; 
 
import { toCssLength } from '../../../utils/cssLength';

const props = withDefaults(defineProps<Scheduler>(), { 
    modelValue: () => new Date(), 
    events: () => [], 
    resourceIdField: 'resourceId', 
    locale: 'default', 
    color: 'default', 
    bordered: true, 
    dayNameFormat: 'long', 
    dayNameCase: 'upper', 
    highlightedDates: () => [], 
    disabledDates: () => [], 
    disabledWeekdays: () => [], 
    disabledTimeRanges: () => [], 
    showHeader: true, 
    showTodayButton: true, 
    showYearJump: false, 
    showMonthYearSelects: false, 
    showResourceHeader: true, 
    resourceHeaderHeight: 52, 
    minResourceWidth: 140, 
    hourStart: 0, 
    hourEnd: 24, 
    slotMinutes: 30, 
    slotHeight: 28, 
    format: '24h', 
    showCurrentTime: true, 
    showCurrentTimeLabel: true, 
    currentTimeColor: 'red', 
    currentTimeUpdateInterval: 60000, 
    draggableEvents: true, 
    resizableEvents: true, 
    allowRangeSelection: true, 
    allowCrossResourceDrag: true, 
    allowDropOnDisabled: false, 
    allowResizeOverDisabled: false, 
    readonly: false, 
    preventOverlap: false, 
    autoScrollOnDrag: true, 
    showAllDayRow: true, 
    enableKeyboardNavigation: true, 
    showNowPill: true, 
    useResourceColor: true, 
}); 
 
const emit = defineEmits<{ 
    'update:modelValue': [date: Date]; 
    'event-click': [event: SchedulerEvent, nativeEvent: MouseEvent]; 
    'slot-click': [date: Date, resource: SchedulerResource, nativeEvent: MouseEvent]; 
    'create-event': [date: Date, resource: SchedulerResource, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent]; 
    'event-drop': [event: SchedulerEvent, newStart: Date, newEnd: Date | undefined, newResource: SchedulerResource]; 
    'event-resize': [event: SchedulerEvent, newStart: Date, newEnd: Date]; 
    'select-range': [start: Date, end: Date, resource: SchedulerResource]; 
}>(); 
 
const currentDate = ref(startOfDay(new Date(props.modelValue))); 
watch(() => props.modelValue, (v) => { if (v) currentDate.value = startOfDay(new Date(v)); }); 
 
const rootRef = ref<HTMLElement | null>(null); 
const scrollRef = ref<HTMLElement | null>(null); 
const colRefs = new Map<string | number, HTMLElement>(); 
const setColRef = (id: string | number, el: HTMLElement | null) => { 
    if (el) colRefs.set(id, el); 
    else colRefs.delete(id); 
}; 
const now = ref(new Date()); 
const scrollbarWidth = ref(0); 
let tickInterval: ReturnType<typeof setInterval> | null = null; 
 
const { hoverState, onEventEnter, onEventMove, onEventLeave, tooltipStyle } = useEventHover<SchedulerEvent>(); 
 
const disabledStripePattern = { 
    backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 5px, rgba(0,0,0,0.035) 5px 6px)', 
}; 
 
const { handleAutoScroll, stopAutoScroll } = useAutoScroll({ 
    scrollRef, 
    enabled: () => props.autoScrollOnDrag, 
}); 
 
 
onMounted(() => { 
    if (props.currentTimeUpdateInterval > 0) { 
        tickInterval = setInterval(() => { now.value = new Date(); }, props.currentTimeUpdateInterval); 
    } 
    if (scrollRef.value) { 
        scrollbarWidth.value = scrollRef.value.offsetWidth - scrollRef.value.clientWidth; 
    } 
    scrollToCurrentTime(); 
    nextTick(() => { 
        if (!rootRef.value) return; 
        const els = rootRef.value.querySelectorAll<HTMLElement>('[data-eid]'); 
        if (els.length) { 
            gsap.fromTo( 
                els, 
                { opacity: 0, y: 6, scale: 0.96 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out', stagger: { amount: 0.2 } } 
            ); 
        } 
    }); 
}); 
onUnmounted(() => { if (tickInterval) clearInterval(tickInterval); }); 
 
const headerLabel = computed(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return currentDate.value.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' }); 
}); 
const weekdayLabel = computed(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return currentDate.value.toLocaleDateString(locale, { weekday: props.dayNameFormat }); 
}); 
 
const isPrevDisabled = computed(() => { 
    if (!props.minDate) return false; 
    const prev = new Date(currentDate.value); 
    prev.setDate(prev.getDate() - 1); 
    return prev < startOfDay(props.minDate); 
}); 
const isNextDisabled = computed(() => { 
    if (!props.maxDate) return false; 
    const next = new Date(currentDate.value); 
    next.setDate(next.getDate() + 1); 
    return next > startOfDay(props.maxDate); 
}); 
 
const isDisabledDate = (d: Date) => props.disabledDates.some(x => isSameDay(x, d)); 
const isDisabledWeekday = (d: Date) => props.disabledWeekdays.includes(d.getDay()); 
const dayIsDisabled = computed(() => { 
    const d = currentDate.value; 
    if (props.minDate && startOfDay(d) < startOfDay(props.minDate)) return true; 
    if (props.maxDate && startOfDay(d) > startOfDay(props.maxDate)) return true; 
    return isDisabledDate(d) || isDisabledWeekday(d); 
}); 
const isResourceDisabled = (r: SchedulerResource) => dayIsDisabled.value || !!r.disabled; 
 
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
        parts.push({ dayOffset, startMin: s - dayStart, endMin: chunkEnd - dayStart }); 
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
 
const isSlotDisabled = (r: SchedulerResource, slotIdx: number) => { 
    if (isResourceDisabled(r)) return true; 
    if (!props.disabledTimeRanges.length) return false; 
    const slotStartMin = props.hourStart * 60 + slotIdx * props.slotMinutes; 
    const slotEndMin = slotStartMin + props.slotMinutes; 
    return rangeMatchesDisabled(currentDate.value.getDay(), slotStartMin, slotEndMin); 
}; 
 
const rangeHitsDisabled = (r: SchedulerResource, startMinFromHourStart: number, endMinFromHourStart: number) => { 
    if (isResourceDisabled(r)) return true; 
    if (!props.disabledTimeRanges.length) return false; 
    const absStart = props.hourStart * 60 + startMinFromHourStart; 
    const absEnd = props.hourStart * 60 + endMinFromHourStart; 
    return rangeMatchesDisabled(currentDate.value.getDay(), absStart, absEnd); 
}; 
 
const eventResourceId = (ev: SchedulerEvent): string | number | undefined => { 
    const v = (ev as unknown as Record<string, unknown>)[props.resourceIdField]; 
    if (v === undefined || v === null) return undefined; 
    return v as string | number; 
}; 
 
const rangeOverlapsEvent = (resourceId: string | number, startMs: number, endMs: number, ignoreId: CalendarEvent['id']) => { 
    return props.events.some(ev => { 
        if (ev.id === ignoreId) return false; 
        if (ev.allDay) return false; 
        if (eventResourceId(ev) !== resourceId) return false; 
        if (!isSameDay(ev.start, currentDate.value)) return false; 
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
 
const isBusinessHourSlot = (slotIdx: number) => { 
    if (!businessHoursList.value.length) return true; 
    const slotStartMin = props.hourStart * 60 + slotIdx * props.slotMinutes; 
    const slotEndMin = slotStartMin + props.slotMinutes; 
    const parts = splitDayRange(slotStartMin, slotEndMin); 
    const baseDow = currentDate.value.getDay(); 
    return parts.some(p => { 
        const dow = (baseDow + p.dayOffset) % 7; 
        return businessHoursList.value.some(b => { 
            if (b.daysOfWeek && !b.daysOfWeek.includes(dow)) return false; 
            return p.startMin >= parseHM(b.start) && p.startMin < parseHM(b.end); 
        }); 
    }); 
}; 
 
const { 
    slotsPerHour, 
    windowHours, 
    totalSlots, 
    windowMinutes, 
    totalPixels, 
    hourLabels, 
    dayStartMs: getDayStartMs, 
    dayEndMs: getDayEndMs, 
} = useTimeGrid({ 
    hourStart: () => props.hourStart, 
    hourEnd: () => props.hourEnd, 
    slotMinutes: () => props.slotMinutes, 
    slotHeight: () => props.slotHeight, 
    format: () => props.format, 
}); 
 
const dayStartMs = computed(() => getDayStartMs(currentDate.value)); 
const dayEndMs = computed(() => getDayEndMs(currentDate.value)); 
 
interface TimedSeg { key: string; event: SchedulerEvent; style: Record<string, string>; } 
 
const timedSegmentsByResource = computed<Map<string | number, TimedSeg[]>>(() => { 
    const map = new Map<string | number, TimedSeg[]>(); 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const dStart = dayStartMs.value; 
    const dEnd = dayEndMs.value; 
 
    for (const r of props.resources) { 
        const dayEvents = props.events 
            .filter(ev => !ev.allDay && eventResourceId(ev) === r.id) 
            .filter(ev => { 
                const es = ev.start.getTime(); 
                const ee = (ev.end ?? ev.start).getTime(); 
                return !(ee <= dStart || es >= dEnd); 
            }) 
            .sort((a, b) => a.start.getTime() - b.start.getTime()); 
 
        const clusters: SchedulerEvent[][] = []; 
        for (const ev of dayEvents) { 
            const evStart = Math.max(ev.start.getTime(), dStart); 
            let placed = false; 
            for (const cluster of clusters) { 
                const clusterEnd = Math.max(...cluster.map(e => Math.min((e.end ?? e.start).getTime(), dEnd))); 
                if (evStart < clusterEnd) { cluster.push(ev); placed = true; break; } 
            } 
            if (!placed) clusters.push([ev]); 
        } 
 
        const segs: TimedSeg[] = []; 
        for (const cluster of clusters) { 
            const columns: SchedulerEvent[][] = []; 
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
                    const height = Math.max((endMin - startMin) * pxPerMin - 1, 18); 
                    const width = 100 / colCount; 
                    const left = colIdx * width; 
                    segs.push({ 
                        key: String(ev.id), 
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
        map.set(r.id, segs); 
    } 
    return map; 
}); 
 
interface AllDaySeg { key: string; event: SchedulerEvent; lane: number; } 
const allDaySegmentsByResource = computed<Map<string | number, AllDaySeg[]>>(() => { 
    const map = new Map<string | number, AllDaySeg[]>(); 
    const target = startOfDay(currentDate.value).getTime(); 
    for (const r of props.resources) { 
        const list = props.events 
            .filter(ev => eventResourceId(ev) === r.id) 
            .filter(ev => ev.allDay || (ev.end && startOfDay(ev.end).getTime() > startOfDay(ev.start).getTime())) 
            .filter(ev => { 
                const sd = startOfDay(ev.start).getTime(); 
                const ed = startOfDay(ev.end ?? ev.start).getTime(); 
                return target >= sd && target <= ed; 
            }) 
            .sort((a, b) => a.start.getTime() - b.start.getTime()); 
        map.set(r.id, list.map((ev, i) => ({ key: `ad-${ev.id}`, event: ev, lane: i }))); 
    } 
    return map; 
}); 
const maxAllDayRows = computed(() => { 
    let max = 0; 
    for (const list of allDaySegmentsByResource.value.values()) max = Math.max(max, list.length); 
    return max; 
}); 
 
const isTodayInView = computed(() => { 
    const nt = now.value.getTime(); 
    return nt >= dayStartMs.value && nt < dayEndMs.value; 
}); 
 
const currentTimeTop = computed(() => { 
    if (!isTodayInView.value) return 0; 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const min = (now.value.getTime() - dayStartMs.value) / MS_MIN; 
    return Math.max(0, Math.min(min, windowMinutes.value)) * pxPerMin; 
}); 
 
const currentTimeLabel = computed(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return now.value.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: props.format === '12h' }); 
}); 
 
const formatEventTime = (d: Date) => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: props.format === '12h' }); 
}; 
 
const scrollToCurrentTime = () => { 
    nextTick(() => { 
        if (!scrollRef.value) return; 
        let top = 0; 
        if (isTodayInView.value) { 
            const pxPerMin = props.slotHeight / props.slotMinutes; 
            const min = (now.value.getTime() - dayStartMs.value) / MS_MIN; 
            top = Math.max(0, Math.min(min, windowMinutes.value)) * pxPerMin; 
        } 
        const target = Math.max(0, top - scrollRef.value.clientHeight / 3); 
        gsap.to(scrollRef.value, { scrollTop: target, duration: 0.55, ease: 'power3.inOut' }); 
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
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out', stagger: { amount: 0.18 } } 
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
            { scale: 0.9, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.32, ease: 'power3.out', transformOrigin: 'center center', overwrite: 'auto' } 
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
 
const shiftDay = (days: number) => { 
    const d = new Date(currentDate.value); 
    d.setDate(d.getDate() + days); 
    currentDate.value = d; 
    emit('update:modelValue', d); 
    nextTick(() => animate(days > 0 ? 1 : -1)); 
}; 
const handlePrev = () => shiftDay(-1); 
const handleNext = () => shiftDay(1); 
const handlePrevYear = () => { 
    const d = new Date(currentDate.value); 
    d.setFullYear(d.getFullYear() - 1); 
    currentDate.value = d; 
    emit('update:modelValue', d); 
    nextTick(() => animate(-1)); 
}; 
const handleNextYear = () => { 
    const d = new Date(currentDate.value); 
    d.setFullYear(d.getFullYear() + 1); 
    currentDate.value = d; 
    emit('update:modelValue', d); 
    nextTick(() => animate(1)); 
}; 
const handleToday = () => { 
    const n = new Date(); 
    currentDate.value = startOfDay(n); 
    emit('update:modelValue', n); 
    nextTick(() => { animate(1); scrollToCurrentTime(); }); 
}; 
 
const clickTimer = ref<ReturnType<typeof setTimeout> | null>(null); 
const DOUBLE_CLICK_DELAY = 220; 
 
const pxToSlotMin = (offsetY: number) => { 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const rawMin = offsetY / pxPerMin; 
    return Math.floor(rawMin / props.slotMinutes) * props.slotMinutes; 
}; 
const slotDateFromOffset = (offsetY: number): Date => { 
    const snapped = pxToSlotMin(offsetY); 
    const base = new Date(currentDate.value); 
    base.setHours(props.hourStart, 0, 0, 0); 
    base.setMinutes(base.getMinutes() + snapped); 
    return base; 
}; 
const offsetFromEvent = (el: HTMLElement, clientY: number) => { 
    const rect = el.getBoundingClientRect(); 
    return Math.max(0, clientY - rect.top); 
}; 
 
const handleSlotClick = (r: SchedulerResource, e: MouseEvent) => { 
    if (rangeJustSelected.value) { rangeJustSelected.value = false; return; } 
    if (isResourceDisabled(r)) return; 
    const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
    const dt = slotDateFromOffset(offsetY); 
    const slotIdx = Math.floor(((dt.getHours() - props.hourStart) * 60 + dt.getMinutes()) / props.slotMinutes); 
    if (isSlotDisabled(r, slotIdx)) return; 
    if (clickTimer.value) clearTimeout(clickTimer.value); 
    clickTimer.value = setTimeout(() => { 
        emit('slot-click', dt, r, e); 
        clickTimer.value = null; 
    }, DOUBLE_CLICK_DELAY); 
}; 
const handleSlotDblClick = (r: SchedulerResource, e: MouseEvent) => { 
    if (props.readonly) return; 
    if (isResourceDisabled(r)) return; 
    if (clickTimer.value) { clearTimeout(clickTimer.value); clickTimer.value = null; } 
    const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
    const dt = slotDateFromOffset(offsetY); 
    const slotIdx = Math.floor(((dt.getHours() - props.hourStart) * 60 + dt.getMinutes()) / props.slotMinutes); 
    if (isSlotDisabled(r, slotIdx)) return; 
    emit('create-event', dt, r, false, e); 
}; 
 
const handleAllDayCellClick = (_r: SchedulerResource, _e: MouseEvent) => {}; 
const handleAllDayCellDblClick = (r: SchedulerResource, e: MouseEvent) => { 
    if (props.readonly) return; 
    if (isResourceDisabled(r)) return; 
    emit('create-event', startOfDay(currentDate.value), r, true, e); 
}; 
 
const resizeJustEnded = ref(false); 
const handleEventClick = (ev: SchedulerEvent, e: MouseEvent) => { 
    if (resizeJustEnded.value) { resizeJustEnded.value = false; return; } 
    emit('event-click', ev, e); 
}; 
 
const draggingId = ref<string | number | null>(null); 
const dragOverResourceId = ref<string | number | null>(null); 
const allDayDragOverResourceId = ref<string | number | null>(null); 
 
const onDragStart = (ev: SchedulerEvent, e: DragEvent) => { 
    if (!props.draggableEvents || !isEventInteractive(ev)) { e.preventDefault(); return; } 
    onEventLeave(); 
    draggingId.value = ev.id; 
    if (e.dataTransfer) { 
        e.dataTransfer.effectAllowed = 'move'; 
        e.dataTransfer.setData('text/plain', String(ev.id)); 
        const src = e.currentTarget as HTMLElement; 
        if (src && typeof e.dataTransfer.setDragImage === 'function') { 
            const rect = src.getBoundingClientRect(); 
            const w = Math.max(rect.width * 0.7, 90); 
            const h = Math.max(rect.height * 0.7, 26); 
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
    dragOverResourceId.value = null; 
    allDayDragOverResourceId.value = null; 
    stopAutoScroll(); 
}; 
 
const canDropOnResource = (r: SchedulerResource, ev: SchedulerEvent | undefined) => { 
    if (!ev) return false; 
    const origin = eventResourceId(ev); 
    if (origin !== r.id && !props.allowCrossResourceDrag) return false; 
    return true; 
}; 
 
const onDragOver = (r: SchedulerResource, e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    const ev = props.events.find(x => x.id === draggingId.value); 
    let blocked = false; 
    if (!canDropOnResource(r, ev)) blocked = true; 
    if (!blocked && !props.allowDropOnDisabled) { 
        if (isResourceDisabled(r)) blocked = true; 
        else if (ev && !ev.allDay) { 
            const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
            const snappedMin = pxToSlotMin(offsetY); 
            const duration = ev.end ? ev.end.getTime() - ev.start.getTime() : 30 * MS_MIN; 
            const durationMin = duration / MS_MIN; 
            if (rangeHitsDisabled(r, snappedMin, snappedMin + durationMin)) blocked = true; 
        } 
    } 
    if (e.dataTransfer) e.dataTransfer.dropEffect = blocked ? 'none' : 'move'; 
    dragOverResourceId.value = blocked ? null : r.id; 
    handleAutoScroll(e.clientY); 
}; 
const onDrop = (r: SchedulerResource, e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    const ev = props.events.find(x => x.id === draggingId.value); 
    if (!ev || !canDropOnResource(r, ev)) { onDragEnd(); return; } 
    if (!props.allowDropOnDisabled && isResourceDisabled(r)) { onDragEnd(); return; } 
    const offsetY = offsetFromEvent(e.currentTarget as HTMLElement, e.clientY); 
    const snappedMin = pxToSlotMin(offsetY); 
    const wasAllDay = !!ev.allDay; 
    const duration = !wasAllDay && ev.end ? ev.end.getTime() - ev.start.getTime() : 30 * MS_MIN; 
    const durationMin = duration / MS_MIN; 
    if (!props.allowDropOnDisabled && rangeHitsDisabled(r, snappedMin, snappedMin + durationMin)) { onDragEnd(); return; } 
    const newStart = new Date(currentDate.value); 
    newStart.setHours(props.hourStart, 0, 0, 0); 
    newStart.setMinutes(newStart.getMinutes() + snappedMin); 
    const newEnd = new Date(newStart.getTime() + duration); 
    if (props.preventOverlap && rangeOverlapsEvent(r.id, newStart.getTime(), newEnd.getTime(), ev.id)) { onDragEnd(); return; } 
    const emitEv: SchedulerEvent = wasAllDay 
        ? { ...ev, allDay: false, [props.resourceIdField]: r.id } as SchedulerEvent 
        : { ...ev, [props.resourceIdField]: r.id } as SchedulerEvent; 
    emit('event-drop', emitEv, newStart, newEnd, r); 
    dropGrowEvent(ev.id); 
    onDragEnd(); 
}; 
 
const onAllDayDragOver = (r: SchedulerResource, e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    const ev = props.events.find(x => x.id === draggingId.value); 
    let blocked = false; 
    if (!canDropOnResource(r, ev)) blocked = true; 
    if (!blocked && !props.allowDropOnDisabled && isResourceDisabled(r)) blocked = true; 
    if (e.dataTransfer) e.dataTransfer.dropEffect = blocked ? 'none' : 'move'; 
    allDayDragOverResourceId.value = blocked ? null : r.id; 
}; 
const onAllDayDrop = (r: SchedulerResource, _e: DragEvent) => { 
    if (!props.draggableEvents || draggingId.value === null) return; 
    const ev = props.events.find(x => x.id === draggingId.value); 
    if (!ev || !canDropOnResource(r, ev)) { onDragEnd(); return; } 
    if (!props.allowDropOnDisabled && isResourceDisabled(r)) { onDragEnd(); return; } 
    const wasAllDay = !!ev.allDay; 
    const duration = wasAllDay && ev.end ? startOfDay(ev.end).getTime() - startOfDay(ev.start).getTime() : 0; 
    const newStart = startOfDay(currentDate.value); 
    const newEnd = new Date(newStart.getTime() + duration); 
    const emitEv: SchedulerEvent = !wasAllDay 
        ? { ...ev, allDay: true, [props.resourceIdField]: r.id } as SchedulerEvent 
        : { ...ev, [props.resourceIdField]: r.id } as SchedulerEvent; 
    emit('event-drop', emitEv, newStart, wasAllDay ? newEnd : undefined, r); 
    dropGrowEvent(ev.id); 
    onDragEnd(); 
}; 
 
interface RangeSelect { resourceId: string | number; startMin: number; endMin: number; topPx: number; heightPx: number; } 
const rangeSelect = ref<RangeSelect | null>(null); 
const rangeJustSelected = ref(false); 
let rangePointerId: number | null = null; 
let rangeStartColEl: HTMLElement | null = null; 
let rangeResource: SchedulerResource | null = null; 
 
const onColPointerDown = (r: SchedulerResource, e: PointerEvent) => { 
    if (props.readonly) return; 
    if (!props.allowRangeSelection) return; 
    if (e.button !== 0) return; 
    if (isResourceDisabled(r)) return; 
    rangeStartColEl = e.currentTarget as HTMLElement; 
    rangeResource = r; 
    const offsetY = offsetFromEvent(rangeStartColEl, e.clientY); 
    const startMin = pxToSlotMin(offsetY); 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    rangeSelect.value = { 
        resourceId: r.id, 
        startMin, 
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
    rangeSelect.value = { ...rangeSelect.value, topPx: s * pxPerMin, heightPx: (e2 - s) * pxPerMin, endMin: e2, startMin: s }; 
}; 
const onRangePointerUp = (_e: PointerEvent) => { 
    if (!rangeSelect.value || !rangeStartColEl || !rangeResource) return; 
    stopAutoScroll(); 
    const { startMin, endMin } = rangeSelect.value; 
    const r = rangeResource; 
    rangeStartColEl.removeEventListener('pointermove', onRangePointerMove); 
    rangeStartColEl.removeEventListener('pointerup', onRangePointerUp); 
    rangeStartColEl.removeEventListener('pointercancel', onRangePointerUp); 
    if (rangePointerId !== null) rangeStartColEl.releasePointerCapture?.(rangePointerId); 
    rangePointerId = null; 
    rangeStartColEl = null; 
    rangeResource = null; 
 
    const durationMin = endMin - startMin; 
    if (durationMin > props.slotMinutes) { 
        const start = new Date(currentDate.value); 
        start.setHours(props.hourStart, 0, 0, 0); 
        start.setMinutes(start.getMinutes() + startMin); 
        const end = new Date(start.getTime() + durationMin * MS_MIN); 
        rangeJustSelected.value = true; 
        emit('select-range', start, end, r); 
    } 
    rangeSelect.value = null; 
}; 
 
interface ResizePreview { resourceId: string | number; topPx: number; heightPx: number; } 
const resizingId = ref<string | number | null>(null); 
const resizingPreview = ref<ResizePreview | null>(null); 
let resizeStartState: { event: SchedulerEvent; resource: SchedulerResource; startMin: number; minEndMin: number } | null = null; 
 
const onResizeStart = (ev: SchedulerEvent, r: SchedulerResource, _e: PointerEvent) => { 
    if (!props.resizableEvents || !isEventInteractive(ev)) return; 
    const startMin = Math.max(0, (ev.start.getTime() - dayStartMs.value) / MS_MIN); 
    const minEndMin = startMin + props.slotMinutes; 
    resizingId.value = ev.id; 
    resizeStartState = { event: ev, resource: r, startMin, minEndMin }; 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const curEndMin = ev.end ? (ev.end.getTime() - dayStartMs.value) / MS_MIN : minEndMin; 
    resizingPreview.value = { 
        resourceId: r.id, 
        topPx: startMin * pxPerMin, 
        heightPx: Math.max(curEndMin - startMin, props.slotMinutes) * pxPerMin, 
    }; 
    window.addEventListener('pointermove', onResizeMove); 
    window.addEventListener('pointerup', onResizeEnd); 
    window.addEventListener('pointercancel', onResizeEnd); 
}; 
const onResizeMove = (e: PointerEvent) => { 
    if (!resizeStartState || !resizingPreview.value) return; 
    const col = colRefs.get(resizeStartState.resource.id); 
    if (!col) return; 
    handleAutoScroll(e.clientY); 
    const rect = col.getBoundingClientRect(); 
    const offsetY = Math.max(0, Math.min(totalPixels.value, e.clientY - rect.top)); 
    const pxPerMin = props.slotHeight / props.slotMinutes; 
    const rawMin = offsetY / pxPerMin; 
    const snapped = Math.ceil(rawMin / props.slotMinutes) * props.slotMinutes; 
    const endMin = Math.max(resizeStartState.minEndMin, Math.min(windowMinutes.value, snapped)); 
    resizingPreview.value = { ...resizingPreview.value, heightPx: (endMin - resizeStartState.startMin) * pxPerMin }; 
}; 
const onResizeEnd = () => { 
    window.removeEventListener('pointermove', onResizeMove); 
    window.removeEventListener('pointerup', onResizeEnd); 
    window.removeEventListener('pointercancel', onResizeEnd); 
    stopAutoScroll(); 
    if (resizeStartState && resizingPreview.value) { 
        const pxPerMin = props.slotHeight / props.slotMinutes; 
        const endMin = resizeStartState.startMin + resizingPreview.value.heightPx / pxPerMin; 
        const newStart = new Date(resizeStartState.event.start); 
        const newEnd = new Date(currentDate.value); 
        newEnd.setHours(props.hourStart, 0, 0, 0); 
        newEnd.setMinutes(newEnd.getMinutes() + endMin); 
        const hitsDisabled = !props.allowResizeOverDisabled && rangeHitsDisabled(resizeStartState.resource, resizeStartState.startMin, endMin); 
        const overlaps = props.preventOverlap && rangeOverlapsEvent(resizeStartState.resource.id, newStart.getTime(), newEnd.getTime(), resizeStartState.event.id); 
        if (!hitsDisabled && !overlaps) { 
            const ev = resizeStartState.event; 
            const oldEndMin = ev.end ? (ev.end.getTime() - dayStartMs.value) / MS_MIN : resizeStartState.minEndMin; 
            const oldHeightPx = Math.max((oldEndMin - resizeStartState.startMin) * pxPerMin - 1, 18); 
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
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); shiftDay(-1); } 
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); shiftDay(1); } 
    else if (e.key.toLowerCase() === 't') { e.preventDefault(); handleToday(); } 
}; 
 
defineExpose({ scrollToCurrentTime }); 
 
const resolveEventColor = (ev: SchedulerEvent, r: SchedulerResource): CalendarEvent['color'] => { 
    if (ev.color) return ev.color; 
    if (props.useResourceColor && r.color) return r.color; 
    return props.color; 
}; 
 
 
const eventInlineStyle = (ev: SchedulerEvent, r: SchedulerResource) => { 
    if (ev.colorHex) { 
        return { backgroundColor: hexToRgba(ev.colorHex, 0.12), borderLeftColor: ev.colorHex, color: ev.colorHex }; 
    } 
    if (props.useResourceColor && r.colorHex) { 
        return { backgroundColor: hexToRgba(r.colorHex, 0.12), borderLeftColor: r.colorHex, color: r.colorHex }; 
    } 
    return undefined; 
}; 
 
const resourceInitials = (title: string) => { 
    const parts = title.trim().split(/\s+/); 
    if (!parts.length) return '?'; 
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase(); 
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase(); 
}; 
 
const resourceAvatarColor = (r: SchedulerResource): 'default' | 'primary' | 'danger' | 'success' | 'warning' => { 
    const c = r.color ?? 'default'; 
    if (c === 'primary' || c === 'danger' || c === 'success' || c === 'warning') return c; 
    return 'default'; 
}; 
 
const { currentTimeSolidClass } = useCurrentTimeLine(() => props.currentTimeColor); 
 
const { 
    todayTextClass, 
    rangeSelectClass, 
    focusRingColorClass, 
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
 
const localeValue = computed(() => (props.locale === 'default' ? undefined : props.locale)); 
 
const monthOptions = computed(() => { 
    const base = new Date(2024, 0, 1); 
    return Array.from({ length: 12 }, (_, i) => { 
        const d = new Date(base); 
        d.setMonth(i); 
        return d.toLocaleString(localeValue.value, { month: 'long' }); 
    }); 
}); 
 
const yearOptions = computed(() => { 
    const min = props.minDate?.getFullYear() ?? currentDate.value.getFullYear() - 10; 
    const max = props.maxDate?.getFullYear() ?? currentDate.value.getFullYear() + 10; 
    const list: number[] = []; 
    for (let y = min; y <= max; y++) list.push(y); 
    return list; 
}); 
 
const dayOptions = computed(() => { 
    const last = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate(); 
    return Array.from({ length: last }, (_, i) => i + 1); 
}); 
 
const selectedDay = computed({ 
    get: () => currentDate.value.getDate(), 
    set: (dd: number) => { 
        const dir = dd > currentDate.value.getDate() ? 1 : -1; 
        const d = new Date(currentDate.value); 
        d.setDate(dd); 
        currentDate.value = d; 
        emit('update:modelValue', d); 
        nextTick(() => animate(dir)); 
    }, 
}); 
 
const selectedMonth = computed({ 
    get: () => currentDate.value.getMonth(), 
    set: (mm: number) => { 
        const dir = mm > currentDate.value.getMonth() ? 1 : -1; 
        const d = new Date(currentDate.value); 
        d.setDate(1); 
        d.setMonth(mm); 
        currentDate.value = d; 
        emit('update:modelValue', d); 
        nextTick(() => animate(dir)); 
    }, 
}); 
 
const selectedYear = computed({ 
    get: () => currentDate.value.getFullYear(), 
    set: (yy: number) => { 
        const dir = yy > currentDate.value.getFullYear() ? 1 : -1; 
        const d = new Date(currentDate.value); 
        d.setFullYear(yy); 
        currentDate.value = d; 
        emit('update:modelValue', d); 
        nextTick(() => animate(dir)); 
    }, 
}); 
</script>
