# 🚀 Quick Database Setup Guide

## Step 1: Run the Database Schema

### Option A: Copy from File
1. Open `database/goodyear_pos_schema.sql`
2. Select all (Ctrl+A) and copy (Ctrl+C)
3. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/dhgejovdxgkppgiacltu/sql/new
4. Paste and click "Run"

### Option B: Direct Link
Click here to access SQL Editor: https://supabase.com/dashboard/project/dhgejovdxgkppgiacltu/sql/new

Then paste the entire contents of `database/goodyear_pos_schema.sql` and run it.

## Step 2: Create Your Admin User

### A. Create Auth User
1. Go to: https://supabase.com/dashboard/project/dhgejovdxgkppgiacltu/auth/users
2. Click "Add User" > "Create new user"
3. Enter:
   - Email: `admin@goodyear.com` (or your preferred email)
   - Password: (choose a secure password and remember it!)
   - ✅ Check "Auto Confirm User"
4. Click "Create User"
5. **COPY THE USER ID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### B. Link to Database
1. Go back to SQL Editor: https://supabase.com/dashboard/project/dhgejovdxgkppgiacltu/sql/new
2. Run this SQL (replace `YOUR_USER_ID` with the ID you copied):

```sql
-- Add admin user to users table
INSERT INTO users (id, email, full_name, role)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with actual User ID from step A
  'admin@goodyear.com',  -- Same email as step A
  'Admin User',          -- Can change this to your name
  'admin'                -- Role: admin, manager, or cashier
);
```

## Step 3: Restart Your Dev Server

```bash
# In your terminal, press Ctrl+C to stop the server, then:
npm run dev
```

## Step 4: Login and Test

1. Open http://localhost:3000
2. Login with:
   - Email: `admin@goodyear.com`
   - Password: (the password you set in Step 2A)
3. Try adding a supplier!

## ✅ Verification Checklist

After setup, verify these tables exist in Supabase Table Editor:
- [ ] users
- [ ] suppliers
- [ ] products
- [ ] back_orders
- [ ] sales
- [ ] sale_items
- [ ] activity_logs

## 🆘 Still Having Issues?

### Error: "Failed to add supplier"
- ✅ Check: Did you run the SQL schema?
- ✅ Check: Is your .env file configured correctly?
- ✅ Check: Did you restart the dev server after updating .env?

### Error: "Row Level Security policy violation"
- ✅ You need to create a user in Supabase Auth
- ✅ Link that user to the users table (Step 2B above)
- ✅ Make sure you're logged in with that user

### Can't login
- ✅ User must exist in Supabase Auth
- ✅ User must also exist in users table (linked by ID)
- ✅ Email and password must match

## 📞 Need More Help?

Check these files:
- `QUICKSTART.md` - Complete setup guide
- `README.md` - Project overview
- `INDEX.md` - All documentation

---

**Your Supabase Project:**
- Project: goodyear-claveria
- ID: dhgejovdxgkppgiacltu
- URL: https://dhgejovdxgkppgiacltu.supabase.co
