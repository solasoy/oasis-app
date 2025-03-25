-- Migration script to add authentication and access control fields to the participants table

-- Add columns for authentication IDs
ALTER TABLE participants
ADD COLUMN husband_auth_id UUID,
ADD COLUMN wife_auth_id UUID;

-- Add columns for temporary passwords
ALTER TABLE participants
ADD COLUMN husband_temp_password TEXT,
ADD COLUMN wife_temp_password TEXT;

-- Add column for access expiration
ALTER TABLE participants
ADD COLUMN access_expires_at TIMESTAMP WITH TIME ZONE;

-- Add columns to track password changes
ALTER TABLE participants
ADD COLUMN husband_password_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN wife_password_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN welcome_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN welcome_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for faster lookups
CREATE INDEX idx_participants_husband_email ON participants(husband_email);
CREATE INDEX idx_participants_wife_email ON participants(wife_email);
CREATE INDEX idx_participants_husband_auth_id ON participants(husband_auth_id);
CREATE INDEX idx_participants_wife_auth_id ON participants(wife_auth_id);

-- Add constraints to ensure temporary password complexity and security
ALTER TABLE participants
ADD CONSTRAINT chk_husband_temp_password_length 
    CHECK (
        husband_temp_password IS NULL OR 
        (
            length(husband_temp_password) BETWEEN 10 AND 50 AND
            husband_temp_password ~ '[A-Z]' AND  -- At least one uppercase letter
            husband_temp_password ~ '[a-z]' AND  -- At least one lowercase letter
            husband_temp_password ~ '[0-9]' AND  -- At least one number
            husband_temp_password ~ '[!@#$%^&*]'  -- At least one special character
        )
    ),
ADD CONSTRAINT chk_wife_temp_password_length 
    CHECK (
        wife_temp_password IS NULL OR 
        (
            length(wife_temp_password) BETWEEN 10 AND 50 AND
            wife_temp_password ~ '[A-Z]' AND  -- At least one uppercase letter
            wife_temp_password ~ '[a-z]' AND  -- At least one lowercase letter
            wife_temp_password ~ '[0-9]' AND  -- At least one number
            wife_temp_password ~ '[!@#$%^&*]'  -- At least one special character
        )
    );

-- Create a function to automatically clear temporary passwords after access expires
CREATE OR REPLACE FUNCTION clear_temp_passwords()
RETURNS TRIGGER AS $$
BEGIN
    -- Clear temporary passwords 30 days after access expiration or when password is changed
    IF (NEW.access_expires_at IS NOT NULL AND NEW.access_expires_at < NOW() - INTERVAL '30 days') OR
       NEW.husband_password_changed = TRUE OR
       NEW.wife_password_changed = TRUE THEN
        NEW.husband_temp_password = NULL;
        NEW.wife_temp_password = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically clear temporary passwords
CREATE TRIGGER clear_temp_passwords_trigger
BEFORE UPDATE ON participants
FOR EACH ROW
EXECUTE FUNCTION clear_temp_passwords();

-- Add comments to explain the purpose of these fields
COMMENT ON COLUMN participants.husband_auth_id IS 'Supabase Auth user ID for the husband';
COMMENT ON COLUMN participants.wife_auth_id IS 'Supabase Auth user ID for the wife';
COMMENT ON COLUMN participants.husband_temp_password IS 'Temporary password for the husband (stored in plain text for inclusion in welcome email)';
COMMENT ON COLUMN participants.wife_temp_password IS 'Temporary password for the wife (stored in plain text for welcome email)';
COMMENT ON COLUMN participants.access_expires_at IS 'Date when participant access should expire (last day of retreat)';
COMMENT ON COLUMN participants.husband_password_changed IS 'Indicates if the husband has changed their initial password';
COMMENT ON COLUMN participants.wife_password_changed IS 'Indicates if the wife has changed their initial password';
COMMENT ON COLUMN participants.welcome_email_sent IS 'Indicates if the welcome email has been sent';
COMMENT ON COLUMN participants.welcome_email_sent_at IS 'Timestamp of when the welcome email was sent';