<template> 
    <div 
        ref="rootRef" 
        tabindex="-1" 
        :class="['relative flex flex-col bg-card overflow-hidden focus:outline-none', containerRadiusClass, bordered ? 'border border-border' : '']" 
        :style="{ maxHeight: toCssLength(maxHeight) }"
        @keydown="handleKeydown" 
    > 
        <slot name="header" :label="headerLabel" :goToToday="handleToday" :prev="handlePrev" :next="handleNext" :prevYear="handlePrevYear" :nextYear="handleNextYear"> 
            <CalendarHeader 
                :label="headerLabel" 
                :showHeader="showHeader" 
                :showYearJump="showYearNavigation" 
                :showTodayButton="showTodayButton" 
                :showMonthYearSelects="showMonthYearSelects" 
                :monthOptions="monthOptions" 
                :yearOptions="yearOptions" 
                v-model:selectedMonth="selectedMonth" 
                v-model:selectedYear="selectedYear" 
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
 
        <div ref="scrollRef" class="flex-1 overflow-y-auto" @scroll="onScroll"> 
            <div v-if="!groups.length" class="flex-1 flex items-center justify-center py-12 text-sm text-muted-foreground"> 
                <slot name="empty">{{ emptyText ?? loc.agenda.empty }}</slot> 
            </div> 
 
            <template v-for="(g, gi) in groups" :key="g.key"> 
                <div 
                    v-if="showMonthSeparator && g.showMonthHeader" 
                    class="sticky top-0 z-20 bg-card/95 backdrop-blur px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border" 
                > 
                    {{ g.monthLabel }} 
                </div> 
 
                <div 
                    :data-dkey="g.key" 
                    :class="[ 
                        'grid border-b border-border transition-colors', 
                        g.isToday ? 'bg-muted/40' : '', 
                        g.disabled ? 'opacity-60' : '', 
                    ]" 
                    style="grid-template-columns: 5rem 1fr;" 
                > 
                    <div class="flex flex-col items-center justify-start py-4 border-r border-border"> 
                        <slot name="day-header" :date="g.date" :isToday="g.isToday" :events="g.events"> 
                            <span :class="['text-[10px] font-medium tracking-wider text-muted-foreground', dayNameCaseClass]">{{ g.weekdayLabel }}</span> 
                            <span 
                                :class="[ 
                                    'mt-1 inline-flex items-center justify-center text-base font-semibold w-9 h-9', 
                                    pillRadiusClass, 
                                    g.isToday ? [todayBgClass] : 'text-foreground', 
                                ]" 
                            >{{ g.day }}</span> 
                            <span v-if="isHighlightedDate(g.date)" :class="['mt-1 w-1 h-1 rounded-full', highlightDotClass]"></span> 
                        </slot> 
                    </div> 
 
                    <div class="py-2 px-3"> 
                        <div v-if="!g.events.length" class="py-2 text-xs text-muted-foreground/60 italic"> 
                            No events 
                        </div> 
                        <div v-else class="flex flex-col"> 
                            <button 
                                v-for="ev in g.events" 
                                :key="`${g.key}-${ev.id}`" 
                                :data-eid="ev.id" 
                                type="button" 
                                @click="handleEventClick(ev, $event)" 
                                @mouseenter="onEventEnter(ev, !!ev.allDay, $event)" 
                                @mousemove="onEventMove" 
                                @mouseleave="onEventLeave" 
                                :class="['group flex items-start gap-3 py-2 px-2 -mx-2 cursor-pointer transition-colors hover:bg-muted/70 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring', eventRadiusClass]" 
                            > 
                                <span class="shrink-0 w-16 pt-0.5 text-[11px] font-medium text-muted-foreground tabular-nums"> 
                                    <template v-if="ev.allDay">All day</template> 
                                    <template v-else>{{ formatEventTime(ev.start) }}</template> 
                                </span> 
                                <span 
                                    class="shrink-0 mt-1.5 w-2 h-2" 
                                    :style="ev.colorHex ? { backgroundColor: ev.colorHex } : undefined" 
                                    :class="[pillRadiusClass, !ev.colorHex ? dotColorClass(ev.color) : '']" 
                                ></span> 
                                <span class="flex-1 min-w-0"> 
                                    <slot name="event" :event="ev"> 
                                        <span class="block text-sm font-medium text-foreground truncate">{{ ev.title }}</span> 
                                        <span v-if="!ev.allDay && ev.end" class="block text-[11px] text-muted-foreground"> 
                                            {{ formatEventTime(ev.start) }} – {{ formatEventTime(ev.end) }} 
                                        </span> 
                                        <span v-if="ev.description" class="block text-xs text-muted-foreground truncate mt-0.5">{{ ev.description }}</span> 
                                    </slot> 
                                </span> 
                                <span v-if="ev.readonly" class="shrink-0 mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground border border-border px-1 rounded">Locked</span> 
                            </button> 
                        </div> 
                    </div> 
                </div> 
                <div v-if="gi === groups.length - 1" class="h-1"></div> 
            </template> 
        </div> 
 
        <CalendarEventTooltip :state="hoverState" :style="tooltipStyle" :formatTime="formatEventTime"> 
            <template #default="{ event, allDay }"> 
                <slot name="event-tooltip" :event="event" :allDay="allDay" /> 
            </template> 
        </CalendarEventTooltip> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, watch, nextTick, onMounted } from 'vue'; 
