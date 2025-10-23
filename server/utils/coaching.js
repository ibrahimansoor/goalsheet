/**
 * Automated coaching logic based on LOA ratios and performance patterns
 */

// Target ratios
const TARGETS = {
  CONTACT_TO_PRESENTATION: 7,
  PRESENTATION_TO_CREDIT: 2,
  CLOSE_RATE: 80,
  MIN_DAILY_CONTACTS: 60,
};

/**
 * Identify the primary bottleneck in the sales process
 * Returns bottleneck in order of priority:
 * 1. Contacts (not enough activity)
 * 2. Contact-to-Presentation ratio (can't set appointments)
 * 3. Presentation-to-Credit ratio (poor qualification)
 * 4. Close rate (can't close deals)
 */
export const identifyBottleneck = (performance, ratios) => {
  const bottlenecks = [];

  // 1. Check contacts (absolute activity level)
  if (performance.contacts < TARGETS.MIN_DAILY_CONTACTS) {
    bottlenecks.push({
      type: 'contacts',
      severity: performance.contacts < 40 ? 'critical' : 'high',
      metric: performance.contacts,
      target: TARGETS.MIN_DAILY_CONTACTS,
    });
  }

  // 2. Check Contact-to-Presentation ratio
  if (ratios.contactToPresentationRatio) {
    const ratio = parseFloat(ratios.contactToPresentationRatio);
    if (ratio > TARGETS.CONTACT_TO_PRESENTATION) {
      const severity = ratio > 15 ? 'critical' : ratio > 10 ? 'high' : 'medium';
      bottlenecks.push({
        type: 'presentation_ratio',
        severity,
        metric: ratio,
        target: TARGETS.CONTACT_TO_PRESENTATION,
      });
    }
  }

  // 3. Check Presentation-to-Credit ratio
  if (ratios.presentationToCreditRatio) {
    const ratio = parseFloat(ratios.presentationToCreditRatio);
    if (ratio > TARGETS.PRESENTATION_TO_CREDIT) {
      const severity = ratio > 4 ? 'critical' : ratio > 3 ? 'high' : 'medium';
      bottlenecks.push({
        type: 'credit_ratio',
        severity,
        metric: ratio,
        target: TARGETS.PRESENTATION_TO_CREDIT,
      });
    }
  }

  // 4. Check close rate
  if (ratios.closeRate) {
    const closeRate = parseFloat(ratios.closeRate);
    if (closeRate < TARGETS.CLOSE_RATE) {
      const severity = closeRate < 50 ? 'critical' : closeRate < 65 ? 'high' : 'medium';
      bottlenecks.push({
        type: 'close_rate',
        severity,
        metric: closeRate,
        target: TARGETS.CLOSE_RATE,
      });
    }
  }

  // Return primary bottleneck (first in hierarchy with issues)
  return bottlenecks.length > 0 ? bottlenecks[0] : null;
};

/**
 * Generate coaching message based on bottleneck
 */
export const generateCoachingMessage = (bottleneck, performance, weeklyContext = null) => {
  if (!bottleneck) {
    return generateCelebrationMessage(performance, weeklyContext);
  }

  const messages = {
    contacts: {
      critical: `🚨 URGENT: You only made ${performance.contacts} contacts today. You need at least ${TARGETS.MIN_DAILY_CONTACTS} contacts to hit your goals. Everything starts with activity - let's get those numbers up immediately!`,
      high: `⚠️ Activity Alert: ${performance.contacts} contacts is below target (${TARGETS.MIN_DAILY_CONTACTS}). Remember, contacts are the fuel for everything else. Focus on increasing your activity level today!`,
      medium: `💪 Almost There: ${performance.contacts} contacts is close to target. Push to hit ${TARGETS.MIN_DAILY_CONTACTS}+ contacts consistently and watch everything else improve!`,
    },
    presentation_ratio: {
      critical: `🎯 PRESENTATION SKILLS NEEDED: Your contact-to-presentation ratio is ${bottleneck.metric}:1 (target: ${TARGETS.CONTACT_TO_PRESENTATION}:1). This is your PRIMARY bottleneck. Focus on:\n• Being more direct in your approach\n• Creating urgency in the conversation\n• Asking for the appointment confidently\n• Overcoming objections more effectively`,
      high: `📞 Improve Your Pitch: Ratio is ${bottleneck.metric}:1 (target: ${TARGETS.CONTACT_TO_PRESENTATION}:1). You're making contacts but not converting to presentations. Review your approach script and practice with your leader today.`,
      medium: `✨ Fine-Tune Your Approach: ${bottleneck.metric}:1 ratio is slightly above target. Small adjustments to your tonality and urgency creation will get you to ${TARGETS.CONTACT_TO_PRESENTATION}:1!`,
    },
    credit_ratio: {
      critical: `💳 QUALIFICATION FOCUS: Your presentation-to-credit ratio is ${bottleneck.metric}:1 (target: ${TARGETS.PRESENTATION_TO_CREDIT}:1). You're getting presentations but not pulling credit. Work on:\n• Pre-qualifying prospects better\n• Building stronger rapport in presentations\n• Creating more urgency for credit approval\n• Handling credit objections`,
      high: `🎪 Strengthen Presentations: ${bottleneck.metric}:1 ratio (target: ${TARGETS.PRESENTATION_TO_CREDIT}:1). You're getting face-to-face but losing them before credit. Review your presentation structure with your leader.`,
      medium: `🔧 Almost Dialed In: ${bottleneck.metric}:1 is close to target. Keep refining your qualification questions and urgency-building techniques!`,
    },
    close_rate: {
      critical: `🏆 CLOSING PRACTICE NEEDED: ${bottleneck.metric}% close rate (target: ${TARGETS.CLOSE_RATE}%). You're getting credit checks but not closing. This is costing you serious money! Focus on:\n• Assuming the sale throughout\n• Trial closing more frequently\n• Handling final objections with confidence\n• Asking for the order multiple ways`,
      high: `💼 Sharpen Your Close: ${bottleneck.metric}% close rate (target: ${TARGETS.CLOSE_RATE}%). You're so close! Work with your leader on closing techniques and objection handling.`,
      medium: `🎯 Closing Well: ${bottleneck.metric}% is near target. A few more reps and you'll consistently hit ${TARGETS.CLOSE_RATE}%+!`,
    },
  };

  return messages[bottleneck.type][bottleneck.severity];
};

