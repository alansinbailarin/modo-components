import type { CalendarEvent } from './MonthView.interface'; 
 
export interface DisabledTimeRange { 
    start: string; 
    end: string; 
    daysOfWeek?: number[]; 
} 
 
export interface BusinessHours { 
    start: string; 
    end: string; 
    daysOfWeek?: number[]; 
} 
 
export interface WeekView { 
    modelValue?: Date; 
    events?: CalendarEvent[]; 
    locale?: string; 
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
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
    highlightedWeekdays?: number[]; 
    highlightedDates?: Date[]; 
    disabledDates?: Date[]; 
    disabledWeekdays?: number[]; 
    disabledTimeRanges?: DisabledTimeRange[]; 
    businessHours?: BusinessHours | BusinessHours[]; 
    showHeader?: boolean; 
    showYearJump?: boolean; 
    showTodayButton?: boolean; 
    showMonthYearSelects?: boolean; 
    showWeekSelect?: boolean; 
    hourStart?: number; 
    hourEnd?: number; 
    slotMinutes?: 15 | 30 | 60; 
    slotHeight?: number; 
    /** 
     * Minimum width per day column in px. When the available width is smaller 
     * than `7 * minDayWidth`, the body becomes horizontally scrollable while 
     * the hour column stays sticky to the left. 
     * @default 140 
     */ 
    minDayWidth?: number; 
    format?: '12h' | '24h'; 
    showCurrentTime?: boolean; 
    showCurrentTimeLabel?: boolean; 
    currentTimeSpan?: 'today' | 'week'; 
    currentTimeColor?: 'red' | 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    currentTimeDimOtherDays?: boolean; 
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
    showFocusIndicator?: boolean; 
    showNowPill?: boolean; 
}
