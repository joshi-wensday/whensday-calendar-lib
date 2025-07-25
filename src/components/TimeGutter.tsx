import React from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface TimeGutterProps {
    hourHeight: number;
    hourLabelInterval: number;
}

export const TimeGutter: React.FC<TimeGutterProps> = ({ hourHeight, hourLabelInterval }) => {
    return (
        <div className="calendar-time-gutter">
            {HOURS.map(hour => (
                <div key={hour} className="calendar-time-slot" style={{ height: `${hourHeight / 4}rem` }}>
                    {hour > 0 && hour % hourLabelInterval === 0 && (
                        <span className="calendar-time-label">
                            {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}; 