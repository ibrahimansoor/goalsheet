/**
 * Get the start and end dates for the current week (Sunday to Saturday)
 */
export function getWeekDates(date = new Date()) {
  const current = new Date(date);
  const dayOfWeek = current.getDay();

  // Calculate Sunday of the current week
  const weekStart = new Date(current);
  weekStart.setDate(current.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // Calculate Saturday of the current week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date as "WE MM-DD-YYYY"
 */
export function formatWeekEndingDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `WE ${month}-${day}-${year}`;
}

/**
 * Format date as readable string (e.g., "Monday, Jan 15, 2024")
 */
export function formatReadableDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get severity color based on bottleneck severity
 */
export function getSeverityColor(severity) {
  const colors = {
    critical: 'text-red-700 bg-red-50 border-red-200',
    high: 'text-orange-700 bg-orange-50 border-orange-200',
    medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    low: 'text-blue-700 bg-blue-50 border-blue-200',
  };
  return colors[severity] || colors.medium;
}

/**
 * Get status color for goal tracking
 */
export function getGoalStatusColor(actual, target) {
  if (!target) return 'text-gray-500';

  const percentage = (actual / target) * 100;

  if (percentage >= 100) return 'text-green-600';
  if (percentage >= 80) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get days array for the week
 */
export function getWeekDays(weekStart) {
  const days = [];
  const start = new Date(weekStart);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push({
      date: formatDate(day),
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: day,
    });
  }

  return days;
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const today = new Date();
  const check = new Date(date);
  return (
    check.getDate() === today.getDate() &&
    check.getMonth() === today.getMonth() &&
    check.getFullYear() === today.getFullYear()
  );
}

/**
 * Validate performance data
 */
export function validatePerformanceData(data) {
  const errors = {};

  if (data.contacts < 0) errors.contacts = 'Contacts cannot be negative';
  if (data.presentations < 0) errors.presentations = 'Presentations cannot be negative';
  if (data.creditChecks < 0) errors.creditChecks = 'Credit checks cannot be negative';
  if (data.closes < 0) errors.closes = 'Closes cannot be negative';
  if (data.revenue < 0) errors.revenue = 'Revenue cannot be negative';

  // Logical validation
  if (data.presentations > data.contacts) {
    errors.presentations = 'Presentations cannot exceed contacts';
  }
  if (data.creditChecks > data.presentations) {
    errors.creditChecks = 'Credit checks cannot exceed presentations';
  }
  if (data.closes > data.creditChecks) {
    errors.closes = 'Closes cannot exceed credit checks';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
