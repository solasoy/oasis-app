-- SQL script to create the admins table in Supabase

-- Create the admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS admins_email_idx ON admins (email);

-- Add RLS (Row Level Security) policies
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows only authenticated users to view admins
CREATE POLICY "Authenticated users can view admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows only authenticated users with admin role to insert/update/delete
CREATE POLICY "Only admins can modify admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN (SELECT email FROM admins)
  );

-- Insert an initial admin user (replace with your email and name)
-- This will be your first admin user that can access the admin portal
INSERT INTO admins (email, name, created_at)
VALUES ('your-email@example.com', 'Your Name', NOW())
ON CONFLICT (email) DO NOTHING;

-- To verify the table was created and the admin was added successfully, run:
-- SELECT * FROM admins;