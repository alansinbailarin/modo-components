<template> 
    <div 
        :class="['inline-flex flex-col sm:flex-row select-none bg-card w-fit max-w-full self-start', variant === 'outline' ? 'border border-border' : '', containerRadiusClass]" 
        role="application" 
        aria-label="Date range picker" 
    > 
        <div 
            v-if="showPresets" 
            class="flex flex-row sm:flex-col gap-2 sm:gap-1 p-3 border-b sm:border-b-0 sm:border-r border-border sm:min-w-35 overflow-x-auto sm:overflow-x-visible" 
        > 
            <button 
                v-for="preset in effectivePresets" 
                :key="preset.label" 
                type="button" 
                @click="applyPreset(preset)" 
                :class="[ 
                    'text-left text-sm px-3 py-1.5 rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 shrink-0 whitespace-nowrap', 
                    focusRingColorClass, 
                    isActivePreset(preset) 
                        ? activePresetClasses 
                        : 'text-foreground/80 hover:bg-muted', 
                ]" 
            > 
                {{ preset.label }} 
            </button> 
        </div> 
 
        <div class="flex flex-col sm:flex-row"> 
            <div 
                v-for="(panel, idx) in panels" 
                :key="idx" 
                class="flex flex-col" 
                :class="idx > 0 ? 'border-t sm:border-t-0 sm:border-l border-border' : ''" 
            > 
                <div class="flex items-center justify-between px-2 py-3"> 
                    <div class="flex items-center gap-0.5"> 
                        <Button 
                            v-if="idx === 0" 
                            variant="text" 
                            size="small" 
                            radius="medium" 
                            :icon="ChevronDoubleLeftIcon" 
                            :ariaLabel="loc.calendar.prevYear" 
                            class="text-muted-foreground" 
                            @click="animateShift('right', () => shiftYear(-1))" 
                        /> 
                        <Button 
                            v-if="idx === 0" 
                            variant="text" 
                            size="small" 
                            radius="medium" 
                            :icon="ChevronLeftIcon" 
                            :ariaLabel="loc.calendar.prevMonth" 
                            class="text-muted-foreground" 
                            @click="animateShift('right', () => shiftMonth(-1))" 
                        /> 
                        <div v-if="idx !== 0" class="w-15"></div> 
                    </div> 
 
                    <span class="text-sm font-semibold text-foreground"> 
                        {{ formatMonthYear(panel.month, panel.year) }} 
                    </span> 
 
                    <div class="flex items-center gap-0.5"> 
                        <Button 
                            v-if="idx === panels.length - 1" 
                            variant="text" 
                            size="small" 
                            radius="medium" 
                            :icon="ChevronRightIcon" 
                            :ariaLabel="loc.calendar.nextMonth" 
                            class="text-muted-foreground" 
                            @click="animateShift('left', () => shiftMonth(1))" 
                        /> 
                        <Button 
                            v-if="idx === panels.length - 1" 
                            variant="text" 
                            size="small" 
                            radius="medium" 
                            :icon="ChevronDoubleRightIcon" 
                            :ariaLabel="loc.calendar.nextYear" 
                            class="text-muted-foreground" 
                            @click="animateShift('left', () => shiftYear(1))" 
                        /> 
                        <div v-if="idx !== panels.length - 1" class="w-15"></div> 
                    </div> 
                </div> 
 
                <div class="grid grid-cols-7 px-2"> 
                    <div 
                        v-for="dayLabel in weekDayLabels" 
                        :key="dayLabel" 
                        class="text-center text-xs font-medium text-muted-foreground py-2" 
                    > 
                        {{ dayLabel }} 
                    </div> 
                </div> 
 
                <div class="overflow-hidden px-2 pb-3"> 
                    <div :ref="(el: unknown) => setGridRef(el as HTMLElement | null, idx)" class="grid grid-cols-7"> 
                        <div 
                            v-for="day in panel.days" 
                            :key="day.date.getTime()" 
                            class="relative flex items-center justify-center w-9 h-9" 
                        > 
                            <span 
                                v-if="bgSide(day) === 'full'" 
                                aria-hidden="true" 
                                :class="['absolute inset-y-0 -inset-x-px pointer-events-none', rangeMiddleBgClass]" 
                            /> 
                            <span 
                                v-else-if="bgSide(day) === 'left'" 
                                aria-hidden="true" 
                                :class="['absolute inset-y-0 -left-px right-1/2 pointer-events-none', rangeMiddleBgClass]" 
                            /> 
                            <span 
                                v-else-if="bgSide(day) === 'right'" 
                                aria-hidden="true" 
                                :class="['absolute inset-y-0 left-1/2 -right-px pointer-events-none', rangeMiddleBgClass]" 
                            /> 
 
                            <button 
                                type="button" 
                                :disabled="day.disabled" 
                                :aria-label="day.date.toLocaleDateString(locale === 'default' ? undefined : locale)" 
                                :aria-selected="day.isRangeStart || day.isRangeEnd" 
                                @click="!day.disabled && handleDayClick(day.date)" 
                                @mouseenter="!day.disabled && (hoverDate = day.date)" 
                                @mouseleave="hoverDate = null" 
                                :class="[ 
                                    'relative z-10 w-9 h-9 text-sm flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1', 
                                    dayRadiusClass, 
                                    focusRingColorClass, 
                                    dayStateClasses(day), 
                                ]" 
                            > 
                                {{ day.day }} 
                            </button> 
                        </div> 
                    </div> 
                </div> 
            </div> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, nextTick } from 'vue'; 
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'; 
import Button from '../../forms/Button.vue'; 
import gsap from 'gsap'; 
import type { DateRangePicker, RangePreset } from '../../../interfaces/data-display/date-picker/DateRangePicker.interface'; 
import { isSameDay, startOfDay, type CalendarDay } from '../../../composables/useCalendar'; 
import { useResolvedColor, useResolvedRadius, useModoLocale } from '../../../composables/useModoConfig'; 
 
