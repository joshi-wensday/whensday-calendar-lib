import { useState, useMemo, useCallback } from 'react';
import { 
  CalendarSystem, 
  CalendarView, 
  DayInGrid, 
  CalendarDay, 
  Event, 
  Layer, 
  Schedule,
  CalendarState 
} from '../types';
import { 
  gregorianToWhensday, 
  getDaysInWhensdayMonth, 
  getFirstDayOfWeekForMonth, 
  isLeapYear,
  dayInGridToDate,
  areUniversalDaysEqual,
  universalDateToDayInGrid
} from '../utils/whensdayService';
import { WHENSDAY_MONTHS, SOL_MONTH_INDEX, GREGORIAN_MONTH_NAMES } from '../constants';

export type ScheduleState = 'on' | 'off' | 'holiday' | 'exemption' | 'bonus';

export interface ScheduleForDay {
  schedule: Schedule;
  color: string;
  state: ScheduleState;
  isCompleted: boolean;
}

const getDayKey = (date: DayInGrid) => `${date.year}-${date.month}-${date.day}`;

// Helper function to get today's date in a specific calendar system
const getTodayInSystem = (system: CalendarSystem): DayInGrid => {
  const today = new Date();
  if (system === 'whensday') {
    const whensdayToday = gregorianToWhensday(today);
    return {
      year: whensdayToday.year,
      month: whensdayToday.month,
      day: whensdayToday.day,
      monthName: whensdayToday.monthName,
      isWhensdayLeapDay: whensdayToday.isWhensday,
    };
  } else {
    return {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
      monthName: GREGORIAN_MONTH_NAMES[today.getMonth()] || '',
    };
  }
};

