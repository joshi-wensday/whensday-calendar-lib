# Whensday Calendar Library

A flexible React calendar library with support for both Whensday and Gregorian calendar systems, featuring event management, schedule tracking, and customizable UI components.

## Features

- **Dual Calendar Systems**: Switch between Whensday and Gregorian calendars
- **Multiple Views**: Month, Week, and Day views
- **Event Management**: Add, edit, move, and delete events with drag-and-drop support
- **Schedule Management**: Create recurring schedules with on/off patterns
- **Holiday Booking**: Built-in holiday tracking and booking system
- **Layer Organization**: Organize events and schedules into color-coded layers
- **Customizable Themes**: Fully customizable styling with CSS variables
- **TypeScript Support**: Full TypeScript definitions included

## Installation

```bash
npm install @whensday/calendar-lib
```

## Quick Start

```tsx
import React from 'react';
import { Calendar } from '@whensday/calendar-lib';

function App() {
  const [events, setEvents] = React.useState([]);
  const [layers, setLayers] = React.useState([]);
  const [schedules, setSchedules] = React.useState([]);

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
  };

  const handleEventAdd = (date, time) => {
    console.log('Add event on:', date, 'at:', time);
  };

  return (
    <Calendar
      events={events}
      layers={layers}
      schedules={schedules}
      onEventClick={handleEventClick}
      onEventAdd={handleEventAdd}
      theme={{
        colors: {
          primary: '#3b82f6',
          accent: '#f59e0b',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
        }
      }}
    />
  );
}
```

## API Reference

### Calendar Component

The main `Calendar` component accepts the following props:

#### Data Props

- `events?: Event[]` - Array of calendar events
- `layers?: Layer[]` - Array of organizational layers
- `schedules?: Schedule[]` - Array of recurring schedules

#### State Props

- `view?: CalendarView` - Current view ('month' | 'week' | 'day')
- `system?: CalendarSystem` - Calendar system ('whensday' | 'gregorian')
- `displayDate?: DayInGrid` - Currently displayed date

#### Event Handlers

- `onEventClick?: (event: Event) => void` - Called when an event is clicked
- `onEventAdd?: (date: DayInGrid, time?: string) => void` - Called when adding a new event
- `onEventUpdate?: (event: Event) => void` - Called when an event is updated
- `onEventDelete?: (eventId: string) => void` - Called when an event is deleted
- `onEventMove?: (eventId: string, newDayTimestamp: number, newStartTime?: string) => void` - Called when an event is moved
- `onDateClick?: (date: DayInGrid) => void` - Called when a date is clicked
- `onViewChange?: (view: CalendarView) => void` - Called when the view changes
- `onSystemChange?: (system: CalendarSystem) => void` - Called when the calendar system changes

#### Customization Props

- `theme?: Partial<CalendarTheme>` - Custom theme configuration
- `className?: string` - Additional CSS classes
- `style?: React.CSSProperties` - Additional inline styles

#### Feature Flags

- `enableDragAndDrop?: boolean` - Enable drag-and-drop functionality (default: true)
- `enableScheduleManagement?: boolean` - Enable schedule features (default: true)
- `enableHolidayBooking?: boolean` - Enable holiday booking (default: true)
- `enableTravelTime?: boolean` - Enable travel time calculations (default: true)
- `enableRecurringEvents?: boolean` - Enable recurring events (default: true)

#### Display Options

- `showWeekNumbers?: boolean` - Show week numbers (default: false)
- `showTodayIndicator?: boolean` - Show today indicator (default: true)
- `showHolidayIndicators?: boolean` - Show holiday indicators (default: true)
- `showScheduleIndicators?: boolean` - Show schedule indicators (default: true)

### Types

#### Event

```typescript
interface Event {
  id: string;
  name: string;
  layerId: string | null;
  color?: string;
  startDate: number; // UTC timestamp
  endDate?: number; // UTC timestamp
  eventType: 'event' | 'deadline' | 'task' | 'birthday';
  isAllDay: boolean;
  location?: LocationDetails | null;
  startLocation?: LocationDetails | null;
  endLocation?: LocationDetails | null;
  isCompleted?: boolean;
  tags?: string[];
  startTime?: string; // "HH:MM" format
  endTime?: string; // "HH:MM" format
  travelTimeBefore?: number; // minutes
  travelTimeAfter?: number; // minutes
  doByDate?: number; // UTC timestamp
  doByTime?: string; // "HH:MM" format
  dueTime?: string; // "HH:MM" format
  duePeriod?: 'morning' | 'afternoon' | 'evening';
  isRecurring?: boolean;
  naturalLanguageRule?: string;
  recurrenceRule?: string;
}
```

