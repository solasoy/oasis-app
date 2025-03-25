-- SQL script to troubleshoot admin login issues

-- 1. Check if the admins table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'admins'
);

-- 2. Check the structure of the admins table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'admins';

-- 3. Check if there are any records in the admins table
SELECT COUNT(*) FROM admins;

-- 4. Check if your email is in the admins table (replace with your email)
-- Note: Supabase stores emails in lowercase, so make sure to use lowercase
SELECT * FROM admins WHERE email = 'solasoy2000@yahoo.com';

-- 5. Check if there's a case sensitivity issue (replace with your email)
SELECT * FROM admins WHERE LOWER(email) = LOWER('solasoy2000@yahoo.com');

-- 6. If your email is not found, insert it into the admins table
-- Uncomment and modify the following line to add your email to the admins table
-- INSERT INTO admins (email, name, created_at) VALUES ('solasoy2000@yahoo.com', 'Your Name', NOW());

-- 7. Verify the insert worked
-- SELECT * FROM admins WHERE email = 'solasoy2000@yahoo.com';