import gsap from 'gsap'; 
import { isSameDay, startOfDay } from '../../../composables/useCalendar'; 
import { useCalendarTheme } from '../../../composables/useCalendarTheme'; 
import { useModoLocale } from '../../../composables/useModoConfig'; 
 
const loc = useModoLocale(); 
import { useEventHover } from '../../../composables/useEventHover'; 
import CalendarEventTooltip from './CalendarEventTooltip.vue'; 
import CalendarHeader from './CalendarHeader.vue'; 
import type { AgendaView } from '../../../interfaces/data-display/calendar/AgendaView.interface'; 
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface'; 
 
import { toCssLength } from '../../../utils/cssLength';

const props = withDefaults(defineProps<AgendaView>(), { 
    modelValue: () => new Date(), 
    events: () => [], 
    locale: 'default', 
    color: 'default', 
    bordered: true, 
    daysToShow: 30, 
    daysBefore: 0, 
    showEmptyDays: false, 
    showHeader: true, 
    showMonthSeparator: true, 
    showYearNavigation: false, 
    showMonthYearSelects: false, 
    showTodayButton: true, 
    dayNameFormat: 'short', 
    dayNameCase: 'upper', 
    format: '24h', 
    readonly: false, 
    highlightedDates: () => [], 
    disabledDates: () => [], 
    disabledWeekdays: () => [], 
    // emptyText resolves against locale when not provided. 
    loadMoreChunk: 30, 
    enableKeyboardNavigation: true, 
}); 
 
const emit = defineEmits<{ 
    'update:modelValue': [date: Date]; 
    'event-click': [event: CalendarEvent, nativeEvent: MouseEvent]; 
    'day-click': [date: Date, events: CalendarEvent[], nativeEvent: MouseEvent]; 
    'create-event': [date: Date, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent]; 
    'load-more': [direction: 'forward' | 'backward']; 
}>(); 
 
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1); 
const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); 
 
const anchorDate = ref(firstOfMonth(new Date(props.modelValue))); 
const daysForwardShown = ref(Math.max(props.daysToShow, daysInMonth(anchorDate.value))); 
 
watch(() => props.modelValue, (v) => { 
    if (!v) return; 
    const f = firstOfMonth(new Date(v)); 
    if (f.getTime() === anchorDate.value.getTime()) return; 
    anchorDate.value = f; 
    daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(f)); 
}); 
watch(() => props.daysToShow, (n) => { daysForwardShown.value = Math.max(n, daysInMonth(anchorDate.value)); }); 
 
const rootRef = ref<HTMLElement | null>(null); 
const scrollRef = ref<HTMLElement | null>(null); 
const today = new Date(); 
 
const { hoverState, onEventEnter, onEventMove, onEventLeave, tooltipStyle } = useEventHover<CalendarEvent>(); 
 
const formatEventTime = (d: Date) => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: props.format === '12h' }); 
}; 
 
