-- Goal Sheet App Database Schema

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    role VARCHAR(20) DEFAULT 'rep' CHECK (role IN ('rep', 'leader', 'manager', 'admin')),
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Daily performance tracking
CREATE TABLE IF NOT EXISTS daily_performance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Daily numbers
    contacts INTEGER DEFAULT 0 CHECK (contacts >= 0),
    turn_and_burns INTEGER DEFAULT 0 CHECK (turn_and_burns >= 0),
    presentations INTEGER DEFAULT 0 CHECK (presentations >= 0),
    credit_checks INTEGER DEFAULT 0 CHECK (credit_checks >= 0),
    closes INTEGER DEFAULT 0 CHECK (closes >= 0),
    revenue DECIMAL(10, 2) DEFAULT 0 CHECK (revenue >= 0),

    -- BEAST factors (1-10 scale)
    body_language INTEGER CHECK (body_language BETWEEN 1 AND 10),
    excitement INTEGER CHECK (excitement BETWEEN 1 AND 10),
    authenticity INTEGER CHECK (authenticity BETWEEN 1 AND 10),
    smile INTEGER CHECK (smile BETWEEN 1 AND 10),
    tonality INTEGER CHECK (tonality BETWEEN 1 AND 10),

    -- Calculated fields (updated via triggers or application logic)
    contact_to_presentation_ratio DECIMAL(5, 2),
    presentation_to_credit_ratio DECIMAL(5, 2),
    close_rate DECIMAL(5, 2),

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one entry per user per day
    UNIQUE(user_id, date)
);

-- Weekly goals tracking
CREATE TABLE IF NOT EXISTS weekly_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,

    -- Target goals
    target_contacts INTEGER DEFAULT 0,
    target_presentations INTEGER DEFAULT 0,
    target_closes INTEGER DEFAULT 0,
    target_revenue DECIMAL(10, 2) DEFAULT 0,

    -- Stretch goals
    stretch_contacts INTEGER DEFAULT 0,
    stretch_presentations INTEGER DEFAULT 0,
    stretch_closes INTEGER DEFAULT 0,
    stretch_revenue DECIMAL(10, 2) DEFAULT 0,

    -- Actual performance (calculated from daily_performance)
    actual_contacts INTEGER DEFAULT 0,
    actual_presentations INTEGER DEFAULT 0,
    actual_closes INTEGER DEFAULT 0,
    actual_revenue DECIMAL(10, 2) DEFAULT 0,

    -- Weekly reflection
    wins TEXT,
    challenges TEXT,
    learnings TEXT,
    next_week_focus TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one entry per user per week
    UNIQUE(user_id, week_start_date)
);

-- 6996 Framework goal setting
CREATE TABLE IF NOT EXISTS six996_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,

    -- 5 Dimensional Goals
    physical_goal TEXT,
    mental_goal TEXT,
    spiritual_goal TEXT,
    relational_goal TEXT,
    financial_goal TEXT,

    -- 6-9 (Outside Work)
    outside_work_activities TEXT,

    -- 9-6 (During Work)
    during_work_activities TEXT,

    -- Visualization
    visualization_exercise TEXT,

    -- Habit Replacement
    old_habit TEXT,
    new_habit TEXT,

    -- Progress tracking
    completed BOOLEAN DEFAULT false,
    progress_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, week_start_date)
);

-- Coaching history and automated feedback
CREATE TABLE IF NOT EXISTS coaching_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Bottleneck identification
    primary_bottleneck VARCHAR(50),
    bottleneck_severity VARCHAR(20) CHECK (bottleneck_severity IN ('low', 'medium', 'high', 'critical')),

    -- Coaching message
    coaching_message TEXT NOT NULL,
    coaching_type VARCHAR(50) CHECK (coaching_type IN ('contacts', 'presentation_ratio', 'credit_ratio', 'close_rate', 'consistency', 'celebration')),

    -- Context data
    contacts_ratio DECIMAL(5, 2),
    presentation_ratio DECIMAL(5, 2),
    close_rate DECIMAL(5, 2),

    -- Follow-up tracking
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP,
    manager_reviewed BOOLEAN DEFAULT false,
    manager_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_performance_user_date ON daily_performance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_performance_date ON daily_performance(date);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_week ON weekly_goals(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_six996_goals_user_week ON six996_goals(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_coaching_history_user_date ON coaching_history(user_id, date);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_performance_updated_at BEFORE UPDATE ON daily_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_goals_updated_at BEFORE UPDATE ON weekly_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_six996_goals_updated_at BEFORE UPDATE ON six996_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
