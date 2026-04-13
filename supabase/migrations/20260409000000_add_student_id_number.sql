-- Add student_id_number column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id_number TEXT UNIQUE;

-- Index for fast lookups by student ID number
CREATE INDEX IF NOT EXISTS idx_users_student_id_number ON users(student_id_number);
