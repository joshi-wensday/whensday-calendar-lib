import React from 'react';
import { CalendarView, CalendarSystem } from '../types';

interface CalendarHeaderProps {
  currentMonthName: string;
  currentYear: number;
  view: CalendarView;
  system: CalendarSystem;
  onViewChange: (view: CalendarView) => void;
  onSystemChange: (system: CalendarSystem) => void;
  onNextPeriod: () => void;
  onPrevPeriod: () => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonthName,
  currentYear,
  view,
  system,
  onViewChange,
  onSystemChange,
  onNextPeriod,
  onPrevPeriod,
  onToday,
}) => {
  const views: CalendarView[] = ['month', 'week', 'day'];

  const getViewButtonClasses = (buttonView: CalendarView) => {
    const base = "calendar-view-button";
    if (view === buttonView) {
      return `${base} calendar-view-button-active`;
    }
    return `${base} calendar-view-button-inactive`;
  };

  return (
    <div className="calendar-header">
      {/* Top Row: Title and System Toggle */}
      <div className="calendar-header-top">
        <h2 className="calendar-title">
          {currentMonthName} <span className="calendar-year">{currentYear}</span>
        </h2>
        <button 
          onClick={() => onSystemChange(system === 'gregorian' ? 'whensday' : 'gregorian')} 
          className="calendar-system-toggle"
        >
          {system === 'whensday' ? 'Whensday' : 'Gregorian'}
        </button>
      </div>

      {/* Bottom Row: Navigation and View Toggles */}
      <div className="calendar-header-bottom">
        <div className="calendar-navigation">
          <button onClick={onPrevPeriod} className="calendar-nav-button" aria-label="Previous period">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={onToday} className="calendar-today-button">
            Today
          </button>
          <button onClick={onNextPeriod} className="calendar-nav-button" aria-label="Next period">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="calendar-view-toggles">
          {views.map(v => (
            <button 
              key={v} 
              onClick={() => onViewChange(v)} 
              className={getViewButtonClasses(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 