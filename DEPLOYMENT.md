# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment of the Goodyear Tires POS system.

## ✅ Pre-Deployment

### 1. Code Quality
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] ESLint checks pass
- [ ] Build succeeds without errors
- [ ] All environment variables set

### 2. Supabase Setup
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies enabled
- [ ] API keys copied
- [ ] Admin user created
- [ ] Sample data imported (optional)

### 3. Environment Configuration
- [ ] `.env` file configured locally
- [ ] Supabase URL correct
- [ ] Supabase anon key correct
- [ ] All secrets secured (not in git)

### 4. Testing
- [ ] Login/logout works
- [ ] All pages load correctly
- [ ] Product CRUD operations work
- [ ] POS checkout flow works
- [ ] Barcodes generate correctly
- [ ] Receipts print correctly
- [ ] Reports display data
- [ ] Mobile responsive checked

## 🏗️ Deployment Steps

### Option A: Deploy to Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
vercel
```

#### Step 4: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `VITE_SUPABASE_URL` = your_supabase_url
- `VITE_SUPABASE_ANON_KEY` = your_anon_key

#### Step 5: Redeploy
```bash
vercel --prod
```

### Option B: Deploy to Netlify

#### Step 1: Build the Project
```bash
npm run build
```

#### Step 2: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 3: Login and Deploy
```bash
netlify login
netlify deploy --prod --dir=dist
```

#### Step 4: Configure Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option C: Manual Deployment

#### Step 1: Build for Production
```bash
npm run build
```

#### Step 2: Upload Files
Upload contents of `dist/` folder to your web host via:
- FTP/SFTP
- cPanel File Manager
- Git deployment
- Cloud storage (S3, etc.)

#### Step 3: Configure Server
Ensure your server:
- Serves `index.html` for all routes (SPA routing)
- Has HTTPS enabled
- Returns correct MIME types

Example Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Example Apache `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## ✅ Post-Deployment

### 1. Verify Deployment
- [ ] Site loads at production URL
- [ ] HTTPS is working
- [ ] Login page appears
- [ ] Can log in with admin account
- [ ] Dashboard loads with data
- [ ] All navigation links work
- [ ] Assets load correctly (images, fonts)

### 2. Test Core Functionality
- [ ] Create a test product
- [ ] Process a test sale
- [ ] View sales history
- [ ] Check reports
- [ ] Test on mobile device
- [ ] Test on different browsers

### 3. Performance Check
- [ ] Run Lighthouse audit
- [ ] Check page load times
- [ ] Verify API response times
- [ ] Check database query performance

### 4. Security Check
- [ ] Environment variables secured
- [ ] No API keys in client code
- [ ] HTTPS enforced
- [ ] RLS policies active
- [ ] Admin access restricted

### 5. User Setup
- [ ] Create additional user accounts
- [ ] Assign roles correctly
- [ ] Test role permissions
- [ ] Send credentials to users

### 6. Data Migration (if applicable)
- [ ] Export data from old system
- [ ] Transform data to new format
- [ ] Import to Supabase
- [ ] Verify data integrity
- [ ] Test with real data

### 7. Documentation
- [ ] Update README with production URL
- [ ] Document any custom configurations
- [ ] Create user guide if needed
- [ ] Note any deployment-specific issues

### 8. Monitoring Setup
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up email alerts
- [ ] Create backup schedule

### 9. Training
- [ ] Train staff on new system
- [ ] Provide user documentation
- [ ] Schedule Q&A session
- [ ] Create video tutorials (optional)

### 10. Go Live
- [ ] Announce to team
- [ ] Update bookmarks
- [ ] Redirect old URL (if applicable)
- [ ] Monitor for issues

## 🔧 Common Deployment Issues

### Issue: Environment Variables Not Working
**Solution:** 
- Redeploy after adding env vars
- Check variable names match exactly
- Verify prefix `VITE_` for Vite apps

### Issue: Routes Return 404
**Solution:**
- Configure server for SPA routing
- Add rewrite rules (see above)
- Check `_redirects` file for Netlify

### Issue: API Errors
**Solution:**
- Verify Supabase URL is correct
- Check API key is anon (public) key
- Ensure RLS policies allow access
- Check network tab for specific errors

### Issue: Slow Loading
**Solution:**
- Enable CDN
- Optimize images
- Check database indexes
- Review large queries

### Issue: Build Fails
**Solution:**
- Check Node.js version
- Clear node_modules and reinstall
- Check for TypeScript errors
- Review build logs

## 📊 Performance Targets

- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 90+
- [ ] First Contentful Paint: < 2s
- [ ] Time to Interactive: < 3s
- [ ] Total Bundle Size: < 500KB

## 🔐 Security Checklist

- [ ] No secrets in code
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] RLS enabled
- [ ] Input validation working
- [ ] XSS protection active
- [ ] Password policy enforced

## 📱 Mobile Testing

Test on:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad
- [ ] Small screens (320px)
- [ ] Medium screens (768px)
- [ ] Large screens (1920px+)

## 🎉 Launch Checklist

- [ ] All tests passed
- [ ] Team trained
- [ ] Backup created
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Users notified
- [ ] Go live!

## 📞 Support Contacts

**Technical Issues:**
- Supabase Support: support@supabase.io
- Vercel Support: vercel.com/support
- Project Repository: [GitHub URL]

**Team Contacts:**
- System Admin: [email]
- Developer: [email]
- Business Owner: [email]

---

## 🔄 Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Weekly: Review sales data
- [ ] Monthly: Update dependencies
- [ ] Monthly: Database backups
- [ ] Quarterly: Security audit
- [ ] Yearly: Review and optimize

### Update Process
1. Test updates locally
2. Deploy to staging (if available)
3. Run full test suite
4. Deploy to production
5. Monitor for issues
6. Rollback if needed

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URL:** _______________  
**Version:** 1.0.0

✅ **Ready to deploy? Let's go!** 🚀
