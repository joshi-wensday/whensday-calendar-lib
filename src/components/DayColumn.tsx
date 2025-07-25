import React, { useRef } from 'react';
import { DayInGrid, CalendarDay, Event, Layer, CalendarSystem, DragState } from '../types';
import { dayInGridToDate, areUniversalDaysEqual, universalDateToDayInGrid } from '../utils/whensdayService';

export interface ScheduleForDay {
    schedule: any;
    color: string;
    state: 'on' | 'off' | 'holiday' | 'exemption' | 'bonus';
    isCompleted: boolean;
}

interface DayColumnProps {
    day: CalendarDay;
    timedEvents: Event[];
    schedules: ScheduleForDay[];
    onTimeSlotClick: (date: DayInGrid, time: string) => void;
    onEventClick: (event: Event) => void;
    hourHeight: number;
    system: CalendarSystem;
    layersById: Map<string, Layer>;
    // D&D Props
    dragState: DragState | null;
    ghostTopPercent: number | null;
    isDraggingOver: boolean;
    onDragStart: (e: React.DragEvent, event: Event) => void;
    onDragOver: (e: React.DragEvent, columnRef: React.RefObject<HTMLDivElement>, day: DayInGrid) => void;
    onDrop: (e: React.DragEvent, day: DayInGrid) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onEventMove?: (eventId: string, newDayTimestamp: number, newStartTime?: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const parseTime = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

export const DayColumn: React.FC<DayColumnProps> = ({
    day, 
    timedEvents, 
    schedules,
    onTimeSlotClick, 
    onEventClick, 
    hourHeight,
    system,
    layersById,
    dragState, 
    ghostTopPercent, 
    isDraggingOver,
    onDragStart, 
    onDragOver, 
    onDrop, 
    onDragEnd
}) => {
    const columnRef = useRef<HTMLDivElement>(null);

    const handleTimeSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('[data-event-id]')) {
             return;
        }
        
        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const totalHeight = e.currentTarget.offsetHeight;
        const minutesInDay = 24 * 60;
        const clickedMinute = Math.floor((clickY / totalHeight) * minutesInDay);
        const clickedHour = Math.floor(clickedMinute / 60);
        const time = `${String(clickedHour).padStart(2, '0')}:00`;
        onTimeSlotClick(day.date, time);
    };

    const getScheduleBgStyle = (): React.CSSProperties => {
        const onSchedules = schedules.filter(s => s.state === 'on' || s.state === 'bonus');
        if (onSchedules.length === 0) return {};
    
        const completedCount = onSchedules.filter(s => s.isCompleted).length;
        const totalScheds = onSchedules.length;
        const completionRatio = totalScheds > 0 ? completedCount / totalScheds : 0;
            
        const style: React.CSSProperties = {
            opacity: 0.2 + (completionRatio * 0.2),
            filter: `brightness(${1 + (completionRatio * 0.3)})`,
            transition: 'opacity 0.2s ease-in-out, filter 0.2s ease-in-out',
        };

        if (onSchedules.length === 1) {
            style.backgroundColor = onSchedules[0].color;
        } else {
            const colors = onSchedules.map(s => s.color).join(', ');
            style.backgroundImage = `linear-gradient(45deg, ${colors})`;
        }
        return style;
    };

    const TravelTimeIndicator: React.FC<{ top: number, height: number, color: string }> = ({ top, height, color }) => {
        if (height <= 0) return null;
        return (
             <div
                className="calendar-travel-time"
                style={{ top: `${top}%`, height: `${height}%` }}
             >
                <div 
                    className="calendar-travel-time-bar"
                    style={{
                        backgroundColor: color,
                        opacity: 0.25,
                        backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)'
                    }}
                 />
             </div>
        )
    };

    return (
        <div 
            ref={columnRef}
            className={`calendar-day-column ${isDraggingOver ? 'calendar-day-column-dragging' : ''}`}
            style={{ minHeight: `${24 * (hourHeight/4)}rem`}}
            onDragOver={(e) => onDragOver(e, columnRef, day.date)}
            onDrop={(e) => onDrop(e, day.date)}
            onDragEnd={onDragEnd}
            onClick={handleTimeSlotClick}
        >
            {/* Background Schedule Highlight */}
            <div className="calendar-schedule-background" style={getScheduleBgStyle()}></div>
            
            {/* Hour Grid Lines */}
            {HOURS.map(hour => (
                <div 
                    key={hour} 
                    className="calendar-hour-line"
                    style={{ height: `${hourHeight / 4}rem` }}
                ></div>
            ))}

            {/* Timed Events */}
            <div className="calendar-events-container">
                {timedEvents.map(event => {
                    const layer = event.layerId ? layersById.get(event.layerId) : null;
                    if ((!layer && event.layerId) || !event.startTime || !event.endTime) return null;

                    const eventColor = event.color || layer?.color || '#6B7280';

                    const gridDayTimestamp = dayInGridToDate(day.date, system).getTime();

                    const startsBeforeToday = !areUniversalDaysEqual(event.startDate, gridDayTimestamp);
                    const endsAfterToday = event.endDate ? !areUniversalDaysEqual(event.endDate, gridDayTimestamp) : false;

                    const startMinutes = startsBeforeToday ? 0 : parseTime(event.startTime);
                    const endMinutes = endsAfterToday ? 24 * 60 : parseTime(event.endTime);
                    
                    const duration = Math.max(15, endMinutes - startMinutes);
                    
                    const top = (startMinutes / (24 * 60)) * 100;
                    const height = (duration / (24 * 60)) * 100;
                    
                    const travelBeforeTop = ((startMinutes - (event.travelTimeBefore || 0)) / (24 * 60)) * 100;
                    const travelBeforeHeight = ((event.travelTimeBefore || 0) / (24 * 60)) * 100;
                    
                    const travelAfterTop = (endMinutes / (24 * 60)) * 100;
                    const travelAfterHeight = ((event.travelTimeAfter || 0) / (24 * 60)) * 100;

                    const isBeingDragged = dragState?.eventId === event.id;

                    return (
                        <React.Fragment key={event.id}>
                            <TravelTimeIndicator top={travelBeforeTop} height={travelBeforeHeight} color={eventColor} />
                            <div
                                draggable
                                onDragStart={(e) => onDragStart(e, event)}
                                data-event-id={event.id}
                                className={`calendar-event ${isBeingDragged ? 'calendar-event-dragging' : ''}`}
                                style={{ 
                                    top: `${top}%`, 
                                    height: `${height}%`,
                                    backgroundColor: eventColor 
                                }}
                                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                            >
                                <div className="calendar-event-content">
                                    <p className="calendar-event-title">{event.name}</p>
                                    <p className="calendar-event-time">
                                        {!startsBeforeToday && event.startTime}
                                        { (startsBeforeToday || endsAfterToday) && ' - ' }
                                        {!endsAfterToday && event.endTime}
                                    </p>
                                </div>
                            </div>
                            <TravelTimeIndicator top={travelAfterTop} height={travelAfterHeight} color={eventColor} />
                        </React.Fragment>
                    );
                })}
                 {/* GHOST ELEMENT */}
                {dragState && ghostTopPercent !== null && isDraggingOver && (
                    <div
                        className="calendar-event-ghost"
                        style={{
                            top: `${ghostTopPercent}%`,
                            height: `${dragState.ghostHeightPercent}%`,
                            backgroundColor: dragState.layer.color
                        }}
                    >
                        <div className="calendar-event-content">
                            <p className="calendar-event-title">{dragState.event.name}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 