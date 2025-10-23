import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeOwnerOrManager } from '../middleware/auth.js';
import { calculateLOARatios, getWeekDates } from '../utils/calculations.js';
import { identifyBottleneck, generateCoachingMessage } from '../utils/coaching.js';

const router = express.Router();

// Get daily performance for a user (single day or date range)
router.get('/user/:userId', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { date, startDate, endDate } = req.query;

  try {
    let query;
    let params;

    if (date) {
      // Single day
      query = `SELECT * FROM daily_performance WHERE user_id = $1 AND date = $2`;
      params = [userId, date];
    } else if (startDate && endDate) {
      // Date range
      query = `SELECT * FROM daily_performance
               WHERE user_id = $1 AND date BETWEEN $2 AND $3
               ORDER BY date ASC`;
      params = [userId, startDate, endDate];
    } else {
      // Current week
      const { weekStart, weekEnd } = getWeekDates();
      query = `SELECT * FROM daily_performance
               WHERE user_id = $1 AND date BETWEEN $2 AND $3
               ORDER BY date ASC`;
      params = [userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]];
    }

    const result = await pool.query(query, params);

    // Calculate ratios for each day
    const performanceWithRatios = result.rows.map(day => ({
      ...day,
      ratios: calculateLOARatios(day),
    }));

    res.json(performanceWithRatios);
  } catch (error) {
    console.error('Get daily performance error:', error);
    res.status(500).json({ error: 'Failed to retrieve performance data' });
  }
});

// Get previous day's performance (for copy feature)
router.get('/user/:userId/previous', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  try {
    const targetDate = date ? new Date(date) : new Date();

    const result = await pool.query(
      `SELECT * FROM daily_performance
       WHERE user_id = $1 AND date < $2
       ORDER BY date DESC LIMIT 1`,
      [userId, targetDate.toISOString().split('T')[0]]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get previous day error:', error);
    res.status(500).json({ error: 'Failed to retrieve previous day data' });
  }
});

// Submit daily performance
router.post('/user/:userId', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId } = req.params;
  const {
    date,
    contacts,
    turnAndBurns,
    presentations,
    creditChecks,
    closes,
    revenue,
    bodyLanguage,
    excitement,
    authenticity,
    smile,
    tonality,
    notes,
  } = req.body;

  try {
    // Validate required fields
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Calculate ratios
    const performance = {
      contacts: contacts || 0,
      presentations: presentations || 0,
      credit_checks: creditChecks || 0,
      closes: closes || 0,
    };

    const ratios = calculateLOARatios(performance);

    // Insert or update performance
    const result = await pool.query(
      `INSERT INTO daily_performance
       (user_id, date, contacts, turn_and_burns, presentations, credit_checks, closes, revenue,
        body_language, excitement, authenticity, smile, tonality, notes,
        contact_to_presentation_ratio, presentation_to_credit_ratio, close_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (user_id, date)
       DO UPDATE SET
         contacts = EXCLUDED.contacts,
         turn_and_burns = EXCLUDED.turn_and_burns,
         presentations = EXCLUDED.presentations,
         credit_checks = EXCLUDED.credit_checks,
         closes = EXCLUDED.closes,
         revenue = EXCLUDED.revenue,
         body_language = EXCLUDED.body_language,
         excitement = EXCLUDED.excitement,
         authenticity = EXCLUDED.authenticity,
         smile = EXCLUDED.smile,
         tonality = EXCLUDED.tonality,
         notes = EXCLUDED.notes,
         contact_to_presentation_ratio = EXCLUDED.contact_to_presentation_ratio,
         presentation_to_credit_ratio = EXCLUDED.presentation_to_credit_ratio,
         close_rate = EXCLUDED.close_rate,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId, date, contacts, turnAndBurns, presentations, creditChecks, closes, revenue,
        bodyLanguage, excitement, authenticity, smile, tonality, notes,
        ratios.contactToPresentationRatio, ratios.presentationToCreditRatio, ratios.closeRate
      ]
    );

    const savedPerformance = result.rows[0];

    // Generate coaching feedback
    const bottleneck = identifyBottleneck(performance, ratios);
    const coachingMessage = generateCoachingMessage(bottleneck, performance);

    // Save coaching history
    if (bottleneck) {
      await pool.query(
        `INSERT INTO coaching_history
         (user_id, date, primary_bottleneck, bottleneck_severity, coaching_message, coaching_type,
          contacts_ratio, presentation_ratio, close_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId, date, bottleneck.type, bottleneck.severity, coachingMessage, bottleneck.type,
          ratios.contactToPresentationRatio, ratios.presentationToCreditRatio, ratios.closeRate
        ]
      );
    }

    res.json({
      performance: savedPerformance,
      ratios,
      coaching: {
        bottleneck,
        message: coachingMessage,
      },
    });
  } catch (error) {
    console.error('Submit daily performance error:', error);
    res.status(500).json({ error: 'Failed to save performance data' });
  }
});

// Delete daily performance
router.delete('/user/:userId/:date', authenticateToken, authorizeOwnerOrManager, async (req, res) => {
  const { userId, date } = req.params;

  try {
    await pool.query(
      'DELETE FROM daily_performance WHERE user_id = $1 AND date = $2',
      [userId, date]
    );

    res.json({ message: 'Performance data deleted successfully' });
  } catch (error) {
    console.error('Delete daily performance error:', error);
    res.status(500).json({ error: 'Failed to delete performance data' });
  }
});

// Get team performance (for managers)
router.get('/team', authenticateToken, async (req, res) => {
  const { date } = req.query;
  const managerId = req.user.id;

  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT
         u.id as user_id,
         u.first_name,
         u.last_name,
         u.position,
         dp.*
       FROM users u
       LEFT JOIN daily_performance dp ON u.id = dp.user_id AND dp.date = $1
       WHERE u.manager_id = $2 AND u.is_active = true
       ORDER BY u.last_name, u.first_name`,
      [targetDate, managerId]
    );

    const teamPerformance = result.rows.map(row => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      position: row.position,
      performance: row.id ? {
        id: row.id,
        date: row.date,
        contacts: row.contacts,
        presentations: row.presentations,
        creditChecks: row.credit_checks,
        closes: row.closes,
        revenue: row.revenue,
        ratios: calculateLOARatios(row),
      } : null,
    }));

    res.json(teamPerformance);
  } catch (error) {
    console.error('Get team performance error:', error);
    res.status(500).json({ error: 'Failed to retrieve team performance' });
  }
});

export default router;
