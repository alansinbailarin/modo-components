import type { CalendarEvent } from './MonthView.interface'; 
 
export interface AgendaView { 
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
    daysToShow?: number; 
    daysBefore?: number; 
    showEmptyDays?: boolean; 
    showHeader?: boolean; 
    showMonthSeparator?: boolean; 
    showYearNavigation?: boolean; 
    showMonthYearSelects?: boolean; 
    showTodayButton?: boolean; 
    dayNameFormat?: 'narrow' | 'short' | 'long'; 
    dayNameCase?: 'upper' | 'lower' | 'capitalize' | 'normal'; 
    format?: '12h' | '24h'; 
    readonly?: boolean; 
    highlightedDates?: Date[]; 
    disabledDates?: Date[]; 
    disabledWeekdays?: number[]; 
    emptyText?: string; 
    loadMoreChunk?: number; 
    enableKeyboardNavigation?: boolean; 
}
