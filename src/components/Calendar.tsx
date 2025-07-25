import React, { useMemo } from 'react';
import { CalendarProps, CalendarTheme, Event, Layer, Schedule } from '../types';
import { DEFAULT_THEME } from '../constants';
import { useCalendar } from '../hooks/useCalendar';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';

export const Calendar: React.FC<CalendarProps> = ({
  // Data
  events = [],
  layers = [],
  schedules = [],
  
  // State
  view: initialView = 'month',
  system: initialSystem = 'gregorian',
  displayDate: initialDisplayDate,
  
  // Event handlers
  onEventClick,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  onEventMove,
  onDateClick,
  onViewChange,
  onSystemChange,
  
  // Customization
  theme: customTheme,
  className = '',
  style = {},
  
  // Features
  enableDragAndDrop = true,
  enableScheduleManagement = true,
  enableHolidayBooking = true,
  enableTravelTime = true,
  enableRecurringEvents = true,
  
  // Display options
  showWeekNumbers = false,
  showTodayIndicator = true,
  showHolidayIndicators = true,
  showScheduleIndicators = true,
  
  // Localization
  locale = 'en',
  weekStart = 0,
}) => {
  // Merge theme
  const theme = useMemo((): CalendarTheme => {
    return {
      ...DEFAULT_THEME,
      ...customTheme,
      colors: {
        ...DEFAULT_THEME.colors,
        ...customTheme?.colors,
      },
      fonts: {
        ...DEFAULT_THEME.fonts,
        ...customTheme?.fonts,
      },
      spacing: {
        ...DEFAULT_THEME.spacing,
        ...customTheme?.spacing,
      },
      borderRadius: {
        ...DEFAULT_THEME.borderRadius,
        ...customTheme?.borderRadius,
      },
    };
  }, [customTheme]);

  // Calendar hook
  const calendar = useCalendar(initialView, initialSystem, initialDisplayDate);

  // Layers by ID for quick lookup
  const layersById = useMemo(() => {
    return new Map(layers.map(layer => [layer.id, layer]));
  }, [layers]);

  // Visible layer IDs
  const visibleLayerIds = useMemo(() => {
    return new Set(layers.filter(layer => layer.isVisible).map(layer => layer.id));
  }, [layers]);

  // Filter visible events
  const visibleEvents = useMemo(() => {
    return events.filter(event => !event.layerId || visibleLayerIds.has(event.layerId));
  }, [events, visibleLayerIds]);

  // Schedule calculations
  const schedulesByDay = calendar.useScheduleCalculations(
    calendar.calendarGrid,
    schedules,
    layersById,
    visibleLayerIds,
    true // areSchedulesGloballyVisible
  );

  // Event handlers
  const handleViewChange = (newView: typeof initialView) => {
    calendar.setView(newView);
    onViewChange?.(newView);
  };

  const handleSystemChange = (newSystem: typeof initialSystem) => {
    calendar.setSystem(newSystem);
    onSystemChange?.(newSystem);
  };

  const handleEventClick = (event: Event) => {
    onEventClick?.(event);
  };

  const handleEventAdd = (date: any, time?: string) => {
    onEventAdd?.(date, time);
  };

  const handleEventMove = (eventId: string, newDayTimestamp: number, newStartTime?: string) => {
    onEventMove?.(eventId, newDayTimestamp, newStartTime);
  };

  const handleDateClick = (date: any) => {
    onDateClick?.(date);
  };

  // CSS variables for theme
  const themeStyles = useMemo(() => {
    return {
      '--calendar-primary': theme.colors.primary,
      '--calendar-secondary': theme.colors.secondary,
      '--calendar-accent': theme.colors.accent,
      '--calendar-background': theme.colors.background,
      '--calendar-surface': theme.colors.surface,
      '--calendar-text': theme.colors.text,
      '--calendar-text-secondary': theme.colors.textSecondary,
      '--calendar-border': theme.colors.border,
      '--calendar-today': theme.colors.today,
      '--calendar-whensday-leap': theme.colors.whensdayLeap,
      '--calendar-font-primary': theme.fonts.primary,
      '--calendar-font-secondary': theme.fonts.secondary,
      '--calendar-spacing-xs': theme.spacing.xs,
      '--calendar-spacing-sm': theme.spacing.sm,
      '--calendar-spacing-md': theme.spacing.md,
      '--calendar-spacing-lg': theme.spacing.lg,
      '--calendar-spacing-xl': theme.spacing.xl,
      '--calendar-border-radius-sm': theme.borderRadius.sm,
      '--calendar-border-radius-md': theme.borderRadius.md,
      '--calendar-border-radius-lg': theme.borderRadius.lg,
    } as React.CSSProperties;
  }, [theme]);

  return (
    <div 
      className={`whensday-calendar ${className}`}
      style={{ ...themeStyles, ...style }}
    >
      <div className="calendar-container">
        <CalendarHeader
          currentMonthName={calendar.currentMonthName}
          currentYear={calendar.currentYear}
          view={calendar.view}
          system={calendar.system}
          onViewChange={handleViewChange}
          onSystemChange={handleSystemChange}
          onNextPeriod={calendar.goToNextPeriod}
          onPrevPeriod={calendar.goToPrevPeriod}
          onToday={calendar.goToToday}
        />
        
        <div className="calendar-content">
          {calendar.view === 'month' && (
            <MonthView
              calendarGrid={calendar.calendarGrid}
              events={visibleEvents}
              schedulesByDay={schedulesByDay}
              layersById={layersById}
              system={calendar.system}
              onEventClick={handleEventClick}
              onEventAdd={handleEventAdd}
              onEventMove={enableDragAndDrop ? handleEventMove : undefined}
              onDateClick={handleDateClick}
              showTodayIndicator={showTodayIndicator}
              showHolidayIndicators={showHolidayIndicators}
              showScheduleIndicators={showScheduleIndicators}
            />
          )}
          
          {calendar.view === 'week' && (
            <WeekView
              displayDate={calendar.displayDate}
              events={visibleEvents}
              schedulesByDay={schedulesByDay}
              layersById={layersById}
              system={calendar.system}
              hourHeight={calendar.hourHeight}
              onEventClick={handleEventClick}
              onEventAdd={handleEventAdd}
              onEventMove={enableDragAndDrop ? handleEventMove : undefined}
              onDateClick={handleDateClick}
              showTodayIndicator={showTodayIndicator}
              showHolidayIndicators={showHolidayIndicators}
              showScheduleIndicators={showScheduleIndicators}
            />
          )}
          
          {calendar.view === 'day' && (
            <DayView
              displayDate={calendar.displayDate}
              events={visibleEvents}
              schedulesByDay={schedulesByDay}
              layersById={layersById}
              system={calendar.system}
              hourHeight={calendar.hourHeight}
              onEventClick={handleEventClick}
              onEventAdd={handleEventAdd}
              onEventMove={enableDragAndDrop ? handleEventMove : undefined}
              onDateClick={handleDateClick}
              showTodayIndicator={showTodayIndicator}
              showHolidayIndicators={showHolidayIndicators}
              showScheduleIndicators={showScheduleIndicators}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 