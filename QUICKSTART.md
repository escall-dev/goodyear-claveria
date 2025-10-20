# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in project details:
   - Name: `goodyear-pos`
   - Database Password: (save this!)
   - Region: Choose closest to you

### Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy everything from `database/goodyear_pos_schema.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned"

### Step 4: Get API Credentials

1. In Supabase, go to **Settings** → **API**
2. Copy these values:
   - Project URL
   - anon public key

### Step 5: Configure Environment

1. Create `.env` file in project root:
```bash
cp .env.example .env
```

2. Edit `.env` and paste your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@goodyear.com`
   - Password: `admin123` (or your choice)
   - ✅ Auto Confirm User
4. Click **Create user**
5. **Copy the user's UUID** (you'll see it in the list)

### Step 7: Link Auth User to Database

1. Go back to **SQL Editor**
2. Run this query (replace `USER_UUID_HERE` with the UUID you copied):

```sql
INSERT INTO users (id, email, full_name, role) 
VALUES ('USER_UUID_HERE', 'admin@goodyear.com', 'Admin User', 'admin');
```

### Step 8: Start the App

```bash
npm run dev
```

The app will open at http://localhost:3000

### Step 9: Login

- Email: `admin@goodyear.com`
- Password: `admin123` (or what you set)

---

## ✅ You're Done!

The system comes with:
- ✨ 3 sample suppliers
- 🛞 10 sample tire products with barcodes
- 📦 3 sample back orders

### What's Next?

1. **Explore the Dashboard** - See sample analytics
2. **Try the POS** - Process a test sale
3. **Add Products** - Create your own tire inventory
4. **Invite Team** - Add more users (cashiers, managers)
5. **Customize** - Update branding, add more features

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
→ Check your `.env` file exists and has the correct values

### "Invalid API key"
→ Make sure you copied the **anon public** key, not the service role key

### Can't login
→ Verify the user exists in both Authentication AND the users table

### Database errors
→ Re-run the entire SQL script from `database/goodyear_pos_schema.sql`

### Port 3000 already in use
→ Stop other apps using port 3000, or edit `vite.config.js` to use a different port

---

## 📚 Resources

- [Full Documentation](README_NEW.md)
- [Migration Guide](MIGRATION_GUIDE.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)

---

**Need help?** Open an issue on GitHub or check the documentation!