const isHighlightedDate = (d: Date) => props.highlightedDates.some(h => isSameDay(h, d)); 
const isDisabledDate = (d: Date) => props.disabledDates.some(x => isSameDay(x, d)); 
const isDisabledWeekday = (d: Date) => props.disabledWeekdays.includes(d.getDay()); 
const isDayDisabled = (d: Date) => { 
    if (props.minDate && startOfDay(d) < startOfDay(props.minDate)) return true; 
    if (props.maxDate && startOfDay(d) > startOfDay(props.maxDate)) return true; 
    return isDisabledDate(d) || isDisabledWeekday(d); 
}; 
 
interface DayGroup { 
    key: string; 
    date: Date; 
    day: number; 
    weekdayLabel: string; 
    monthLabel: string; 
    showMonthHeader: boolean; 
    isToday: boolean; 
    disabled: boolean; 
    events: CalendarEvent[]; 
} 
 
const rangeDates = computed<Date[]>(() => { 
    const anchor = anchorDate.value; 
    const list: Date[] = []; 
    for (let i = 0; i < daysForwardShown.value; i++) { 
        const d = new Date(anchor); 
        d.setDate(d.getDate() + i); 
        const sod = startOfDay(d); 
        if (props.minDate && sod < startOfDay(props.minDate)) continue; 
        if (props.maxDate && sod > startOfDay(props.maxDate)) continue; 
        list.push(sod); 
    } 
    return list; 
}); 
 
const eventsByDay = computed<Map<string, CalendarEvent[]>>(() => { 
    const map = new Map<string, CalendarEvent[]>(); 
    for (const ev of props.events) { 
        const s = startOfDay(ev.start); 
        const e = startOfDay(ev.end ?? ev.start); 
        const d = new Date(s); 
        while (d.getTime() <= e.getTime()) { 
            const k = d.toDateString(); 
            if (!map.has(k)) map.set(k, []); 
            map.get(k)!.push(ev); 
            d.setDate(d.getDate() + 1); 
        } 
    } 
    for (const list of map.values()) { 
        list.sort((a, b) => { 
            if (a.allDay && !b.allDay) return -1; 
            if (!a.allDay && b.allDay) return 1; 
            return a.start.getTime() - b.start.getTime(); 
        }); 
    } 
    return map; 
}); 
 
const isoKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; 
const parseIsoKey = (s: string): Date | null => { 
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); 
    if (!m) return null; 
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])); 
}; 
 
