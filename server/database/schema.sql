-- Goal Sheet App Database Schema (SQLite)

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT,
    role TEXT DEFAULT 'rep' CHECK (role IN ('rep', 'leader', 'manager', 'admin')),
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Daily performance tracking
CREATE TABLE IF NOT EXISTS daily_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    contacts INTEGER DEFAULT 0 CHECK (contacts >= 0),
    turn_and_burns INTEGER DEFAULT 0 CHECK (turn_and_burns >= 0),
    presentations INTEGER DEFAULT 0 CHECK (presentations >= 0),
    credit_checks INTEGER DEFAULT 0 CHECK (credit_checks >= 0),
    closes INTEGER DEFAULT 0 CHECK (closes >= 0),
    revenue REAL DEFAULT 0 CHECK (revenue >= 0),
    body_language INTEGER CHECK (body_language BETWEEN 1 AND 10),
    excitement INTEGER CHECK (excitement BETWEEN 1 AND 10),
    authenticity INTEGER CHECK (authenticity BETWEEN 1 AND 10),
    smile INTEGER CHECK (smile BETWEEN 1 AND 10),
    tonality INTEGER CHECK (tonality BETWEEN 1 AND 10),
    contact_to_presentation_ratio REAL,
    presentation_to_credit_ratio REAL,
    close_rate REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Weekly goals tracking
CREATE TABLE IF NOT EXISTS weekly_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date TEXT NOT NULL,
    week_end_date TEXT NOT NULL,
    target_contacts INTEGER DEFAULT 0,
    target_presentations INTEGER DEFAULT 0,
    target_closes INTEGER DEFAULT 0,
    target_revenue REAL DEFAULT 0,
    stretch_contacts INTEGER DEFAULT 0,
    stretch_presentations INTEGER DEFAULT 0,
    stretch_closes INTEGER DEFAULT 0,
    stretch_revenue REAL DEFAULT 0,
    actual_contacts INTEGER DEFAULT 0,
    actual_presentations INTEGER DEFAULT 0,
    actual_closes INTEGER DEFAULT 0,
    actual_revenue REAL DEFAULT 0,
    wins TEXT,
    challenges TEXT,
    learnings TEXT,
    next_week_focus TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

-- 6996 Framework goal setting
CREATE TABLE IF NOT EXISTS six996_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date TEXT NOT NULL,
    physical_goal TEXT,
    mental_goal TEXT,
    spiritual_goal TEXT,
    relational_goal TEXT,
    financial_goal TEXT,
    outside_work_activities TEXT,
    during_work_activities TEXT,
    visualization_exercise TEXT,
    old_habit TEXT,
    new_habit TEXT,
    completed INTEGER DEFAULT 0,
    progress_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

-- Coaching history and automated feedback
CREATE TABLE IF NOT EXISTS coaching_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    primary_bottleneck TEXT,
    bottleneck_severity TEXT CHECK (bottleneck_severity IN ('low', 'medium', 'high', 'critical')),
    coaching_message TEXT NOT NULL,
    coaching_type TEXT CHECK (coaching_type IN ('contacts', 'presentation_ratio', 'credit_ratio', 'close_rate', 'consistency', 'celebration')),
    contacts_ratio REAL,
    presentation_ratio REAL,
    close_rate REAL,
    acknowledged INTEGER DEFAULT 0,
    acknowledged_at DATETIME,
    manager_reviewed INTEGER DEFAULT 0,
    manager_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_performance_user_date ON daily_performance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_performance_date ON daily_performance(date);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week ON weekly_goals(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_six996_goals_user_week ON six996_goals(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_coaching_history_user_date ON coaching_history(user_id, date);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