const loc = useModoLocale(); 
 
const props = withDefaults(defineProps<DateRangePicker>(), { 
    modelValue: () => [null, null] as [Date | null, Date | null], 
    locale: 'default', 
    firstDayOfWeek: 0, 
    color: 'default', 
    variant: 'outline', 
    months: 2, 
    showPresets: true, 
}); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedRadius = useResolvedRadius(() => props.radius); 
 
const emit = defineEmits<{ 
    'update:modelValue': [range: [Date | null, Date | null]]; 
    'rangeComplete': [range: [Date, Date]]; 
}>(); 
 
const gridRefs = ref<(HTMLElement | null)[]>([]); 
const setGridRef = (el: HTMLElement | null, idx: number) => { gridRefs.value[idx] = el; }; 
 
const today = new Date(); 
 
const baseMonth = ref(props.modelValue[0]?.getMonth() ?? today.getMonth()); 
const baseYear = ref(props.modelValue[0]?.getFullYear() ?? today.getFullYear()); 
 
const pendingStart = ref<Date | null>(props.modelValue[0] ?? null); 
const pendingEnd = ref<Date | null>(props.modelValue[1] ?? null); 
const hoverDate = ref<Date | null>(null); 
const isAnimating = ref(false); 
 
const defaultPresets: RangePreset[] = [ 
    { label: 'Today', range: () => [new Date(), new Date()] }, 
    { label: 'Yesterday', range: () => { const d = new Date(); d.setDate(d.getDate() - 1); return [d, new Date(d)]; } }, 
    { label: 'Last 7 days', range: () => { const s = new Date(); s.setDate(s.getDate() - 6); return [s, new Date()]; } }, 
    { label: 'Last 30 days', range: () => { const s = new Date(); s.setDate(s.getDate() - 29); return [s, new Date()]; } }, 
    { label: 'This month', range: () => { const now = new Date(); return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)]; } }, 
    { label: 'Last month', range: () => { const now = new Date(); return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)]; } }, 
    { label: 'This year', range: () => { const now = new Date(); return [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 11, 31)]; } }, 
]; 
 
const effectivePresets = computed(() => props.presets ?? defaultPresets); 
 
const isActivePreset = (preset: RangePreset) => { 
    if (!pendingStart.value || !pendingEnd.value) return false; 
    const [s, e] = preset.range(); 
    return isSameDay(s, pendingStart.value) && isSameDay(e, pendingEnd.value); 
}; 
 
const applyPreset = (preset: RangePreset) => { 
    const [s, e] = preset.range(); 
    pendingStart.value = s; 
    pendingEnd.value = e; 
    baseMonth.value = s.getMonth(); 
    baseYear.value = s.getFullYear(); 
    emit('update:modelValue', [s, e]); 
    emit('rangeComplete', [s, e]); 
}; 
 
const locale = computed(() => props.locale === 'default' ? undefined : props.locale); 
 
const formatMonthYear = (month: number, year: number) => { 
    return new Date(year, month, 1).toLocaleString(locale.value, { month: 'long', year: 'numeric' }); 
}; 
 