const groups = computed<DayGroup[]>(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    const result: DayGroup[] = []; 
    let lastMonthKey = ''; 
    for (const date of rangeDates.value) { 
        const key = isoKey(date); 
        const evts = eventsByDay.value.get(date.toDateString()) ?? []; 
        if (!props.showEmptyDays && !evts.length) continue; 
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`; 
        const showMonthHeader = monthKey !== lastMonthKey; 
        lastMonthKey = monthKey; 
        result.push({ 
            key, 
            date, 
            day: date.getDate(), 
            weekdayLabel: date.toLocaleDateString(locale, { weekday: props.dayNameFormat }), 
            monthLabel: date.toLocaleDateString(locale, { month: 'long', year: 'numeric' }), 
            showMonthHeader, 
            isToday: isSameDay(date, today), 
            disabled: isDayDisabled(date), 
            events: evts, 
        }); 
    } 
    return result; 
}); 
 
const headerLabel = computed(() => { 
    const locale = props.locale === 'default' ? undefined : props.locale; 
    const d = visibleDate.value ?? anchorDate.value; 
    return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' }); 
}); 
 
const handleEventClick = (ev: CalendarEvent, e: MouseEvent) => { 
    emit('event-click', ev, e); 
}; 
 
const afterNavigate = (scrollTarget?: Date, animateScroll = false) => { 
    nextTick(() => { 
        if (!scrollRef.value || !rootRef.value) { animateIn(); return; } 
        const scEl = scrollRef.value; 
        let target = 0; 
        if (scrollTarget) { 
            const key = isoKey(startOfDay(scrollTarget)); 
            const el = rootRef.value.querySelector<HTMLElement>(`[data-dkey="${key}"]`); 
            if (el) { 
                const scRect = scEl.getBoundingClientRect(); 
                const elRect = el.getBoundingClientRect(); 
                target = scEl.scrollTop + (elRect.top - scRect.top) - 12; 
            } 
        } 
        if (animateScroll && target > 0) { 
            scEl.scrollTop = 0; 
            animateIn(); 
            gsap.to(scEl, { scrollTop: target, duration: 0.7, ease: 'power3.inOut', delay: 0.15 }); 
        } else { 
            scEl.scrollTop = target; 
            animateIn(); 
        } 
        visibleDate.value = anchorDate.value; 
    }); 
}; 
const handlePrev = () => { 
    const d = new Date(anchorDate.value); 
    d.setMonth(d.getMonth() - 1); 
    anchorDate.value = firstOfMonth(d); 
    daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(anchorDate.value)); 
    emit('update:modelValue', anchorDate.value); 
    afterNavigate(); 
}; 
const handleNext = () => { 
    const d = new Date(anchorDate.value); 
    d.setMonth(d.getMonth() + 1); 
    anchorDate.value = firstOfMonth(d); 
    daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(anchorDate.value)); 
    emit('update:modelValue', anchorDate.value); 
    afterNavigate(); 
}; 
const handleToday = () => { 
    const n = new Date(); 
    const wasCurrentMonth = firstOfMonth(n).getTime() === anchorDate.value.getTime(); 
    anchorDate.value = firstOfMonth(n); 
    daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(anchorDate.value)); 
    emit('update:modelValue', anchorDate.value); 
    afterNavigate(n, !wasCurrentMonth); 
    if (wasCurrentMonth && scrollRef.value && rootRef.value) { 
        nextTick(() => { 
            const key = isoKey(startOfDay(n)); 
            const el = rootRef.value!.querySelector<HTMLElement>(`[data-dkey="${key}"]`); 
            if (!el) return; 
            const scRect = scrollRef.value!.getBoundingClientRect(); 
            const elRect = el.getBoundingClientRect(); 
            const target = scrollRef.value!.scrollTop + (elRect.top - scRect.top) - 12; 
            gsap.to(scrollRef.value!, { scrollTop: target, duration: 0.6, ease: 'power3.inOut' }); 
        }); 
    } 
}; 
const handlePrevYear = () => { 
    const d = new Date(anchorDate.value); 
    d.setFullYear(d.getFullYear() - 1); 
    anchorDate.value = firstOfMonth(d); 
    daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(anchorDate.value)); 
    emit('update:modelValue', anchorDate.value); 
    afterNavigate(); 
}; 
const handleNextYear = () => { 
    const d = new Date(anchorDate.value); 
    d.setFullYear(d.getFullYear() + 1); 
    anchorDate.value = firstOfMonth(d); 
    daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(anchorDate.value)); 
    emit('update:modelValue', anchorDate.value); 
    afterNavigate(); 
}; 
 
const animateIn = () => { 
    if (!rootRef.value) return; 
    const els = rootRef.value.querySelectorAll<HTMLElement>('[data-dkey]'); 
    if (!els.length) return; 
    gsap.fromTo( 
        els, 
        { opacity: 0, y: 8 }, 
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: { amount: 0.2 } } 
    ); 
}; 
 
let loadingMore = false; 
const visibleDate = ref<Date | null>(null); 
const canExtend = () => { 
    if (!props.maxDate) return true; 
    const last = rangeDates.value[rangeDates.value.length - 1]; 
    return !(last && startOfDay(last) >= startOfDay(props.maxDate)); 
}; 
const onScroll = () => { 
    if (!scrollRef.value) return; 
    const el = scrollRef.value; 
    if (rootRef.value) { 
        const scRect = el.getBoundingClientRect(); 
        const headers = rootRef.value.querySelectorAll<HTMLElement>('[data-dkey]'); 
        let pick: Date | null = null; 
        for (const h of headers) { 
            const r = h.getBoundingClientRect(); 
            if (r.bottom > scRect.top + 8) { 
                const k = h.getAttribute('data-dkey'); 
                if (k) pick = parseIsoKey(k); 
                break; 
            } 
        } 
        if (pick) visibleDate.value = pick; 
    } 
    if (loadingMore) return; 
    const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight); 
    if (remaining < 120) { 
        if (!canExtend()) return; 
        loadingMore = true; 
        daysForwardShown.value += props.loadMoreChunk; 
        emit('load-more', 'forward'); 
        setTimeout(() => { loadingMore = false; }, 120); 
    } 
}; 
 
const handleKeydown = (e: KeyboardEvent) => { 
    if (!props.enableKeyboardNavigation) return; 
    const target = e.target as HTMLElement; 
    if (target.tagName === 'SELECT' || target.tagName === 'INPUT') return; 
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); handlePrev(); } 
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); handleNext(); } 
    else if (e.key.toLowerCase() === 't') { e.preventDefault(); handleToday(); } 
}; 
 
onMounted(() => { 
    nextTick(() => { 
        visibleDate.value = anchorDate.value; 
        animateIn(); 
        if (scrollRef.value && rootRef.value) { 
            const todayMonth = firstOfMonth(today); 
            if (todayMonth.getTime() === anchorDate.value.getTime()) { 
                const key = isoKey(startOfDay(today)); 
                const el = rootRef.value.querySelector<HTMLElement>(`[data-dkey="${key}"]`); 
                if (el) { 
                    const scEl = scrollRef.value; 
                    const scRect = scEl.getBoundingClientRect(); 
                    const elRect = el.getBoundingClientRect(); 
                    const target = scEl.scrollTop + (elRect.top - scRect.top) - 12; 
                    if (target > 0) { 
                        gsap.to(scEl, { scrollTop: target, duration: 0.9, ease: 'power3.inOut', delay: 0.25 }); 
                    } 
                } 
            } 
        } 
    }); 
}); 
 
defineExpose({ 
    scrollToDate(date: Date) { 
        nextTick(() => { 
            if (!scrollRef.value || !rootRef.value) return; 
            const key = isoKey(startOfDay(date)); 
            const el = rootRef.value.querySelector<HTMLElement>(`[data-dkey="${key}"]`); 
            if (!el) return; 
            const scRect = scrollRef.value.getBoundingClientRect(); 
            const elRect = el.getBoundingClientRect(); 
            const target = scrollRef.value.scrollTop + (elRect.top - scRect.top) - 12; 
            gsap.to(scrollRef.value, { scrollTop: target, duration: 0.45, ease: 'power3.inOut' }); 
        }); 
    }, 
}); 
 
const { todayTextClass, dayNameCaseClass, focusRingColorClass, highlightDotClass, containerRadiusClass, eventRadiusClass, pillRadiusClass, todayBgClass, resolvedColor } = useCalendarTheme({ 
    color: () => props.color, 
    radius: () => props.radius, 
    dayNameCase: () => props.dayNameCase, 
}); 
 
const DOT_THEMED: Record<string, string> = { 
    default: 'bg-muted-foreground', 
    primary: 'bg-primary', 
    danger: 'bg-destructive', 
    success: 'bg-success', 
    warning: 'bg-warning', 
}; 
const DOT_SEMANTIC: Record<string, string> = { 
    info: 'bg-info', 
    purple: 'bg-purple', 
    pink: 'bg-pink', 
}; 
const dotColorClass = (c?: CalendarEvent['color']) => { 
    if (!c) return DOT_THEMED.default; 
    return DOT_THEMED[c] ?? DOT_SEMANTIC[c] ?? DOT_THEMED.default; 
}; 
 
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
    const min = props.minDate?.getFullYear() ?? anchorDate.value.getFullYear() - 10; 
    const max = props.maxDate?.getFullYear() ?? anchorDate.value.getFullYear() + 10; 
    const list: number[] = []; 
    for (let y = min; y <= max; y++) list.push(y); 
    return list; 
}); 
 
const selectedMonth = computed({ 
    get: () => anchorDate.value.getMonth(), 
    set: (mm: number) => { 
        const d = new Date(anchorDate.value); 
        d.setDate(1); 
        d.setMonth(mm); 
        anchorDate.value = firstOfMonth(d); 
        daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(anchorDate.value)); 
        emit('update:modelValue', anchorDate.value); 
        afterNavigate(); 
    }, 
}); 
 
const selectedYear = computed({ 
    get: () => anchorDate.value.getFullYear(), 
    set: (yy: number) => { 
        const d = new Date(anchorDate.value); 
        d.setFullYear(yy); 
        anchorDate.value = firstOfMonth(d); 
        daysForwardShown.value = Math.max(props.daysToShow, daysInMonth(anchorDate.value)); 
        emit('update:modelValue', anchorDate.value); 
        afterNavigate(); 
    }, 
}); 
</script>
