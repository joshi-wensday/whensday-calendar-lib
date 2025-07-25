import React from 'react';

// Core Calendar Types
export interface WhensdayDate {
  year: number;
  month: number; // 0-12 for months, -1 for Weensday
  day: number;
  monthName: string;
  isWeensday?: boolean;
  isWhensday?: boolean; // The leap day
}

export interface DayInGrid {
  year: number;
  month: number;
  day: number;
  monthName: string;
  isWhensdayLeapDay?: boolean;
}

export interface CalendarDay {
  date: DayInGrid;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export type CalendarSystem = 'whensday' | 'gregorian';
export type CalendarView = 'month' | 'week' | 'day';

// Layer and Organization Types
export interface Layer {
  id: string;
  name: string;
  color: string; // Hex color string
  isVisible: boolean;
  parentId?: string;
}

// Event Types
export type EventType = 'event' | 'deadline' | 'task' | 'birthday';
export type DuePeriod = 'morning' | 'afternoon' | 'evening';

export interface LocationDetails {
  name: string;
  placeId: string; // Google Maps Place ID
}

export interface Event {
  id: string;
  name: string;
  layerId: string | null;
  color?: string;
  startDate: number; // Universal timestamp (UTC). For Deadlines, this is the Due Date
  endDate?: number; // Universal timestamp (UTC)
  eventType: EventType;
  isAllDay: boolean;
  location?: LocationDetails | null;
  startLocation?: LocationDetails | null;
  endLocation?: LocationDetails | null;
  isCompleted?: boolean;
  tags?: string[];
  // Optional fields based on event type
  startTime?: string;
  endTime?: string;
  travelTimeBefore?: number; // In minutes
  travelTimeAfter?: number; // In minutes
  doByDate?: number; // Universal timestamp (UTC). Personal goal date for deadlines
  doByTime?: string; // Personal goal for deadlines
  dueTime?: string;
  duePeriod?: DuePeriod; // For tasks
  // Recurrence
  isRecurring?: boolean;
  naturalLanguageRule?: string; // "every 2nd Tuesday"
  recurrenceRule?: string; // iCalendar RRULE string
}

// Schedule Types
export interface SchedulePattern {
  on: number;
  off: number;
}

export interface HolidaySettings {
  enabled: boolean;
  onDays: number;
  holidays: number;
  bonusDayRate: number;
}

export interface ScheduleExemption {
  id: string;
  startDate: number; // Universal timestamp (UTC)
  endDate: number; // Universal timestamp (UTC)
  resumeAfter: number; // 0-indexed day in the pattern
}

export interface Schedule {
  id: string;
  name: string;
  layerId: string | null; // Can be independent of a layer
  color: string | null; // Optional custom color override. If null, it inherits from the layer.
  startDate: number; // Universal timestamp (UTC)
  endDate?: number; // Universal timestamp (UTC)
  pattern: SchedulePattern;
  isVisible: boolean;
  // Holiday Tracking
  initialHolidayBalance?: number; // Replaces holidaysEarned
  bookedHolidays?: number[]; // Array of UTC timestamps
  completedDays?: number[]; // Array of UTC timestamps
  holidaySettings?: HolidaySettings;
  // Exemptions & Bonus Days
  exemptions?: ScheduleExemption[];
  bonusDays?: number[]; // Array of UTC timestamps
}

// Drag and Drop Types
export interface DragState {
  eventId: string;
  offsetY: number; // Mouse offset from top of dragged item
  ghostHeightPercent: number; // Height of ghost in percent
  layer: Layer; // Can be a temporary ghost layer
  event: Event;
}

// User Settings
export interface UserSettings {
  homeAddress: LocationDetails | null;
}

// Calendar State
export interface CalendarState {
  view: CalendarView;
  system: CalendarSystem;
  displayDate: DayInGrid;
  calendarGrid: CalendarDay[];
  currentMonthName: string;
  currentYear: number;
  hourHeight: number;
}

// Event Handlers
export interface CalendarEventHandlers {
  onEventClick?: (event: Event) => void;
  onEventAdd?: (date: DayInGrid, time?: string) => void;
  onEventUpdate?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
  onEventMove?: (eventId: string, newDayTimestamp: number, newStartTime?: string) => void;
  onDateClick?: (date: DayInGrid) => void;
  onViewChange?: (view: CalendarView) => void;
  onSystemChange?: (system: CalendarSystem) => void;
}

// Theme and Styling
export interface CalendarTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    today: string;
    whensdayLeap: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Props for main calendar component
export interface CalendarProps {
  // Data
  events?: Event[];
  layers?: Layer[];
  schedules?: Schedule[];
  
  // State
  view?: CalendarView;
  system?: CalendarSystem;
  displayDate?: DayInGrid;
  
  // Event handlers
  onEventClick?: (event: Event) => void;
  onEventAdd?: (date: DayInGrid, time?: string) => void;
  onEventUpdate?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
  onEventMove?: (eventId: string, newDayTimestamp: number, newStartTime?: string) => void;
  onDateClick?: (date: DayInGrid) => void;
  onViewChange?: (view: CalendarView) => void;
  onSystemChange?: (system: CalendarSystem) => void;
  
  // Customization
  theme?: Partial<CalendarTheme>;
  className?: string;
  style?: React.CSSProperties;
  
  // Features
  enableDragAndDrop?: boolean;
  enableScheduleManagement?: boolean;
  enableHolidayBooking?: boolean;
  enableTravelTime?: boolean;
  enableRecurringEvents?: boolean;
  
  // Display options
  showWeekNumbers?: boolean;
  showTodayIndicator?: boolean;
  showHolidayIndicators?: boolean;
  showScheduleIndicators?: boolean;
  
  // Localization
  locale?: string;
  weekStart?: 0 | 1; // 0 = Sunday, 1 = Monday
} 