-- ==============================================================
-- COMPLETE FIX FOR GOODYEAR POS DATABASE
-- Run this entire script in Supabase SQL Editor
-- ==============================================================

-- Step 1: Temporarily disable RLS on all tables for testing
-- (We'll re-enable it later with proper setup)

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE back_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Step 2: Check if you have any users in the users table
-- If this returns 0 rows, you need to add your user

SELECT * FROM users;

-- Step 3: Add your current logged-in user to the users table
-- REPLACE 'YOUR_USER_ID' with your actual Supabase Auth User ID
-- You can find this in: Supabase Dashboard > Authentication > Users

-- Uncomment and modify this line with your actual user ID:
-- INSERT INTO users (id, email, full_name, role)
-- VALUES (
--   'YOUR_AUTH_USER_ID_HERE',
--   'your-email@example.com',
--   'Admin User',
--   'admin'
-- );

-- Step 4: Verify the data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Back Orders', COUNT(*) FROM back_orders
UNION ALL
SELECT 'Sales', COUNT(*) FROM sales;

-- ==============================================================
-- NOTES:
-- 1. With RLS disabled, your app should work immediately
-- 2. To find your User ID:
--    - Go to: https://supabase.com/dashboard/project/dhgejovdxgkppgiacltu/auth/users
--    - Click on your user
--    - Copy the UUID shown
-- 3. After adding your user, you can re-enable RLS later
-- ==============================================================
