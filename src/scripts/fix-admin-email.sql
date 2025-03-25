-- SQL script to fix common issues with admin emails

-- 1. Check the current email in the admins table (replace with your email)
SELECT id, email, name, created_at FROM admins WHERE email LIKE '%solasoy2000@yahoo.com%';

-- 2. Check for case sensitivity issues
SELECT id, email, name, created_at FROM admins WHERE LOWER(email) = LOWER('solasoy2000@yahoo.com');

-- 3. Check for whitespace issues
SELECT id, email, name, created_at FROM admins WHERE TRIM(email) = 'solasoy2000@yahoo.com';

-- 4. Fix case sensitivity by converting all emails to lowercase
UPDATE admins SET email = LOWER(email) WHERE email != LOWER(email);

-- 5. Fix whitespace issues by trimming all emails
UPDATE admins SET email = TRIM(email) WHERE email != TRIM(email);

-- 6. Verify the fixes worked
SELECT id, email, name, created_at FROM admins WHERE LOWER(TRIM(email)) = LOWER('solasoy2000@yahoo.com');

-- 7. If you're still having issues, you can try updating your email directly
-- Uncomment and modify the following line to update your email
-- UPDATE admins SET email = 'solasoy2000@yahoo.com' WHERE id = YOUR_ID_NUMBER;

-- 8. If you need to add a new admin record, uncomment and modify the following line
-- INSERT INTO admins (email, name, created_at) VALUES ('solasoy2000@yahoo.com', 'Your Name', NOW());

-- 9. Check the auth.users table to see what email is associated with your account
-- This requires admin access to the auth schema
SELECT id, email FROM auth.users WHERE email LIKE '%solasoy2000@yahoo.com%';

-- 10. Make sure the email in admins table matches exactly with the email in auth.users
-- You can run this query to see if there are any mismatches
SELECT a.id as admin_id, a.email as admin_email, u.id as user_id, u.email as user_email
FROM admins a
LEFT JOIN auth.users u ON LOWER(a.email) = LOWER(u.email)
WHERE u.id IS NULL;