import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeOwnerOrManager, authorize } from '../middleware/auth.js';
import { getWeekDates } from '../utils/calculations.js';
import { analyzeWeeklyPatterns, generateWeeklyCoachingSummary } from '../utils/coaching.js';

const router = express.Router();

// Get coaching history for a user
router.get('/user/:userId', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, limit = 30 } = req.query;

  try {
    let query;
    let params;

    if (startDate && endDate) {
      query = `SELECT * FROM coaching_history
               WHERE user_id = $1 AND date BETWEEN $2 AND $3
               ORDER BY date DESC`;
      params = [userId, startDate, endDate];
    } else {
      query = `SELECT * FROM coaching_history
               WHERE user_id = $1
               ORDER BY date DESC
               LIMIT $2`;
      params = [userId, limit];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get coaching history error:', error);
    res.status(500).json({ error: 'Failed to retrieve coaching history' });
  }
});

// Get today's coaching for a user
router.get('/user/:userId/today', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT * FROM coaching_history
       WHERE user_id = $1 AND date = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, today]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get today coaching error:', error);
    res.status(500).json({ error: 'Failed to retrieve today\'s coaching' });
  }
});

// Acknowledge coaching message
router.patch('/:coachingId/acknowledge', authenticateToken, async (req, res) => {
  const { coachingId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE coaching_history
       SET acknowledged = true, acknowledged_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [coachingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coaching message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Acknowledge coaching error:', error);
    res.status(500).json({ error: 'Failed to acknowledge coaching' });
  }
});

// Manager review of coaching (add notes)
router.patch('/:coachingId/review', authenticateToken, authorize('manager', 'leader', 'admin'), async (req, res) => {
  const { coachingId } = req.params;
  const { managerNotes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE coaching_history
       SET manager_reviewed = true, manager_notes = $1
       WHERE id = $2
       RETURNING *`,
      [managerNotes, coachingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coaching message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Manager review coaching error:', error);
    res.status(500).json({ error: 'Failed to review coaching' });
  }
});

// Get weekly coaching summary
router.get('/user/:userId/weekly-summary', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { weekStart } = req.query;

  try {
    const { weekStart: targetWeekStart, weekEnd } = weekStart
      ? { weekStart: new Date(weekStart), weekEnd: new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 6)) }
      : getWeekDates();

    // Get daily performances for the week
    const dailyResult = await pool.query(
      `SELECT * FROM daily_performance
       WHERE user_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date ASC`,
      [userId, targetWeekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]]
    );

    // Get weekly goals
    const goalsResult = await pool.query(
      'SELECT * FROM weekly_goals WHERE user_id = $1 AND week_start_date = $2',
      [userId, targetWeekStart.toISOString().split('T')[0]]
    );

    if (goalsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly goals not found' });
    }

    const weeklyGoals = goalsResult.rows[0];
    const patterns = analyzeWeeklyPatterns(dailyResult.rows);

    const weeklyTotals = {
      contacts: weeklyGoals.actual_contacts,
      presentations: weeklyGoals.actual_presentations,
      closes: weeklyGoals.actual_closes,
      revenue: parseFloat(weeklyGoals.actual_revenue),
    };

    const summary = generateWeeklyCoachingSummary(weeklyTotals, weeklyGoals, patterns);

    res.json({
      summary,
      patterns,
      weeklyTotals,
      weeklyGoals,
    });
  } catch (error) {
    console.error('Get weekly summary error:', error);
    res.status(500).json({ error: 'Failed to generate weekly summary' });
  }
});

// Get team coaching overview (for managers)
router.get('/team/overview', authenticateToken, authorize('manager', 'leader', 'admin'), async (req, res) => {
  const managerId = req.user.id;
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT
         u.id as user_id,
         u.first_name,
         u.last_name,
         ch.*
       FROM users u
       LEFT JOIN coaching_history ch ON u.id = ch.user_id AND ch.date = $1
       WHERE u.manager_id = $2 AND u.is_active = true
       ORDER BY ch.bottleneck_severity DESC NULLS LAST, u.last_name, u.first_name`,
      [targetDate, managerId]
    );

    const teamCoaching = result.rows.map(row => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      coaching: row.id ? {
        id: row.id,
        primaryBottleneck: row.primary_bottleneck,
        severity: row.bottleneck_severity,
        message: row.coaching_message,
        acknowledged: row.acknowledged,
        managerReviewed: row.manager_reviewed,
      } : null,
    }));

    res.json(teamCoaching);
  } catch (error) {
    console.error('Get team coaching overview error:', error);
    res.status(500).json({ error: 'Failed to retrieve team coaching overview' });
  }
});

export default router;
