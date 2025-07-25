import React from 'react';

interface WeekViewProps {
  displayDate: any;
  events: any[];
  schedulesByDay: Map<string, any[]>;
  layersById: Map<string, any>;
  system: string;
  hourHeight: number;
  onEventClick: (event: any) => void;
  onEventAdd: (date: any, time?: string) => void;
  onEventMove?: (eventId: string, newDayTimestamp: number, newStartTime?: string) => void;
  onDateClick: (date: any) => void;
  showTodayIndicator: boolean;
  showHolidayIndicators: boolean;
  showScheduleIndicators: boolean;
}

export const WeekView: React.FC<WeekViewProps> = (props) => {
  return (
    <div className="calendar-week-view">
      <div className="calendar-week-placeholder">
        Week View - Coming Soon
      </div>
    </div>
  );
}; 