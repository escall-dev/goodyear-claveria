# 🛞 Goodyear Tires POS & Inventory Management System

> **Modern, React-based Point of Sale system for tire retailers with barcode generation, supplier management, and comprehensive inventory tracking.**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 What's New?

This project has been **completely converted** from a PHP-based coffee shop POS to a modern React + Supabase Goodyear Tires POS system!

### Before → After
- ❌ PHP + MySQL → ✅ **React + Supabase (PostgreSQL)**
- ❌ Coffee products → ✅ **Tire inventory with barcodes**
- ❌ Basic features → ✅ **100+ advanced features**
- ❌ No barcode support → ✅ **Full barcode generation & scanning**
- ❌ Limited reporting → ✅ **Comprehensive analytics with charts**

---

## ✨ Features

### 🛒 Point of Sale
- Visual product selection
- Barcode scanning support
- Shopping cart management
- Multiple payment methods (Cash, Card, GCash, Maya)
- Receipt generation with barcode
- Print functionality

### 🛞 Product Management
- Tire-specific fields (brand, size, category)
- Automatic barcode generation
- Print barcode labels
- Low stock alerts
- Supplier linkage
- Stock tracking

### 🏢 Supplier Management
- Complete supplier profiles
- Contact information tracking
- Product-supplier relationships
- Notes and history

### 📦 Back Order Tracking
- Create and manage back orders
- Status workflow (Pending → Ordered → Received)
- Expected delivery dates
- Automatic stock updates

### 📊 Dashboard & Analytics
- Real-time statistics
- Weekly sales charts
- Recent transactions
- Low stock alerts
- Revenue tracking

### 📈 Reports
- Visual charts (Line, Bar, Pie)
- Sales trends analysis
- Product performance metrics
- Inventory insights
- Custom date ranges

### 👥 User Management
- Role-based access (Admin, Manager, Cashier)
- Secure authentication
- User profiles
- Activity logging

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Set up Supabase database
# Go to your Supabase dashboard
# Run SQL from database/goodyear_pos_schema.sql

# 4. Start development server
npm run dev
```

### First Login
- Email: `admin@goodyear.com`
- Password: (set during user creation)

📖 **Detailed setup instructions:** [QUICKSTART.md](QUICKSTART.md)

---

## 📁 Project Structure

```
├── src/
│   ├── components/      # Reusable UI components
│   ├── layouts/         # Page layouts
│   ├── lib/             # Utilities & Supabase config
│   ├── pages/           # Main application pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Suppliers.jsx
│   │   ├── BackOrders.jsx
│   │   ├── POS.jsx
│   │   ├── Sales.jsx
│   │   ├── Reports.jsx
│   │   ├── Users.jsx
│   │   └── Profile.jsx
│   ├── stores/          # State management (Zustand)
│   ├── App.jsx
│   └── main.jsx
├── database/
│   └── goodyear_pos_schema.sql
├── public/
└── Documentation files...
```

---

## 🛠️ Technology Stack

**Frontend:**
- React 18 - UI framework
- Vite - Build tool
- React Router v6 - Navigation
- Tailwind CSS - Styling
- Recharts - Data visualization
- React Barcode - Barcode generation
- Zustand - State management

**Backend:**
- Supabase - Backend as a Service
- PostgreSQL - Database
- Supabase Auth - Authentication
- Row-level Security - Data protection

---

## 📚 Documentation

Comprehensive documentation is available:

| Document | Description |
|----------|-------------|
| [INDEX.md](INDEX.md) | Documentation index and navigation |
| [QUICKSTART.md](QUICKSTART.md) | Get started in 5 minutes ⭐ |
| [FEATURES.md](FEATURES.md) | Complete feature list (100+) |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | PHP to React migration guide |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment checklist |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture diagrams |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Project overview |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## 🎯 Use Cases

Perfect for:
- ✅ Tire retail shops
- ✅ Auto service centers
- ✅ Tire distributors
- ✅ Multi-location tire stores
- ✅ Automotive parts retailers

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

📖 **Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🔒 Security

- JWT-based authentication
- Row-level security (RLS)
- Role-based access control
- Secure password hashing
- Environment variable protection
- Activity logging
- API key protection

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🐛 Troubleshooting

### Common Issues

**Can't login?**
- Verify user exists in both Supabase Auth and users table
- Check credentials match

**Environment variables not working?**
- Ensure `.env` file exists
- Verify `VITE_` prefix for all variables

**Database errors?**
- Re-run complete SQL schema
- Check Supabase connection

📖 **More help:** See "Troubleshooting" in [QUICKSTART.md](QUICKSTART.md)

---

## 📞 Support

- **Documentation**: Check the docs in this repository
- **Supabase Help**: https://supabase.com/docs
- **React Help**: https://react.dev
- **Issues**: Open an issue on GitHub

---

## 🎉 Acknowledgments

- Built with React + Vite
- Powered by Supabase
- Styled with Tailwind CSS
- Icons from Unicode Emoji

---

## 📊 Project Stats

- **10+** Fully functional pages
- **100+** Features implemented
- **7** Database tables
- **8+** Documentation files
- **1** Amazing POS system! 🎊

---

## 🗺️ Roadmap

### Version 1.1.0 (Q4 2025)
- [ ] Email receipts
- [ ] SMS notifications
- [ ] Camera barcode scanning
- [ ] Product images
- [ ] Bulk import/export

### Version 2.0.0 (Q1 2026)
- [ ] Mobile app
- [ ] Offline mode
- [ ] Multi-store support
- [ ] Advanced analytics
- [ ] Inventory forecasting

---

**Ready to transform your tire shop? Let's go! 🚀**

*Version 1.0.0 - January 2025*

---

**Made with ❤️ for tire retailers everywhere**

## Directory Structure

```
camp_of_coffee/
├── ajax/                   # AJAX handlers
├── assets/                 # Images and static assets
├── config/                 # Configuration files
├── database/              # Database schema
├── includes/              # PHP includes and functions
├── dashboard.php          # Main dashboard
├── login.php             # Login page
├── logout.php            # Logout handler
├── products.php          # Product management
├── sales.php             # Point of Sale
├── reports.php           # Sales reports
├── users.php             # User management (Admin only)
└── index.php             # Entry point
```

## User Roles

### Admin
- Full access to all features
- Can manage users
- Can view all reports
- Can manage products and inventory

### Cashier
- Can process sales
- Can view products
- Can view own sales
- Cannot manage users

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- Prepared statements to prevent SQL injection
- Role-based access control
- Input validation and sanitization

## Usage

### Processing a Sale
1. Navigate to the Sales page
2. Click on products to add them to cart
3. Adjust quantities as needed
4. Click "Process Sale" to complete the transaction

### Managing Products
1. Go to Products page
2. Add new products with name, category, price, and stock
3. Edit existing products
4. Monitor low stock items (< 20 units)

### Viewing Reports
1. Access Reports page
2. Select date range
3. View sales or product reports
4. Export to CSV for further analysis

## License

This project is licensed under the MIT License.
