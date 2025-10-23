import db from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Check if data already exists
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existingUsers.count > 0) {
      console.log('✅ Database already has data, skipping seed');
      process.exit(0);
    }

    const password = await bcrypt.hash('password123', 10);

    // Create manager
    const manager = db.prepare(
      `INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, position, role)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run('manager@example.com', password, 'Sarah', 'Johnson', 'Sales Manager', 'manager');

    const managerId = manager.lastInsertRowid || 1;

    // Create sales reps
    const reps = [
      ['john.doe@example.com', 'John', 'Doe', 'Sales Representative'],
      ['jane.smith@example.com', 'Jane', 'Smith', 'Sales Representative'],
      ['mike.wilson@example.com', 'Mike', 'Wilson', 'Sales Representative'],
    ];

    const repIds = [];
    for (const [email, firstName, lastName, position] of reps) {
      const result = db.prepare(
        `INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, position, role, manager_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(email, password, firstName, lastName, position, 'rep', managerId);

      if (result.lastInsertRowid) {
        repIds.push(result.lastInsertRowid);
      }
    }

    // Get all rep IDs if not from insert
    if (repIds.length === 0) {
      const users = db.prepare(`SELECT id FROM users WHERE role = 'rep'`).all();
      repIds.push(...users.map(u => u.id));
    }

    // Add sample daily performance for current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    for (const userId of repIds) {
      for (let i = 0; i <= dayOfWeek && i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOfWeek + i);
        const dateStr = date.toISOString().split('T')[0];

        const contacts = 60 + Math.floor(Math.random() * 40);
        const presentations = Math.floor(contacts / (5 + Math.random() * 5));
        const creditChecks = Math.floor(presentations / (1.5 + Math.random() * 1));
        const closes = Math.floor(creditChecks * (0.7 + Math.random() * 0.2));
        const revenue = closes * (3000 + Math.random() * 2000);

        db.prepare(
          `INSERT OR IGNORE INTO daily_performance
           (user_id, date, contacts, presentations, credit_checks, closes, revenue,
            body_language, excitement, authenticity, smile, tonality)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          userId,
          dateStr,
          contacts,
          presentations,
          creditChecks,
          closes,
          revenue.toFixed(2),
          7 + Math.floor(Math.random() * 3),
          7 + Math.floor(Math.random() * 3),
          8 + Math.floor(Math.random() * 2),
          8 + Math.floor(Math.random() * 2),
          7 + Math.floor(Math.random() * 3)
        );
      }
    }

    console.log('✅ Seed completed successfully!');
    console.log('\n📧 Sample credentials:');
    console.log('Manager: manager@example.com / password123');
    console.log('Rep: john.doe@example.com / password123');
    console.log('Rep: jane.smith@example.com / password123');
    console.log('Rep: mike.wilson@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
