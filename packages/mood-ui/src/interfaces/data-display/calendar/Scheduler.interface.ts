import type { CalendarEvent } from './MonthView.interface'; 
import type { BusinessHours, DisabledTimeRange } from './WeekView.interface'; 
 
export interface SchedulerResource { 
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
    /**
     * Caps the view's height so its body scrolls internally instead of growing
     * with the content. Bare numbers are pixels; strings take any CSS unit.
     */
    maxHeight?: number | string;
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
}
