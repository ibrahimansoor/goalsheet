import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeOwnerOrManager } from '../middleware/auth.js';
import { getWeekDates } from '../utils/calculations.js';

const router = express.Router();

// Get 6996 goals for a user
router.get('/user/:userId', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { weekStart } = req.query;

  try {
    const targetWeekStart = weekStart || getWeekDates().weekStart.toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT * FROM six996_goals WHERE user_id = $1 AND week_start_date = $2',
      [userId, targetWeekStart]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get 6996 goals error:', error);
    res.status(500).json({ error: 'Failed to retrieve 6996 goals' });
  }
});

// Get all 6996 goals for a user (history)
router.get('/user/:userId/history', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { limit = 12 } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM six996_goals
       WHERE user_id = $1
       ORDER BY week_start_date DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get 6996 goals history error:', error);
    res.status(500).json({ error: 'Failed to retrieve 6996 goals history' });
  }
});

// Create or update 6996 goals
router.post('/user/:userId', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const {
    weekStartDate,
    physicalGoal,
    mentalGoal,
    spiritualGoal,
    relationalGoal,
    financialGoal,
    outsideWorkActivities,
    duringWorkActivities,
    visualizationExercise,
    oldHabit,
    newHabit,
    completed,
    progressNotes,
  } = req.body;

  try {
    // Validate required field
    if (!weekStartDate) {
      return res.status(400).json({ error: 'Week start date is required' });
    }

    // Insert or update 6996 goals
    const result = await pool.query(
      `INSERT INTO six996_goals
       (user_id, week_start_date, physical_goal, mental_goal, spiritual_goal,
        relational_goal, financial_goal, outside_work_activities, during_work_activities,
        visualization_exercise, old_habit, new_habit, completed, progress_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (user_id, week_start_date)
       DO UPDATE SET
         physical_goal = EXCLUDED.physical_goal,
         mental_goal = EXCLUDED.mental_goal,
         spiritual_goal = EXCLUDED.spiritual_goal,
         relational_goal = EXCLUDED.relational_goal,
         financial_goal = EXCLUDED.financial_goal,
         outside_work_activities = EXCLUDED.outside_work_activities,
         during_work_activities = EXCLUDED.during_work_activities,
         visualization_exercise = EXCLUDED.visualization_exercise,
         old_habit = EXCLUDED.old_habit,
         new_habit = EXCLUDED.new_habit,
         completed = EXCLUDED.completed,
         progress_notes = EXCLUDED.progress_notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId, weekStartDate, physicalGoal, mentalGoal, spiritualGoal,
        relationalGoal, financialGoal, outsideWorkActivities, duringWorkActivities,
        visualizationExercise, oldHabit, newHabit, completed, progressNotes
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Save 6996 goals error:', error);
    res.status(500).json({ error: 'Failed to save 6996 goals' });
  }
});

// Mark 6996 goal as completed
router.patch('/user/:userId/complete', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { weekStartDate, completed, progressNotes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE six996_goals
       SET completed = $1, progress_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND week_start_date = $4
       RETURNING *`,
      [completed, progressNotes, userId, weekStartDate]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '6996 goals not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update 6996 completion error:', error);
    res.status(500).json({ error: 'Failed to update 6996 goals' });
  }
});

export default router;
