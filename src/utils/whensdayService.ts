import { WhensdayDate, DayInGrid, CalendarSystem } from '../types';
import { WHENSDAY_MONTHS, SOL_MONTH_INDEX, GREGORIAN_MONTH_NAMES } from '../constants';

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const getDaysInWhensdayMonth = (monthIndex: number, year: number): number => {
  if (monthIndex === SOL_MONTH_INDEX && isLeapYear(year)) {
    return 29; // Sol has 29 days in leap years
  }
  return 28; // All months have 28 days normally
};

export const gregorianToWhensday = (gregorianDate: Date): WhensdayDate => {
  const year = gregorianDate.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const dateInUtc = Date.UTC(year, gregorianDate.getUTCMonth(), gregorianDate.getUTCDate());
  
  const dayOfYear = Math.floor((dateInUtc - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

  // January 1st is Weensday
  if (dayOfYear === 1) {
    return { 
      year, 
      month: -1, 
      day: 1, 
      monthName: 'Weensday', 
      isWeensday: true 
    };
  }

  // Calculate days into the 13-month calendar (starting from January 2nd)
  let whensdayDayCount = dayOfYear - 1;
  const leap = isLeapYear(year);

  let monthIndex = 0;
  for (monthIndex = 0; monthIndex < WHENSDAY_MONTHS.length; monthIndex++) {
    const daysInThisMonth = getDaysInWhensdayMonth(monthIndex, year);
    if (whensdayDayCount <= daysInThisMonth) {
      break;
    }
    whensdayDayCount -= daysInThisMonth;
  }
  
  // Handle case where date is beyond the last day of the year
  if (monthIndex >= WHENSDAY_MONTHS.length) {
    const lastMonth = WHENSDAY_MONTHS.length - 1;
    return {
      year,
      month: lastMonth,
      day: getDaysInWhensdayMonth(lastMonth, year),
      monthName: WHENSDAY_MONTHS[lastMonth],
    };
  }

  const dayOfMonth = whensdayDayCount;

  return {
    year,
    month: monthIndex,
    day: dayOfMonth,
    monthName: WHENSDAY_MONTHS[monthIndex],
    isWhensday: leap && monthIndex === SOL_MONTH_INDEX && dayOfMonth === 15,
  };
};

export const whensdayToGregorian = (whensdayDate: WhensdayDate): Date => {
  // Handle Weensday (January 1st)
  if (whensdayDate.isWeensday || whensdayDate.month === -1) {
    return new Date(Date.UTC(whensdayDate.year, 0, 1));
  }

  let dayCount = 0;
  // Count days from all previous months
  for (let i = 0; i < whensdayDate.month; i++) {
    dayCount += getDaysInWhensdayMonth(i, whensdayDate.year);
  }
  // Add days in current month
  dayCount += whensdayDate.day;

  // Add 1 because January 1st is Weensday
  const gregorianDayOfYear = dayCount + 1;
  
  return new Date(Date.UTC(whensdayDate.year, 0, gregorianDayOfYear));
};

export const getFirstDayOfWeekForMonth = (monthIndex: number, year: number): number => {
  const firstDayOfWhensdayMonth: WhensdayDate = {
    year,
    month: monthIndex,
    day: 1,
    monthName: WHENSDAY_MONTHS[monthIndex],
  };
  const gregorianDate = whensdayToGregorian(firstDayOfWhensdayMonth);
  return gregorianDate.getUTCDay(); // 0 for Sunday
};

// Helper to convert any DayInGrid to a standard JS Date for calculations
export const dayInGridToDate = (day: DayInGrid, system: CalendarSystem): Date => {
  if (system === 'gregorian') {
    return new Date(Date.UTC(day.year, day.month, day.day));
  }
  // It's a whensday date, convert it
  return whensdayToGregorian({ 
    ...day, 
    monthName: WHENSDAY_MONTHS[day.month] || 'Weensday',
    isWeensday: day.month === -1, 
    isWhensday: !!day.isWhensdayLeapDay 
  });
};

export const areDayInGridEqual = (day1: DayInGrid, day2: DayInGrid): boolean => {
  return day1.year === day2.year && day1.month === day2.month && day1.day === day2.day;
};

export const daysBetween = (startDate: Date, endDate: Date): number => {
  const startUTC = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const endUTC = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  return Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24));
};

// --- Universal Timestamp Helpers ---

export const areUniversalDaysEqual = (ts1: number, ts2: number): boolean => {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
         d1.getUTCMonth() === d2.getUTCMonth() &&
         d1.getUTCDate() === d2.getUTCDate();
};

export const universalDateToDayInGrid = (ts: number, system: CalendarSystem): DayInGrid => {
  const date = new Date(ts);
  if (system === 'whensday') {
    const wd = gregorianToWhensday(date);
    return { 
      year: wd.year, 
      month: wd.month, 
      day: wd.day, 
      monthName: wd.monthName, 
      isWhensdayLeapDay: wd.isWhensday 
    };
  } else { // gregorian
    const month = date.getUTCMonth();
    return {
      year: date.getUTCFullYear(),
      month,
      day: date.getUTCDate(),
      monthName: GREGORIAN_MONTH_NAMES[month]
    };
  }
};

export const formatUniversalDate = (ts: number | null | undefined, system: CalendarSystem): string => {
  if (!ts) return 'Not Set';
  const dayInGrid = universalDateToDayInGrid(ts, system);
  return `${dayInGrid.monthName} ${dayInGrid.day}, ${dayInGrid.year}`;
}; 