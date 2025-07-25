// Whensday Calendar Constants
export const WHENSDAY_MONTHS = [
  'Snowlyn', 'Aquilaria', 'Aquelaelum', 'Emberfell', 'Mayfall', 'Peachcup',
  'Sol', 'Butterdoodle', 'Sweetpop', 'Shadowfell', 'Knocturn', 'Finnabell', 'Zephania'
];

export const SOL_MONTH_INDEX = 6; // Index for Sol month (leap day month)

// Gregorian Calendar Constants
export const GREGORIAN_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Default Colors
export const DEFAULT_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6b7280', // gray-500
  '#84cc16', // lime-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
];

// Default Theme
export const DEFAULT_THEME = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
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
};

// Week day names
export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK_DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time constants
export const HOURS_IN_DAY = 24;
export const MINUTES_IN_HOUR = 60;
export const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;

// Default hour height for week/day views
export const DEFAULT_HOUR_HEIGHT = 8; // rem 