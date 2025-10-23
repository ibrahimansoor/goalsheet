import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (for managers/admins)
router.get('/', authenticateToken, authorize('manager', 'admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, position, role, manager_id, is_active, created_at
       FROM users
       ORDER BY last_name, first_name`
    );

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      position: user.position,
      role: user.role,
      managerId: user.manager_id,
      isActive: user.is_active,
      createdAt: user.created_at,
    }));

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, position, role, manager_id, is_active, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      position: user.position,
      role: user.role,
      managerId: user.manager_id,
      isActive: user.is_active,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// Get team members (for managers)
router.get('/team/members', authenticateToken, async (req, res) => {
  const managerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, position, role, is_active, created_at
       FROM users
       WHERE manager_id = $1
       ORDER BY last_name, first_name`,
      [managerId]
    );

    const team = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      position: user.position,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
    }));

    res.json(team);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to retrieve team members' });
  }
});

// Update user
router.patch('/:userId', authenticateToken, authorize('manager', 'admin'), async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, position, role, managerId, isActive } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           position = COALESCE($3, position),
           role = COALESCE($4, role),
           manager_id = COALESCE($5, manager_id),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, email, first_name, last_name, position, role, manager_id, is_active`,
      [firstName, lastName, position, role, managerId, isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      position: user.position,
      role: user.role,
      managerId: user.manager_id,
      isActive: user.is_active,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Deactivate user
router.delete('/:userId', authenticateToken, authorize('admin'), async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;