const weekDayLabels = computed(() => { 
    const labels: string[] = []; 
    const base = new Date(2024, 0, 7 + props.firstDayOfWeek); 
    for (let i = 0; i < 7; i++) { 
        const d = new Date(base); 
        d.setDate(base.getDate() + i); 
        labels.push(d.toLocaleString(locale.value, { weekday: 'short' }).slice(0, 2)); 
    } 
    return labels; 
}); 
 
interface Panel { 
    month: number; 
    year: number; 
    days: CalendarDay[]; 
} 
 
const currentRange = computed<[Date | null, Date | null]>(() => { 
    if (pendingStart.value && !pendingEnd.value && hoverDate.value) { 
        const s = pendingStart.value; 
        const h = hoverDate.value; 
        return h < s ? [h, s] : [s, h]; 
    } 
    return [pendingStart.value, pendingEnd.value]; 
}); 
 
const isDateDisabled = (date: Date) => { 
    if (props.minDate && date < startOfDay(props.minDate)) return true; 
    if (props.maxDate && date > startOfDay(props.maxDate)) return true; 
    if (props.disabledDates?.some(d => isSameDay(d, date))) return true; 
    if (props.maxRange && pendingStart.value && !pendingEnd.value) { 
        if (inclusiveDaysBetween(pendingStart.value, date) > props.maxRange) return true; 
    } 
    return false; 
}; 
 
const buildPanel = (month: number, year: number): Panel => { 
    const days: CalendarDay[] = []; 
    const firstOfMonth = new Date(year, month, 1); 
    const lastOfMonth = new Date(year, month + 1, 0); 
    const [rangeStart, rangeEnd] = currentRange.value; 
 
    let startDow = firstOfMonth.getDay() - props.firstDayOfWeek; 
    if (startDow < 0) startDow += 7; 
 
    const build = (date: Date, isOutside: boolean): CalendarDay => { 
        const inRange = !!(rangeStart && rangeEnd && 
            startOfDay(date).getTime() >= startOfDay(rangeStart).getTime() && 
            startOfDay(date).getTime() <= startOfDay(rangeEnd).getTime()); 
        return { 
            date, 
            day: date.getDate(), 
            isToday: isSameDay(date, today), 
            isSelected: false, 
            isOutside, 
            disabled: isDateDisabled(date), 
            inRange, 
            isRangeStart: !!rangeStart && isSameDay(date, rangeStart), 
            isRangeEnd: !!rangeEnd && isSameDay(date, rangeEnd), 
        }; 
    }; 
 
    for (let i = startDow - 1; i >= 0; i--) { 
        const date = new Date(year, month, -i); 
        days.push(build(date, true)); 
    } 
    for (let d = 1; d <= lastOfMonth.getDate(); d++) { 
        days.push(build(new Date(year, month, d), false)); 
    } 
    const targetLength = Math.ceil(days.length / 7) * 7 < 42 ? 42 : Math.ceil(days.length / 7) * 7; 
    let nextDay = 1; 
    while (days.length < targetLength) { 
        days.push(build(new Date(year, month + 1, nextDay++), true)); 
    } 
 
    return { month, year, days }; 
}; 
 
const panels = computed<Panel[]>(() => { 
    const result: Panel[] = []; 
    for (let i = 0; i < props.months; i++) { 
        const m = (baseMonth.value + i) % 12; 
        const y = baseYear.value + Math.floor((baseMonth.value + i) / 12); 
        result.push(buildPanel(m, y)); 
    } 
    return result; 
}); 
 
const shiftMonth = (delta: number) => { 
    let m = baseMonth.value + delta; 
    let y = baseYear.value; 
    while (m < 0) { m += 12; y--; } 
    while (m > 11) { m -= 12; y++; } 
    baseMonth.value = m; 
    baseYear.value = y; 
}; 
 
const shiftYear = (delta: number) => { 
    baseYear.value += delta; 
}; 
 
const animateShift = (direction: 'left' | 'right', action: () => void): Promise<void> => { 
    return new Promise((resolve) => { 
        const grids = gridRefs.value.filter((g): g is HTMLElement => !!g); 
        if (grids.length === 0 || isAnimating.value) { 
            action(); 
            resolve(); 
            return; 
        } 
        isAnimating.value = true; 
        const from = direction === 'left' ? -20 : 20; 
        const to = direction === 'left' ? 20 : -20; 
 
        gsap.to(grids, { 
            x: to, 
            opacity: 0, 
            duration: 0.15, 
            ease: 'power2.in', 
            onComplete: () => { 
                action(); 
                nextTick(() => { 
                    const newGrids = gridRefs.value.filter((g): g is HTMLElement => !!g); 
                    gsap.fromTo( 
                        newGrids, 
                        { x: from, opacity: 0 }, 
                        { 
                            x: 0, opacity: 1, duration: 0.2, ease: 'power2.out', 
                            onComplete: () => { isAnimating.value = false; resolve(); }, 
                        } 
                    ); 
                }); 
            }, 
        }); 
    }); 
}; 
 