export const useCalendar = (
  initialView: CalendarView = 'month',
  initialSystem: CalendarSystem = 'gregorian',
  initialDate?: DayInGrid
) => {
  // State
  const [view, setView] = useState<CalendarView>(initialView);
  const [system, setSystemState] = useState<CalendarSystem>(initialSystem);
  const [displayDate, setDisplayDate] = useState<DayInGrid>(() => {
    return initialDate || getTodayInSystem(initialSystem);
  });
  const [hourHeight, setHourHeight] = useState(8);

  // Get today's date in current system
  const todayInCurrentSystem = useMemo(() => getTodayInSystem(system), [system]);

  // Custom setSystem that converts the display date
  const setSystem = useCallback((newSystem: CalendarSystem) => {
    if (newSystem === system) return;
    
    // Convert current display date to new system
    const currentDate = dayInGridToDate(displayDate, system);
    const newDisplayDate = universalDateToDayInGrid(currentDate.getTime(), newSystem);
    
    setDisplayDate(newDisplayDate);
    setSystemState(newSystem);
  }, [displayDate, system]);

  // Calendar grid calculation
  const calendarGrid = useMemo((): CalendarDay[] => {
    const year = displayDate.year;
    const month = displayDate.month;
    const grid: CalendarDay[] = [];
    
    if (system === 'whensday') {
      const daysInMonth = getDaysInWhensdayMonth(month, year);
      const firstDayOfWeek = getFirstDayOfWeekForMonth(month, year);
      const monthName = WHENSDAY_MONTHS[month] || WHENSDAY_MONTHS[0];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        grid.push({ 
          date: { year, month, day: 0, monthName: '' }, 
          isToday: false, 
          isCurrentMonth: false 
        });
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === todayInCurrentSystem.day && 
                       month === todayInCurrentSystem.month && 
                       year === todayInCurrentSystem.year;
        const isLeap = isLeapYear(year);
        grid.push({
          date: { 
            year, 
            month, 
            day, 
            monthName, 
            isWhensdayLeapDay: isLeap && month === SOL_MONTH_INDEX && day === 15 
          },
          isToday,
          isCurrentMonth: true,
        });
      }
    } else {
      // Gregorian calendar
      const monthName = GREGORIAN_MONTH_NAMES[month];
      const firstDayOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = firstDayOfMonth.getDay();
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        grid.push({ 
          date: { year, month, day: 0, monthName: '' }, 
          isToday: false, 
          isCurrentMonth: false 
        });
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === todayInCurrentSystem.day && 
                       month === todayInCurrentSystem.month && 
                       year === todayInCurrentSystem.year;
        grid.push({
          date: { year, month, day, monthName },
          isToday,
          isCurrentMonth: true,
        });
      }
    }
    
    return grid;
  }, [displayDate, system, todayInCurrentSystem]);

  // Current month/year info
  const currentMonthName = useMemo(() => {
    if (system === 'whensday') {
      return WHENSDAY_MONTHS[displayDate.month] || WHENSDAY_MONTHS[0];
    } else {
      return GREGORIAN_MONTH_NAMES[displayDate.month] || '';
    }
  }, [displayDate.month, system]);

  const currentYear = displayDate.year;

  // Navigation functions
  const goToNextPeriod = useCallback(() => {
    setDisplayDate(prev => {
      if (system === 'whensday') {
        const monthLimit = 12; // 13 months (0-12)
        if (prev.month === monthLimit) {
          const newDate = getTodayInSystem(system);
          return { ...prev, year: prev.year + 1, month: 0, monthName: WHENSDAY_MONTHS[0] };
        } else {
          return { ...prev, month: prev.month + 1, monthName: WHENSDAY_MONTHS[prev.month + 1] };
        }
      } else {
        const monthLimit = 11; // 12 months (0-11)
        if (prev.month === monthLimit) {
          return { ...prev, year: prev.year + 1, month: 0, monthName: GREGORIAN_MONTH_NAMES[0] };
        } else {
          return { ...prev, month: prev.month + 1, monthName: GREGORIAN_MONTH_NAMES[prev.month + 1] };
        }
      }
    });
  }, [system]);

  const goToPrevPeriod = useCallback(() => {
    setDisplayDate(prev => {
      if (system === 'whensday') {
        const monthLimit = 12;
        if (prev.month === 0) {
          return { ...prev, year: prev.year - 1, month: monthLimit, monthName: WHENSDAY_MONTHS[monthLimit] };
        } else {
          return { ...prev, month: prev.month - 1, monthName: WHENSDAY_MONTHS[prev.month - 1] };
        }
      } else {
        const monthLimit = 11;
        if (prev.month === 0) {
          return { ...prev, year: prev.year - 1, month: monthLimit, monthName: GREGORIAN_MONTH_NAMES[monthLimit] };
        } else {
          return { ...prev, month: prev.month - 1, monthName: GREGORIAN_MONTH_NAMES[prev.month - 1] };
        }
      }
    });
  }, [system]);

  const goToToday = useCallback(() => {
    const todayDate = getTodayInSystem(system);
    setDisplayDate(todayDate);
  }, [system]);

  const goToDate = useCallback((date: DayInGrid) => {
    setDisplayDate(date);
  }, []);

  const toggleSystem = useCallback(() => {
    const newSystem = system === 'gregorian' ? 'whensday' : 'gregorian';
    setSystem(newSystem);
  }, [system, setSystem]);

  // Schedule calculations
  const useScheduleCalculations = (
    days: CalendarDay[], 
    schedules: Schedule[], 
    layersById: Map<string, Layer>, 
    visibleLayerIds: Set<string>,
    areSchedulesGloballyVisible: boolean = true
  ) => {
    return useMemo(() => {
      if (!areSchedulesGloballyVisible) {
        return new Map<string, ScheduleForDay[]>();
      }

      const schedulesByDay = new Map<string, ScheduleForDay[]>();
      
      for (const day of days) {
        if (!day.isCurrentMonth) continue;
        
        const dayKey = getDayKey(day.date);
        const dayTimestamp = dayInGridToDate(day.date, system).getTime();
        const daySchedules: ScheduleForDay[] = [];
        
        for (const schedule of schedules) {
          if (!schedule.isVisible) continue;
          if (schedule.layerId && !visibleLayerIds.has(schedule.layerId)) continue;
          
          // Calculate schedule state for this day
          const state = calculateScheduleState(schedule, dayTimestamp);
          if (state === 'off') continue;
          
          const layer = schedule.layerId ? layersById.get(schedule.layerId) : null;
          const color = schedule.color || layer?.color || '#6B7280';
          
          const isCompleted = schedule.completedDays?.includes(dayTimestamp) || false;
          
          daySchedules.push({
            schedule,
            color,
            state,
            isCompleted,
          });
        }
        
        if (daySchedules.length > 0) {
          schedulesByDay.set(dayKey, daySchedules);
        }
      }
      
      return schedulesByDay;
    }, [days, schedules, layersById, visibleLayerIds, system, areSchedulesGloballyVisible]);
  };

  // Helper function to calculate schedule state
  const calculateScheduleState = (schedule: Schedule, dayTimestamp: number): ScheduleState => {
    // Check if it's a holiday
    if (schedule.bookedHolidays?.includes(dayTimestamp)) {
      return 'holiday';
    }
    
    // Check if it's a bonus day
    if (schedule.bonusDays?.includes(dayTimestamp)) {
      return 'bonus';
    }
    
    // Check if it's in an exemption period
    if (schedule.exemptions) {
      for (const exemption of schedule.exemptions) {
        if (dayTimestamp >= exemption.startDate && dayTimestamp <= exemption.endDate) {
          return 'exemption';
        }
      }
    }
    
    // Calculate pattern state
    const daysSinceStart = Math.floor((dayTimestamp - schedule.startDate) / (1000 * 60 * 60 * 24));
    if (daysSinceStart < 0) return 'off';
    
    const patternLength = schedule.pattern.on + schedule.pattern.off;
    if (patternLength === 0) return 'off';
    
    const dayInPattern = daysSinceStart % patternLength;
    return dayInPattern < schedule.pattern.on ? 'on' : 'off';
  };

  return {
    // State
    view,
    system,
    displayDate,
    calendarGrid,
    currentMonthName,
    currentYear,
    hourHeight,
    
    // Setters
    setView,
    setSystem,
    setDisplayDate,
    setHourHeight,
    
    // Navigation
    goToNextPeriod,
    goToPrevPeriod,
    goToToday,
    goToDate,
    toggleSystem,
    
    // Utilities
    useScheduleCalculations,
    getDayKey,
  };
}; 