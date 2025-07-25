import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { DayInGrid, Event, Layer, CalendarDay, CalendarSystem } from '../types';
import { dayInGridToDate, areUniversalDaysEqual } from '../utils/whensdayService';

interface ScheduleForDay {
    schedule: any;
    color: string;
    state: 'on' | 'off' | 'holiday' | 'exemption' | 'bonus';
    isCompleted: boolean;
}

interface MonthViewProps {
    calendarGrid: CalendarDay[];
    events: Event[];
    schedulesByDay: Map<string, ScheduleForDay[]>;
    layersById: Map<string, Layer>;
    system: CalendarSystem;
    onEventClick: (event: Event) => void;
    onEventAdd: (date: DayInGrid, time?: string) => void;
    onEventMove?: (eventId: string, newDayTimestamp: number, newStartTime?: string) => void;
    onDateClick: (date: DayInGrid) => void;
    showTodayIndicator: boolean;
    showHolidayIndicators: boolean;
    showScheduleIndicators: boolean;
}

const EventPill: React.FC<{ 
    event: Event, 
    color: string, 
    onDragStart: (e: React.DragEvent) => void, 
    onClick: (e: React.MouseEvent) => void 
}> = ({ event, color, onDragStart, onClick }) => (
    <div 
        data-event-pill="true"
        draggable
        onDragStart={onDragStart}
        onClick={onClick} 
        style={{ backgroundColor: color }} 
        className="calendar-event-pill"
    >
        {event.name}
    </div>
);

const TaskPill: React.FC<{ 
    event: Event, 
    color: string, 
    onEventClick: (event: Event) => void, 
    onDragStart: (e: React.DragEvent) => void,
    onToggleComplete?: (event: Event) => void
}> = ({ event, color, onEventClick, onDragStart, onToggleComplete }) => {
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleComplete) {
            onToggleComplete({ ...event, isCompleted: !event.isCompleted });
        }
    };

    return (
        <div 
            data-event-pill="true"
            draggable
            onDragStart={onDragStart}
            style={{ backgroundColor: color, color: '#FFF' }}
            className="calendar-task-pill"
            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
        >
            <div onClick={handleToggle} className="calendar-task-checkbox">
                <input 
                    type="checkbox"
                    readOnly
                    checked={!!event.isCompleted}
                    className="calendar-checkbox"
                />
            </div>
            <span className={`calendar-task-text ${event.isCompleted ? 'calendar-task-completed' : ''}`}>
                {event.name}
            </span>
        </div>
    );
};

const getDayKey = (date: DayInGrid) => `${date.year}-${date.month}-${date.day}`;