const MS_PER_DAY = 86400000; 
const inclusiveDaysBetween = (a: Date, b: Date) => 
    Math.abs(Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY)) + 1; 
 
const handleDayClick = (date: Date) => { 
    if (!pendingStart.value || (pendingStart.value && pendingEnd.value)) { 
        pendingStart.value = date; 
        pendingEnd.value = null; 
        emit('update:modelValue', [date, null]); 
        return; 
    } 
    let start = pendingStart.value; 
    let end = date; 
    if (end < start) [start, end] = [end, start]; 
 
    if (props.minRange && inclusiveDaysBetween(start, end) < props.minRange) { 
        pendingStart.value = date; 
        pendingEnd.value = null; 
        emit('update:modelValue', [date, null]); 
        return; 
    } 
 
    pendingStart.value = start; 
    pendingEnd.value = end; 
    emit('update:modelValue', [start, end]); 
    emit('rangeComplete', [start, end]); 
}; 
 
const colorBg = computed(() => ({ 
    default: 'bg-foreground text-background', 
    primary: 'bg-primary text-primary-foreground', 
    danger: 'bg-destructive text-destructive-foreground', 
    success: 'bg-success text-success-foreground', 
    warning: 'bg-warning text-warning-foreground', 
}[resolvedColor.value] ?? 'bg-primary text-primary-foreground')); 
 
const rangeMiddleBgClass = computed(() => ({ 
    default: 'bg-muted', 
    primary: 'bg-primary-subtle', 
    danger: 'bg-destructive-subtle', 
    success: 'bg-success-subtle', 
    warning: 'bg-warning-subtle', 
}[resolvedColor.value] ?? 'bg-primary-subtle')); 
 
const activePresetClasses = computed(() => ({ 
    default: 'bg-muted text-foreground font-medium', 
    primary: 'bg-primary-subtle text-primary font-medium', 
    danger: 'bg-destructive-subtle text-destructive font-medium', 
    success: 'bg-success-subtle text-success font-medium', 
    warning: 'bg-warning-subtle text-warning font-medium', 
}[resolvedColor.value] ?? 'bg-primary-subtle text-primary font-medium')); 
 
// Unified focus ring across the system — colour-agnostic.
const focusRingColorClass = computed(() => 'focus-visible:ring-ring/60');
 
const containerRadiusClass = computed(() => ({ 
    none: 'rounded-none', 
    small: 'rounded-sm', 
    medium: 'rounded-md', 
    large: 'rounded-lg', 
    full: 'rounded-xl', 
}[resolvedRadius.value] ?? 'rounded-lg')); 
 
const dayRadiusClass = computed(() => ({ 
    none: 'rounded-none', 
    small: 'rounded-sm', 
    medium: 'rounded-md', 
    large: 'rounded-lg', 
    full: 'rounded-full', 
}[resolvedRadius.value] ?? 'rounded-full')); 
 
type BgSide = 'none' | 'full' | 'left' | 'right'; 
const bgSide = (day: CalendarDay): BgSide => { 
    if (day.disabled) return 'none'; 
    const [rs, re] = currentRange.value; 
    if (!rs || !re || isSameDay(rs, re)) return 'none'; 
    if (day.isRangeStart) return 'right'; 
    if (day.isRangeEnd) return 'left'; 
    if (day.inRange) return 'full'; 
    return 'none'; 
}; 
 
const todayTextClass = computed(() => ({ 
    default: 'text-foreground', 
    primary: 'text-primary', 
    danger: 'text-destructive', 
    success: 'text-success', 
    warning: 'text-warning', 
}[resolvedColor.value] ?? 'text-primary')); 
 
const dayStateClasses = (day: CalendarDay): string => { 
    if (day.disabled) return 'text-muted-foreground/60 cursor-not-allowed'; 
    if (day.isRangeStart || day.isRangeEnd) { 
        return `${colorBg.value} hover:opacity-90`; 
    } 
    if (day.isToday) { 
        return `font-semibold ${todayTextClass.value} hover:bg-muted`; 
    } 
    if (day.isOutside) return 'text-muted-foreground/40 hover:bg-muted'; 
    return 'text-foreground/80 hover:bg-muted'; 
}; 
</script>
