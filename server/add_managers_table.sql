-- Migration script to add managers table
-- This script can be run on an existing database without losing data

-- Create managers table if it doesn't exist
CREATE TABLE IF NOT EXISTS managers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add default manager (change this email to your own email)
INSERT INTO managers (email) 
VALUES ('ayad.r.masud@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_managers_email ON managers(email);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_managers_updated_at 
BEFORE UPDATE ON managers
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 'Managers table created successfully!' as message;
SELECT * FROM managers;