const DayCell: React.FC<{
    day: CalendarDay;
    daySchedules: ScheduleForDay[];
    dayEvents: Event[];
    onEventAdd: (date: DayInGrid) => void;
    onEventClick: (event: Event) => void;
    onEventToggle?: (event: Event) => void;
    onDragStart: (e: React.DragEvent, eventId: string) => void;
    onDrop: (e: React.DragEvent, day: DayInGrid) => void;
    setDraggingOverDay: (key: string | null) => void;
    isDraggingOver: boolean;
    system: CalendarSystem;
    layersById: Map<string, Layer>;
    showTodayIndicator: boolean;
    showHolidayIndicators: boolean;
    showScheduleIndicators: boolean;
}> = ({ 
    day, daySchedules, dayEvents, onEventAdd, onEventClick, onEventToggle,
    onDragStart, onDrop, setDraggingOverDay, isDraggingOver, system, layersById,
    showTodayIndicator, showHolidayIndicators, showScheduleIndicators
}) => {
    const pressTimer = useRef<number | null>(null);
    const longPressTriggered = useRef(false);

    // Refs and state for scrollable events
    const eventsContainerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [hiddenEventsCount, setHiddenEventsCount] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    useLayoutEffect(() => {
        const container = eventsContainerRef.current;
        if (!container) return;

        const checkOverflow = () => {
            const hasOverflow = container.scrollHeight > container.clientHeight;
            setIsOverflowing(hasOverflow);
            
            if (hasOverflow) {
                const pillHeight = 26; // Approx height of a pill + margin
                const visibleCount = Math.floor(container.clientHeight / pillHeight);
                const hiddenCount = dayEvents.length - visibleCount;
                setHiddenEventsCount(Math.max(0, hiddenCount));
            } else {
                 setHiddenEventsCount(0);
            }
            
            const scrolled = container.scrollTop > 0;
            setIsScrolled(scrolled);
        };

        checkOverflow();
        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(container);

        container.addEventListener('scroll', checkOverflow);
        return () => {
            resizeObserver.disconnect();
            container.removeEventListener('scroll', checkOverflow);
        };
    }, [dayEvents.length]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target !== e.currentTarget) return;
        longPressTriggered.current = false;
        pressTimer.current = window.setTimeout(() => {
            longPressTriggered.current = true;
            onEventAdd(day.date);
        }, 500);
    };

    const handleMouseUp = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (e.target !== e.currentTarget) return;
        if (longPressTriggered.current) return;
        // Single click - could navigate to day view or just select
    };

    const handleDragEnter = () => setDraggingOverDay(getDayKey(day.date));
    const handleDragLeave = (e: React.DragEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDraggingOverDay(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleEventDragStart = (e: React.DragEvent, eventId: string) => {
        onDragStart(e, eventId);
    };

    // Schedule indicators
    const hasHoliday = daySchedules.some(s => s.state === 'holiday');
    const isBonusDay = daySchedules.some(s => s.state === 'bonus');
    const onSchedulesForPills = daySchedules.filter(s => s.state === 'on' || s.state === 'bonus');

    return (
        <div 
            className={`calendar-month-day ${day.isCurrentMonth ? 'calendar-month-day-current' : 'calendar-month-day-other'} ${day.isToday && showTodayIndicator ? 'calendar-month-day-today' : ''} ${isDraggingOver ? 'calendar-month-day-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, day.date)}
        >
            {day.isCurrentMonth && (
                <>
                    {/* Day Header */}
                    <div className="calendar-month-day-header">
                        {/* Schedule Pills */}
                        {showScheduleIndicators && onSchedulesForPills.length > 0 && (
                            <div className="calendar-month-schedule-pills">
                                {onSchedulesForPills.map(sfd => (
                                    <div 
                                        key={sfd.schedule.id}
                                        className="calendar-month-schedule-pill"
                                        style={{ 
                                            backgroundColor: sfd.color,
                                            opacity: sfd.isCompleted ? 1 : 0.7 
                                        }}
                                        title={`${sfd.schedule.name} - ${sfd.isCompleted ? 'completed' : 'pending'}`}
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* Day Number and Indicators */}
                        <div className="calendar-month-day-info">
                            {showHolidayIndicators && hasHoliday && (
                                <div className="calendar-month-holiday-indicator" title="Holiday Booked">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 5a3 3 0 015.252-2.121l.738.646.738-.646A3 3 0 0115 5v2.25a.75.75 0 01-1.5 0V5a1.5 1.5 0 00-2.625-1.06l-.738.646-.738-.646A1.5 1.5 0 006.5 5v2.25a.75.75 0 01-1.5 0V5zm1.5 4.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM12.5 9.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            {isBonusDay && (
                                <div className="calendar-month-bonus-indicator" title="Bonus Day">
                                    <svg viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            )}
                            <span className="calendar-month-day-number">{day.date.day}</span>
                        </div>
                    </div>

                    {/* Whensday Leap Day */}
                    {day.date.isWhensdayLeapDay && (
                        <div className="calendar-whensday-leap">WHENSDAY</div>
                    )}

                    {/* Events */}
                    <div 
                        ref={eventsContainerRef}
                        className={`calendar-month-events ${isScrolled ? 'calendar-month-events-scrolled' : ''}`}
                    >
                        {dayEvents.map(event => {
                            const layer = event.layerId ? layersById.get(event.layerId) : null;
                            if (!layer && event.layerId) return null;
                            
                            const eventColor = event.color || layer?.color || '#6B7280';
                            
                            if (event.eventType === 'task') {
                                return (
                                    <TaskPill
                                        key={event.id}
                                        event={event}
                                        color={eventColor}
                                        onEventClick={onEventClick}
                                        onDragStart={(e) => handleEventDragStart(e, event.id)}
                                        onToggleComplete={onEventToggle}
                                    />
                                );
                            } else {
                                return (
                                    <EventPill
                                        key={event.id}
                                        event={event}
                                        color={eventColor}
                                        onDragStart={(e) => handleEventDragStart(e, event.id)}
                                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                    />
                                );
                            }
                        })}
                    </div>

                    {/* Overflow Indicator */}
                    {isOverflowing && (
                        <div className="calendar-month-overflow">
                            {hiddenEventsCount > 0 && (
                                <span className="calendar-month-overflow-text">
                                    +{hiddenEventsCount} more
                                </span>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export const MonthView: React.FC<MonthViewProps> = ({
    calendarGrid,
    events,
    schedulesByDay,
    layersById,
    system,
    onEventClick,
    onEventAdd,
    onEventMove,
    onDateClick,
    showTodayIndicator,
    showHolidayIndicators,
    showScheduleIndicators,
}) => {
    const [draggingOverDay, setDraggingOverDay] = useState<string | null>(null);

    const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group events by day
    const eventsByDay = useMemo(() => {
        const map = new Map<string, Event[]>();
        for (const day of calendarGrid) {
            if (!day.isCurrentMonth) continue;
            
            const dayKey = getDayKey(day.date);
            const gridDayTimestamp = dayInGridToDate(day.date, system).getTime();
            const dayEvents = events.filter(event => 
                areUniversalDaysEqual(event.startDate, gridDayTimestamp)
            );
            map.set(dayKey, dayEvents);
        }
        return map;
    }, [events, calendarGrid, system]);

    const handleDragStart = (e: React.DragEvent, eventId: string) => {
        e.dataTransfer.setData("text/plain", eventId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = (e: React.DragEvent, day: DayInGrid) => {
        e.preventDefault();
        const eventId = e.dataTransfer.getData("text/plain");
        if (!eventId || !onEventMove) return;

        const newDayTimestamp = dayInGridToDate(day, system).getTime();
        onEventMove(eventId, newDayTimestamp);
        setDraggingOverDay(null);
    };

    const handleEventToggle = (event: Event) => {
        // This would typically call an onEventUpdate callback
        // For now, we'll just call onEventClick
        onEventClick(event);
    };

    return (
        <div className="calendar-month-view">
            {/* Weekday Headers */}
            <div className="calendar-month-weekdays">
                {WEEK_DAYS.map(day => (
                    <div key={day} className="calendar-month-weekday">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-month-grid">
                {calendarGrid.map((day, index) => (
                    <DayCell
                        key={index}
                        day={day}
                        daySchedules={schedulesByDay.get(getDayKey(day.date)) || []}
                        dayEvents={eventsByDay.get(getDayKey(day.date)) || []}
                        onEventAdd={onEventAdd}
                        onEventClick={onEventClick}
                        onEventToggle={handleEventToggle}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        setDraggingOverDay={setDraggingOverDay}
                        isDraggingOver={draggingOverDay === getDayKey(day.date)}
                        system={system}
                        layersById={layersById}
                        showTodayIndicator={showTodayIndicator}
                        showHolidayIndicators={showHolidayIndicators}
                        showScheduleIndicators={showScheduleIndicators}
                    />
                ))}
            </div>
        </div>
    );
}; 