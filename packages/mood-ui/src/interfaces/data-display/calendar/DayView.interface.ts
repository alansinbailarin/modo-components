import type { CalendarEvent } from './MonthView.interface'; 
import type { BusinessHours, DisabledTimeRange } from './WeekView.interface'; 
 
export interface DayView { 
    modelValue?: Date; 
    events?: CalendarEvent[]; 
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
}
