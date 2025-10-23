import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeOwnerOrManager } from '../middleware/auth.js';
import { getWeekDates, calculateWeeklyTotals } from '../utils/calculations.js';

const router = express.Router();

// Get weekly goals for a user
router.get('/user/:userId', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { weekStart } = req.query;

  try {
    const targetWeekStart = weekStart || getWeekDates().weekStart.toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT * FROM weekly_goals WHERE user_id = $1 AND week_start_date = $2',
      [userId, targetWeekStart]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get weekly goals error:', error);
    res.status(500).json({ error: 'Failed to retrieve weekly goals' });
  }
});

// Get all weekly goals for a user (history)
router.get('/user/:userId/history', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { limit = 12 } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM weekly_goals
       WHERE user_id = $1
       ORDER BY week_start_date DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get weekly goals history error:', error);
    res.status(500).json({ error: 'Failed to retrieve weekly goals history' });
  }
});

// Create or update weekly goals
router.post('/user/:userId', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const {
    weekStartDate,
    weekEndDate,
    targetContacts,
    targetPresentations,
    targetCloses,
    targetRevenue,
    stretchContacts,
    stretchPresentations,
    stretchCloses,
    stretchRevenue,
    wins,
    challenges,
    learnings,
    nextWeekFocus,
  } = req.body;

  try {
    // Validate required fields
    if (!weekStartDate || !weekEndDate) {
      return res.status(400).json({ error: 'Week start and end dates are required' });
    }

    // Calculate actual performance from daily data
    const dailyResult = await pool.query(
      `SELECT * FROM daily_performance
       WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
      [userId, weekStartDate, weekEndDate]
    );

    const actuals = calculateWeeklyTotals(dailyResult.rows);

    // Insert or update weekly goals
    const result = await pool.query(
      `INSERT INTO weekly_goals
       (user_id, week_start_date, week_end_date,
        target_contacts, target_presentations, target_closes, target_revenue,
        stretch_contacts, stretch_presentations, stretch_closes, stretch_revenue,
        actual_contacts, actual_presentations, actual_closes, actual_revenue,
        wins, challenges, learnings, next_week_focus)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       ON CONFLICT (user_id, week_start_date)
       DO UPDATE SET
         target_contacts = EXCLUDED.target_contacts,
         target_presentations = EXCLUDED.target_presentations,
         target_closes = EXCLUDED.target_closes,
         target_revenue = EXCLUDED.target_revenue,
         stretch_contacts = EXCLUDED.stretch_contacts,
         stretch_presentations = EXCLUDED.stretch_presentations,
         stretch_closes = EXCLUDED.stretch_closes,
         stretch_revenue = EXCLUDED.stretch_revenue,
         actual_contacts = EXCLUDED.actual_contacts,
         actual_presentations = EXCLUDED.actual_presentations,
         actual_closes = EXCLUDED.actual_closes,
         actual_revenue = EXCLUDED.actual_revenue,
         wins = EXCLUDED.wins,
         challenges = EXCLUDED.challenges,
         learnings = EXCLUDED.learnings,
         next_week_focus = EXCLUDED.next_week_focus,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId, weekStartDate, weekEndDate,
        targetContacts, targetPresentations, targetCloses, targetRevenue,
        stretchContacts, stretchPresentations, stretchCloses, stretchRevenue,
        actuals.contacts, actuals.presentations, actuals.closes, actuals.revenue,
        wins, challenges, learnings, nextWeekFocus
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Save weekly goals error:', error);
    res.status(500).json({ error: 'Failed to save weekly goals' });
  }
});

// Update weekly actuals (called automatically when daily performance is updated)
router.patch('/user/:userId/actuals', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { weekStartDate } = req.body;

  try {
    // Get week end date
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Calculate actual performance from daily data
    const dailyResult = await pool.query(
      `SELECT * FROM daily_performance
       WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
      [userId, weekStartDate, weekEndDate.toISOString().split('T')[0]]
    );

    const actuals = calculateWeeklyTotals(dailyResult.rows);

    // Update weekly goals with new actuals
    const result = await pool.query(
      `UPDATE weekly_goals
       SET actual_contacts = $1,
           actual_presentations = $2,
           actual_closes = $3,
           actual_revenue = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5 AND week_start_date = $6
       RETURNING *`,
      [actuals.contacts, actuals.presentations, actuals.closes, actuals.revenue, userId, weekStartDate]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly goals not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update weekly actuals error:', error);
    res.status(500).json({ error: 'Failed to update weekly actuals' });
  }
});

export default router;