/**
 * Generate celebration message when performance is strong
 */
const generateCelebrationMessage = (performance, weeklyContext) => {
  const messages = [
    `🌟 OUTSTANDING WORK! All your ratios are on target. You're doing everything right - keep this momentum going!`,
    `🔥 ON FIRE! Your numbers are dialed in today. This is what championship performance looks like!`,
    `💎 DIAMOND STANDARD! Every metric is hitting target. You're in the zone - maintain this excellence!`,
    `🚀 CRUSHING IT! Perfect execution on all fronts. This is the path to massive success!`,
  ];

  let message = messages[Math.floor(Math.random() * messages.length)];

  // Add specific callouts
  if (performance.closes > 5) {
    message += `\n\n💰 ${performance.closes} closes today - EXCEPTIONAL!`;
  }
  if (performance.contacts > 80) {
    message += `\n\n🎯 ${performance.contacts} contacts - BEAST MODE ACTIVITY!`;
  }

  return message;
};

/**
 * Analyze weekly patterns and provide strategic coaching
 */
export const analyzeWeeklyPatterns = (dailyPerformances) => {
  const patterns = {
    consistencyScore: 0,
    trendDirection: 'stable',
    concernAreas: [],
    strengths: [],
  };

  if (dailyPerformances.length < 2) {
    return patterns;
  }

  // Calculate consistency (std deviation of contacts)
  const contacts = dailyPerformances.map(d => d.contacts || 0);
  const avgContacts = contacts.reduce((a, b) => a + b, 0) / contacts.length;
  const variance = contacts.reduce((sum, val) => sum + Math.pow(val - avgContacts, 2), 0) / contacts.length;
  const stdDev = Math.sqrt(variance);
  patterns.consistencyScore = Math.max(0, 100 - (stdDev / avgContacts) * 100).toFixed(0);

  // Trend analysis (first half vs second half)
  const midpoint = Math.floor(dailyPerformances.length / 2);
  const firstHalf = dailyPerformances.slice(0, midpoint);
  const secondHalf = dailyPerformances.slice(midpoint);

  const avgFirst = firstHalf.reduce((sum, d) => sum + (d.contacts || 0), 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, d) => sum + (d.contacts || 0), 0) / secondHalf.length;

  if (avgSecond > avgFirst * 1.1) {
    patterns.trendDirection = 'improving';
    patterns.strengths.push('Building momentum throughout the week');
  } else if (avgSecond < avgFirst * 0.9) {
    patterns.trendDirection = 'declining';
    patterns.concernAreas.push('Activity declining as week progresses');
  }

  // Check for days with zero activity
  const zeroDays = dailyPerformances.filter(d => (d.contacts || 0) === 0).length;
  if (zeroDays > 0) {
    patterns.concernAreas.push(`${zeroDays} day(s) with no activity`);
  }

  return patterns;
};

/**
 * Generate end-of-week coaching summary
 */
export const generateWeeklyCoachingSummary = (weeklyTotals, weeklyGoals, patterns) => {
  let summary = '📊 WEEKLY PERFORMANCE SUMMARY\n\n';

  // Goal attainment
  const contactsPercent = ((weeklyTotals.contacts / weeklyGoals.target_contacts) * 100).toFixed(0);
  const closesPercent = ((weeklyTotals.closes / weeklyGoals.target_closes) * 100).toFixed(0);

  summary += `🎯 Goal Attainment:\n`;
  summary += `   Contacts: ${weeklyTotals.contacts}/${weeklyGoals.target_contacts} (${contactsPercent}%)\n`;
  summary += `   Closes: ${weeklyTotals.closes}/${weeklyGoals.target_closes} (${closesPercent}%)\n`;
  summary += `   Revenue: $${weeklyTotals.revenue.toFixed(0)}/$${weeklyGoals.target_revenue} (${((weeklyTotals.revenue / weeklyGoals.target_revenue) * 100).toFixed(0)}%)\n\n`;

  // Consistency
  summary += `📈 Consistency Score: ${patterns.consistencyScore}/100\n`;
  summary += `   Trend: ${patterns.trendDirection.toUpperCase()}\n\n`;

  // Strengths
  if (patterns.strengths.length > 0) {
    summary += `💪 Strengths:\n`;
    patterns.strengths.forEach(s => summary += `   • ${s}\n`);
    summary += '\n';
  }

  // Areas for improvement
  if (patterns.concernAreas.length > 0) {
    summary += `🎯 Focus Areas for Next Week:\n`;
    patterns.concernAreas.forEach(c => summary += `   • ${c}\n`);
  }

  return summary;
};
