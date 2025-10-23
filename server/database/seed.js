import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'goalsheet',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');

    // Create sample users
    const password = await bcrypt.hash('password123', 10);

    // Manager
    const managerResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, position, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['manager@example.com', password, 'Sarah', 'Johnson', 'Sales Manager', 'manager']
    );

    const managerId = managerResult.rows[0]?.id;

    // Sales Reps
    const reps = [
      ['john.doe@example.com', 'John', 'Doe', 'Sales Representative'],
      ['jane.smith@example.com', 'Jane', 'Smith', 'Sales Representative'],
      ['mike.wilson@example.com', 'Mike', 'Wilson', 'Sales Representative'],
    ];

    for (const [email, firstName, lastName, position] of reps) {
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, position, role, manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [email, password, firstName, lastName, position, 'rep', managerId]
      );
    }

    // Add sample daily performance for current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const daysToAdd = dayOfWeek === 0 ? 0 : -dayOfWeek; // Go back to Sunday

    const users = await client.query(`SELECT id FROM users WHERE role = 'rep'`);

    for (const user of users.rows) {
      for (let i = 0; i <= dayOfWeek && i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + daysToAdd + i);

        const contacts = 60 + Math.floor(Math.random() * 40);
        const presentations = Math.floor(contacts / (5 + Math.random() * 5));
        const creditChecks = Math.floor(presentations / (1.5 + Math.random() * 1));
        const closes = Math.floor(creditChecks * (0.7 + Math.random() * 0.2));
        const revenue = closes * (3000 + Math.random() * 2000);

        await client.query(
          `INSERT INTO daily_performance
           (user_id, date, contacts, presentations, credit_checks, closes, revenue,
            body_language, excitement, authenticity, smile, tonality)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (user_id, date) DO NOTHING`,
          [
            user.id,
            date.toISOString().split('T')[0],
            contacts,
            presentations,
            creditChecks,
            closes,
            revenue.toFixed(2),
            7 + Math.floor(Math.random() * 3),
            7 + Math.floor(Math.random() * 3),
            8 + Math.floor(Math.random() * 2),
            8 + Math.floor(Math.random() * 2),
            7 + Math.floor(Math.random() * 3),
          ]
        );
      }
    }

    console.log('Seed completed successfully!');
    console.log('\nSample credentials:');
    console.log('Manager: manager@example.com / password123');
    console.log('Rep: john.doe@example.com / password123');
    console.log('Rep: jane.smith@example.com / password123');
    console.log('Rep: mike.wilson@example.com / password123');

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
