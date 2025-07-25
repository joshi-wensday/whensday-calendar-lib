// Import styles
import './styles/index.css';

// Main Calendar Component
export { Calendar } from './components/Calendar';

// Individual View Components
export { MonthView } from './components/MonthView';
export { WeekView } from './components/WeekView';
export { DayView } from './components/DayView';
export { CalendarHeader } from './components/CalendarHeader';
export { DayColumn } from './components/DayColumn';
export { TimeGutter } from './components/TimeGutter';

// Hooks
export { useCalendar } from './hooks/useCalendar';

// Types
export type {
  WhensdayDate,
  DayInGrid,
  CalendarDay,
  CalendarSystem,
  CalendarView,
  Layer,
  Event,
  EventType,
  DuePeriod,
  LocationDetails,
  Schedule,
  SchedulePattern,
  HolidaySettings,
  ScheduleExemption,
  DragState,
  UserSettings,
  CalendarState,
  CalendarEventHandlers,
  CalendarTheme,
  CalendarProps,
} from './types';

// Utilities
export {
  gregorianToWhensday,
  whensdayToGregorian,
  getDaysInWhensdayMonth,
  getFirstDayOfWeekForMonth,
  isLeapYear,
  dayInGridToDate,
  areDayInGridEqual,
  daysBetween,
  areUniversalDaysEqual,
  universalDateToDayInGrid,
  formatUniversalDate,
} from './utils/whensdayService';

// Constants
export {
  WHENSDAY_MONTHS,
  SOL_MONTH_INDEX,
  GREGORIAN_MONTH_NAMES,
  DEFAULT_COLORS,
  DEFAULT_THEME,
  WEEK_DAYS,
  WEEK_DAYS_FULL,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  MINUTES_IN_DAY,
  DEFAULT_HOUR_HEIGHT,
} from './constants';

// Hook types
export type { ScheduleState, ScheduleForDay } from './hooks/useCalendar'; 