#### Layer

```typescript
interface Layer {
  id: string;
  name: string;
  color: string; // Hex color
  isVisible: boolean;
  parentId?: string;
}
```

#### Schedule

```typescript
interface Schedule {
  id: string;
  name: string;
  layerId: string | null;
  color: string | null;
  startDate: number; // UTC timestamp
  endDate?: number; // UTC timestamp
  pattern: {
    on: number;
    off: number;
  };
  isVisible: boolean;
  initialHolidayBalance?: number;
  bookedHolidays?: number[]; // UTC timestamps
  completedDays?: number[]; // UTC timestamps
  holidaySettings?: HolidaySettings;
  exemptions?: ScheduleExemption[];
  bonusDays?: number[]; // UTC timestamps
}
```

### Utilities

The library provides several utility functions for working with dates:

```typescript
import {
  gregorianToWhensday,
  whensdayToGregorian,
  dayInGridToDate,
  areUniversalDaysEqual,
  formatUniversalDate,
} from '@whensday/calendar-lib';

// Convert between calendar systems
const whensdayDate = gregorianToWhensday(new Date());
const gregorianDate = whensdayToGregorian(whensdayDate);

// Work with universal dates
const dayInGrid = { year: 2024, month: 0, day: 1, monthName: 'January' };
const date = dayInGridToDate(dayInGrid, 'gregorian');
const formatted = formatUniversalDate(date.getTime(), 'gregorian');
```

### Hooks

#### useCalendar

A custom hook for managing calendar state:

```typescript
import { useCalendar } from '@whensday/calendar-lib';

const {
  view,
  system,
  displayDate,
  calendarGrid,
  currentMonthName,
  currentYear,
  goToNextPeriod,
  goToPrevPeriod,
  goToToday,
  goToDate,
  toggleSystem,
  useScheduleCalculations,
} = useCalendar('month', 'gregorian');
```

## Styling

The library uses CSS variables for theming. You can customize the appearance by overriding these variables:

```css
.whensday-calendar {
  --calendar-primary: #3b82f6;
  --calendar-secondary: #6b7280;
  --calendar-accent: #f59e0b;
  --calendar-background: #111827;
  --calendar-surface: #1f2937;
  --calendar-text: #f9fafb;
  --calendar-text-secondary: #9ca3af;
  --calendar-border: #374151;
  --calendar-today: #f59e0b;
  --calendar-whensday-leap: #ec4899;
  
  --calendar-font-primary: 'Inter, system-ui, sans-serif';
  --calendar-font-secondary: 'Bangers, cursive';
  
  --calendar-spacing-xs: 0.25rem;
  --calendar-spacing-sm: 0.5rem;
  --calendar-spacing-md: 1rem;
  --calendar-spacing-lg: 1.5rem;
  --calendar-spacing-xl: 2rem;
  
  --calendar-border-radius-sm: 0.25rem;
  --calendar-border-radius-md: 0.5rem;
  --calendar-border-radius-lg: 0.75rem;
}
```

## Whensday Calendar System

The Whensday calendar is an alternative calendar system with the following characteristics:

- **13 months**: 12 regular months of 28 days each, plus a 13th month (Sol) of 14-15 days
- **Leap day**: The 15th day of Sol month in leap years is called "Whensday"
- **Year start**: The Whensday year begins on March 1st of the Gregorian calendar
- **Consistent weeks**: Each month starts on the same day of the week

## Examples

### Basic Calendar

```tsx
<Calendar
  events={[
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
    }
  ]}
  layers={[
    {
      id: 'work',
      name: 'Work',
      color: '#3b82f6',
      isVisible: true,
    }
  ]}
  onEventClick={(event) => console.log('Event clicked:', event)}
/>
```

### Custom Theme

```tsx
<Calendar
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
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Bangers, cursive',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
    },
  }}
/>
```

### Schedule Management

```tsx
<Calendar
  schedules={[
    {
      id: 'work-schedule',
      name: 'Work Schedule',
      layerId: 'work',
      startDate: new Date('2024-01-01T00:00:00Z').getTime(),
      pattern: { on: 5, off: 2 }, // 5 days on, 2 days off
      isVisible: true,
      holidaySettings: {
        enabled: true,
        onDays: 5,
        holidays: 25,
        bonusDayRate: 0.2,
      },
    }
  ]}
  enableScheduleManagement={true}
  enableHolidayBooking={true}
/>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details. 