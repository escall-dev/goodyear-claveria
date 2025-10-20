# Migration Guide: PHP to React + Supabase

This guide explains the migration from the old PHP-based coffee shop POS to the new React + Supabase Goodyear Tires POS system.

## What Changed?

### Technology Stack

| Old System | New System |
|------------|------------|
| PHP + MySQL | React + Supabase (PostgreSQL) |
| Session-based auth | JWT-based auth (Supabase Auth) |
| Server-side rendering | Single Page Application (SPA) |
| jQuery | React 18 |
| Bootstrap (if any) | Tailwind CSS |
| No barcode support | Full barcode generation & scanning |

## Database Migration

### Table Mapping

Old tables → New tables:

```
products → products (enhanced with barcode, brand, size, supplier_id)
users → users (extended with Supabase Auth integration)
sales → sales (added customer_name, payment_method)
activity_logs → activity_logs (unchanged structure)

New tables added:
- suppliers (new feature)
- back_orders (new feature)
- sale_items (normalized from sales)
```

### Data Migration Script

If you want to migrate existing data from MySQL to Supabase:

1. Export your MySQL data:
```sql
-- Export products
SELECT * FROM products INTO OUTFILE '/tmp/products.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

2. Transform and import to Supabase:
- Use the Supabase dashboard CSV import
- Or write a Node.js migration script

Sample migration script (`migrate.js`):

```javascript
import { createClient } from '@supabase/supabase-js'
import mysql from 'mysql2/promise'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const mysqlConnection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'camp_of_coffee'
})

// Migrate products
const [products] = await mysqlConnection.execute('SELECT * FROM products')
for (const product of products) {
  await supabase.from('products').insert({
    name: product.name,
    brand: 'Goodyear', // Default
    category: 'Passenger', // Map based on old category
    size: '195/65R15', // Add appropriate size
    price: product.price,
    stock: product.stock,
    barcode: `GY${Date.now()}${Math.random()}`
  })
}
```

## File Structure Changes

### Old PHP Structure
```
├── index.php
├── login.php
├── dashboard.php
├── products.php
├── sales.php
├── config/
│   └── database.php
├── includes/
│   ├── header.php
│   └── footer.php
```

### New React Structure
```
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── POS.jsx
│   │   └── Sales.jsx
│   ├── components/
│   ├── lib/
│   │   └── supabase.js
│   └── stores/
│       └── authStore.js
```

## Feature Mapping

### Authentication

**Old (PHP):**
```php
<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
}
?>
```

**New (React):**
```javascript
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  return children
}
```

### Database Queries

**Old (PHP):**
```php
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();
```

**New (React):**
```javascript
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', id)
  .single()
```

## New Features Not in Old System

1. **Barcode Generation** - Every product gets a unique barcode
2. **Barcode Scanning** - POS supports barcode input
3. **Supplier Management** - Track supplier relationships
4. **Back Orders** - Monitor and manage stock orders
5. **Advanced Analytics** - Charts and visual reports
6. **Real-time Updates** - Changes reflect immediately
7. **Modern UI** - Responsive, mobile-friendly design
8. **Role-based Access** - Granular permissions

## Environment Setup

### Old System Requirements:
- PHP 7.4+
- MySQL 5.7+
- Apache/Nginx
- phpMyAdmin

### New System Requirements:
- Node.js 18+
- Supabase account (cloud)
- npm/yarn
- Modern browser

## Deployment Changes

### Old Deployment (PHP):
1. Upload files via FTP
2. Configure database.php
3. Import SQL to MySQL
4. Set file permissions

### New Deployment (React):
1. Build: `npm run build`
2. Deploy dist/ folder to:
   - Vercel (recommended)
   - Netlify
   - Any static host
3. Configure environment variables
4. Supabase handles database

## Backup Old Files

Before removing PHP files, backup:

```bash
# Create backup directory
mkdir php_backup

# Move old PHP files
mv *.php php_backup/
mv includes/ php_backup/
mv config/ php_backup/
mv ajax/ php_backup/

# Keep database backup
mysqldump -u root camp_of_coffee > php_backup/database_backup.sql
```

## Testing Checklist

After migration, test:

- [ ] User login/logout
- [ ] Product CRUD operations
- [ ] Barcode generation
- [ ] POS checkout flow
- [ ] Sales history viewing
- [ ] Reports and analytics
- [ ] User management (admin only)
- [ ] Supplier management
- [ ] Back order tracking
- [ ] Receipt printing

## Rollback Plan

If you need to rollback:

1. Restore PHP files from `php_backup/`
2. Restore MySQL database
3. Reconfigure Apache/Nginx
4. Keep React version for future migration

## Support & Resources

- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com

## Next Steps

1. ✅ Complete the setup instructions in README_NEW.md
2. ✅ Create your first admin user in Supabase
3. ✅ Configure environment variables
4. ✅ Run the development server
5. ✅ Test all features
6. ✅ Deploy to production

---

*Migration completed on October 20, 2025*
