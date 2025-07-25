import React, { useMemo, useRef, useEffect, useState } from 'react';
import { 
    DayInGrid, CalendarDay, Event, Layer, DragState, CalendarSystem 
} from '../types';
import { DayColumn, ScheduleForDay } from './DayColumn';
import { TimeGutter } from './TimeGutter';
import { dayInGridToDate, areUniversalDaysEqual } from '../utils/whensdayService';

interface DayViewProps {
    displayDate: DayInGrid;
    events: Event[];
    schedulesByDay: Map<string, ScheduleForDay[]>;
    layersById: Map<string, Layer>;
    system: CalendarSystem;
    hourHeight: number;
    onEventClick: (event: Event) => void;
    onEventAdd: (date: DayInGrid, time?: string) => void;
    onEventMove?: (eventId: string, newDayTimestamp: number, newStartTime?: string) => void;
    onDateClick: (date: DayInGrid) => void;
    showTodayIndicator: boolean;
    showHolidayIndicators: boolean;
    showScheduleIndicators: boolean;
}

const getDayKey = (date: DayInGrid) => `${date.year}-${date.month}-${date.day}`;
const WEEK_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DayHeader: React.FC<{
    day: CalendarDay,
    dayName: string,
    allDayEvents: Event[],
    schedules: ScheduleForDay[],
    layersById: Map<string, Layer>,
    onEventClick: (event: Event) => void,
    onAllDayDrop: (e: React.DragEvent, day: DayInGrid) => void,
    onDragOver: (e: React.DragEvent) => void,
    isDraggingOver: boolean,
    showTodayIndicator: boolean,
    showHolidayIndicators: boolean,
    showScheduleIndicators: boolean
}> = ({ 
    day, dayName, allDayEvents, schedules, layersById, onEventClick, 
    onAllDayDrop, onDragOver, isDraggingOver, showTodayIndicator,
    showHolidayIndicators, showScheduleIndicators 
}) => {
    const hasHoliday = schedules.some(s => s.state === 'holiday');
    const isBonusDay = schedules.some(s => s.state === 'bonus');
    const onSchedulesForPills = schedules.filter(s => s.state === 'on' || s.state === 'bonus');

    const handleAllDayDragStart = (e: React.DragEvent, eventId: string) => {
        e.dataTransfer.setData("text/plain", eventId);
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <div className={`calendar-day-header ${isDraggingOver ? 'calendar-day-header-dragging' : ''}`}>
             <div className="calendar-day-header-content">
                {showScheduleIndicators && (
                    <div className="calendar-schedule-pills">
                        {onSchedulesForPills.map(sfd => (
                            <div 
                                key={sfd.schedule.id}
                                className="calendar-schedule-pill"
                                style={{ 
                                    backgroundColor: sfd.color,
                                    opacity: sfd.isCompleted ? 1 : 0.7 
                                }}
                                title={`${sfd.schedule.name} - ${sfd.isCompleted ? 'completed' : 'pending'}`}
                            />
                        ))}
                    </div>
                )}
                <div className="calendar-day-info">
                    {showHolidayIndicators && hasHoliday && (
                        <div className="calendar-holiday-indicator" title="Holiday Booked">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 5a3 3 0 015.252-2.121l.738.646.738-.646A3 3 0 0115 5v2.25a.75.75 0 01-1.5 0V5a1.5 1.5 0 00-2.625-1.06l-.738.646-.738-.646A1.5 1.5 0 006.5 5v2.25a.75.75 0 01-1.5 0V5zm1.5 4.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM12.5 9.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    {isBonusDay && (
                        <div className="calendar-bonus-indicator" title="Bonus Day">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                    )}
                    <span className="calendar-day-name">{dayName}</span>
                    <p className={`calendar-day-number ${day.isToday && showTodayIndicator ? 'calendar-day-today' : ''}`}>
                        {day.date.day}
                    </p>
                </div>
            </div>
            <div className="calendar-all-day-events" onDrop={(e) => onAllDayDrop(e, day.date)} onDragOver={onDragOver}>
                {allDayEvents.map(event => {
                    const layer = event.layerId ? layersById.get(event.layerId) : null;
                    if (!layer && event.layerId) return null;
                    const eventColor = event.color || layer?.color || '#6B7280';
                    return (
                        <div 
                            key={event.id} 
                            draggable 
                            onDragStart={(e) => handleAllDayDragStart(e, event.id)} 
                            data-event-id={event.id} 
                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }} 
                            className="calendar-all-day-event"
                            style={{ backgroundColor: eventColor }}
                        >
                            {event.name}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const DayView: React.FC<DayViewProps> = ({
    displayDate,
    events,
    schedulesByDay,
    layersById,
    system,
    hourHeight,
    onEventClick,
    onEventAdd,
    onEventMove,
    onDateClick,
    showTodayIndicator,
    showHolidayIndicators,
    showScheduleIndicators
}) => {
    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [ghostTopPercent, setGhostTopPercent] = useState<number | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const todayGregorian = useMemo(() => new Date(), []);
    const todayComparableTimestamp = useMemo(() => 
        new Date(Date.UTC(todayGregorian.getFullYear(), todayGregorian.getMonth(), todayGregorian.getDate())).getTime(), 
        [todayGregorian]
    );

    const hourLabelInterval = useMemo(() => 
        (hourHeight > 12 ? 1 : hourHeight > 8 ? 2 : hourHeight > 5 ? 3 : 4), 
        [hourHeight]
    );
    
    const day: CalendarDay = useMemo(() => {
        const dateTimestamp = dayInGridToDate(displayDate, system).getTime();
        return { 
            date: displayDate, 
            isToday: areUniversalDaysEqual(dateTimestamp, todayComparableTimestamp), 
            isCurrentMonth: true 
        };
    }, [displayDate, system, todayComparableTimestamp]);

    const dayName = useMemo(() => 
        WEEK_DAY_NAMES[dayInGridToDate(displayDate, system).getUTCDay()], 
        [displayDate, system]
    );
    
    const daySchedules = schedulesByDay.get(getDayKey(day.date)) || [];
    
    const { allDayEvents, timedEvents } = useMemo(() => {
        const gridDayTimestamp = dayInGridToDate(day.date, system).getTime();
        const dayEvents = events.filter(event => areUniversalDaysEqual(event.startDate, gridDayTimestamp));
        return {
            allDayEvents: dayEvents.filter(e => e.isAllDay),
            timedEvents: dayEvents.filter(e => !e.isAllDay)
        };
    }, [events, day.date, system]);
    
    const parseTime = (timeStr: string): number => { 
        const [h, m] = timeStr.split(':').map(Number); 
        return h * 60 + m; 
    };

    const handleDragStart = (e: React.DragEvent, event: Event) => {
        const layer = event.layerId ? layersById.get(event.layerId) : null;
        if ((!layer && event.layerId) || !event.startTime || !event.endTime) return;
        
        const ghostLayer = layer || { id: 'ghost', name: 'Ghost', color: '#6B7280', isVisible: true };
        const eventRect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - eventRect.top;
        const duration = Math.max(15, parseTime(event.endTime) - parseTime(event.startTime));
        const ghostHeightPercent = (duration / (24 * 60)) * 100;
        
        setDragState({ 
            eventId: event.id, 
            offsetY, 
            ghostHeightPercent, 
            layer: ghostLayer, 
            event 
        });
        
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        e.dataTransfer.setData("text/plain", event.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleTimedDragOver = (e: React.DragEvent, columnRef: React.RefObject<HTMLDivElement>) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = "move";
        if (!dragState || !columnRef.current) return;
        
        setIsDraggingOver(true);
        const columnRect = columnRef.current.getBoundingClientRect();
        setGhostTopPercent((e.clientY - columnRect.top - dragState.offsetY) / columnRect.height * 100);
    };

    const handleAllDayDragOver = (e: React.DragEvent) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = "move";
        setIsDraggingOver(true);
        setGhostTopPercent(null);
    };
    
    const handleDrop = (e: React.DragEvent, day: DayInGrid, isAllDayDrop: boolean) => {
        e.preventDefault();
        const eventId = e.dataTransfer.getData("text/plain");
        if (!eventId || !onEventMove) return;

        const newDayTimestamp = dayInGridToDate(day, system).getTime();

        if (isAllDayDrop) {
            onEventMove(eventId, newDayTimestamp);
        } else if (ghostTopPercent !== null && dragState) {
            const minutesInDay = 24 * 60;
            const snappedMinute = Math.round(((ghostTopPercent / 100) * minutesInDay) / 15) * 15;
            const finalMinute = Math.max(0, Math.min(minutesInDay - 1, snappedMinute));
            const newStartTime = `${String(Math.floor(finalMinute / 60)).padStart(2, '0')}:${String(finalMinute % 60).padStart(2, '0')}`;
            onEventMove(dragState.eventId, newDayTimestamp, newStartTime);
        }
        handleDragEnd();
    };

    const handleDragEnd = () => { 
        setDragState(null); 
        setGhostTopPercent(null); 
        setIsDraggingOver(false); 
    };

    // Auto-scroll to 6 AM
    useEffect(() => {
        if (timelineContainerRef.current) {
            timelineContainerRef.current.scrollTop = 6 * (hourHeight / 4) * 16;
        }
    }, [displayDate, hourHeight]); 

    return (
        <div className="calendar-day-view">
            {/* Header Section */}
            <div className="calendar-day-view-header">
                <div className="calendar-day-view-header-spacer"></div>
                <div className="calendar-day-view-header-content">
                    <DayHeader
                        day={day}
                        dayName={dayName}
                        allDayEvents={allDayEvents}
                        schedules={daySchedules}
                        layersById={layersById}
                        onEventClick={onEventClick}
                        onAllDayDrop={(e, d) => handleDrop(e, d, true)}
                        onDragOver={handleAllDayDragOver}
                        isDraggingOver={isDraggingOver && ghostTopPercent === null}
                        showTodayIndicator={showTodayIndicator}
                        showHolidayIndicators={showHolidayIndicators}
                        showScheduleIndicators={showScheduleIndicators}
                    />
                </div>
            </div>

            {/* Timeline Section */}
            <div className="calendar-day-view-timeline" ref={timelineContainerRef}>
                <div className="calendar-day-view-timeline-content">
                    <TimeGutter hourHeight={hourHeight} hourLabelInterval={hourLabelInterval} />
                    <div className="calendar-day-view-column">
                        <DayColumn
                            day={day}
                            timedEvents={timedEvents}
                            schedules={daySchedules}
                            onTimeSlotClick={(date, time) => onEventAdd(date, time)}
                            onEventClick={onEventClick}
                            hourHeight={hourHeight}
                            system={system}
                            layersById={layersById}
                            dragState={dragState}
                            ghostTopPercent={ghostTopPercent}
                            isDraggingOver={isDraggingOver}
                            onDragStart={handleDragStart}
                            onDragOver={handleTimedDragOver}
                            onDrop={(e, d) => handleDrop(e, d, false)}
                            onDragEnd={handleDragEnd}
                            onEventMove={onEventMove}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}; 