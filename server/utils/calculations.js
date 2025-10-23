/**
 * Calculate LOA (Law of Averages) ratios
 */

export const calculateLOARatios = (performance) => {
  const ratios = {
    contactToPresentationRatio: null,
    presentationToCreditRatio: null,
    closeRate: null,
  };

  // Contact-to-Presentation ratio (how many contacts to get 1 presentation)
  if (performance.presentations > 0) {
    ratios.contactToPresentationRatio = (performance.contacts / performance.presentations).toFixed(2);
  }

  // Presentation-to-Credit ratio (how many presentations to get 1 credit check)
  if (performance.credit_checks > 0) {
    ratios.presentationToCreditRatio = (performance.presentations / performance.credit_checks).toFixed(2);
  }

  // Close rate (percentage of credit checks that close)
  if (performance.credit_checks > 0) {
    ratios.closeRate = ((performance.closes / performance.credit_checks) * 100).toFixed(2);
  }

  return ratios;
};

/**
 * Calculate weekly totals from daily performance
 */
export const calculateWeeklyTotals = (dailyPerformances) => {
  return dailyPerformances.reduce(
    (totals, day) => ({
      contacts: totals.contacts + (day.contacts || 0),
      presentations: totals.presentations + (day.presentations || 0),
      creditChecks: totals.creditChecks + (day.credit_checks || 0),
      closes: totals.closes + (day.closes || 0),
      revenue: totals.revenue + parseFloat(day.revenue || 0),
    }),
    { contacts: 0, presentations: 0, creditChecks: 0, closes: 0, revenue: 0 }
  );
};

/**
 * Get week start and end dates (Sunday to Saturday)
 */
export const getWeekDates = (date = new Date()) => {
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
};

/**
 * Format date as "WE MM-DD-YYYY"
 */
export const formatWeekEndingDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `WE ${month}-${day}-${year}`;
};

/**
 * Calculate average BEAST score
 */
export const calculateBEASTScore = (performance) => {
  const scores = [
    performance.body_language,
    performance.excitement,
    performance.authenticity,
    performance.smile,
    performance.tonality,
  ].filter(score => score != null);

  if (scores.length === 0) return null;

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return average.toFixed(1);
};

/**
 * Determine if performance is on track for weekly goal
 */
export const isOnTrack = (actual, target, daysElapsed, totalDays = 7) => {
  if (!target || target === 0) return true;

  const expectedProgress = (target / totalDays) * daysElapsed;
  const progressRate = actual / expectedProgress;

  return progressRate >= 0.9; // 90% or better is considered on track
};
