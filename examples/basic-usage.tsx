import React, { useState } from 'react';
import { Calendar, Event, Layer } from '@whensday/calendar-lib';

function BasicCalendarExample() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Team Meeting',
      layerId: 'work',
      startDate: new Date('2024-01-15T10:00:00Z').getTime(),
      endDate: new Date('2024-01-15T11:00:00Z').getTime(),
      eventType: 'event',
      isAllDay: false,
      startTime: '10:00',
      endTime: '11:00',
    },
    {
      id: '2',
      name: 'Project Deadline',
      layerId: 'work',
      startDate: new Date('2024-01-20T17:00:00Z').getTime(),
      eventType: 'deadline',
      isAllDay: true,
    },
    {
      id: '3',
      name: 'Buy groceries',
      layerId: 'personal',
      startDate: new Date('2024-01-16T12:00:00Z').getTime(),
      eventType: 'task',
      isAllDay: true,
      duePeriod: 'afternoon',
    },
  ]);

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'work',
      name: 'Work',
      color: '#3b82f6',
      isVisible: true,
    },
    {
      id: 'personal',
      name: 'Personal',
      color: '#10b981',
      isVisible: true,
    },
  ]);

  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
    alert(`Clicked: ${event.name}`);
  };

  const handleEventAdd = (date: any, time?: string) => {
    console.log('Add event on:', date, 'at:', time);
    const newEvent: Event = {
      id: Date.now().toString(),
      name: 'New Event',
      layerId: 'work',
      startDate: new Date(date.year, date.month, date.day).getTime(),
      eventType: 'event',
      isAllDay: !time,
      startTime: time || undefined,
      endTime: time ? '11:00' : undefined,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleEventMove = (eventId: string, newDayTimestamp: number, newStartTime?: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            startDate: newDayTimestamp,
            startTime: newStartTime || event.startTime,
          }
        : event
    ));
  };

  return (
    <div style={{ height: '600px', padding: '20px' }}>
      <h1>Whensday Calendar Example</h1>
      <Calendar
        events={events}
        layers={layers}
        onEventClick={handleEventClick}
        onEventAdd={handleEventAdd}
        onEventMove={handleEventMove}
        theme={{
          colors: {
            primary: '#8b5cf6',
            accent: '#f59e0b',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f8fafc',
            textSecondary: '#cbd5e1',
            border: '#334155',
            today: '#f59e0b',
            whensdayLeap: '#ec4899',
          },
        }}
      />
    </div>
  );
}

export default BasicCalendarExample; 