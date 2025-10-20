# 🛞 Goodyear Tires POS & Inventory Management System

A modern, full-featured Point of Sale (POS) and inventory management system built specifically for tire retailers, with barcode generation, supplier management, and back order tracking.

## 🚀 Features

### Core Features
- **📊 Dashboard** - Real-time analytics, sales overview, and inventory status
- **🛒 Point of Sale** - Fast checkout with barcode scanning support
- **🛞 Product Management** - Comprehensive tire inventory with barcode generation
- **🏢 Supplier Management** - Track supplier relationships and contacts
- **📦 Back Order Tracking** - Monitor and manage product back orders
- **💰 Sales History** - Detailed transaction records and receipt printing
- **📈 Reports & Analytics** - Visual insights into business performance
- **👥 User Management** - Role-based access control (Admin, Manager, Cashier)

### Technical Features
- Built with **React 18** and **Vite**
- **Supabase** for backend and authentication
- **Tailwind CSS** for modern, responsive UI
- **Barcode generation and scanning** capabilities
- **Recharts** for data visualization
- **Real-time updates** with Supabase subscriptions
- **Print receipts** with barcode
- **Row-level security** for data protection

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier is fine)
- Git for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd goodyear-claveria
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and run the entire contents of `database/goodyear_pos_schema.sql`
4. This will create all necessary tables, indexes, and sample data

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Find these values in your Supabase project settings under **API**.

### 5. Create First Admin User

1. Go to your Supabase dashboard > **Authentication** > **Users**
2. Click **Add user** and create a user with email: `admin@goodyear.com`
3. Set a password (e.g., `admin123`)
4. Copy the user's UUID
5. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO users (id, email, full_name, role) 
   VALUES ('your-user-uuid-here', 'admin@goodyear.com', 'Admin User', 'admin');
   ```

### 6. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 🔐 Default Login

- **Email**: `admin@goodyear.com`
- **Password**: `admin123` (or whatever you set)

## 📁 Project Structure

```
goodyear-claveria/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Loading.jsx
│   │   └── ProtectedRoute.jsx
│   ├── layouts/          # Page layouts
│   │   ├── AuthLayout.jsx
│   │   └── MainLayout.jsx
│   ├── lib/              # Utilities and configs
│   │   └── supabase.js
│   ├── pages/            # Main application pages
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
│   ├── stores/           # State management (Zustand)
│   │   └── authStore.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── database/
│   └── goodyear_pos_schema.sql  # Database schema
├── public/               # Static assets
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Key Components

### Products Management
- Add/edit/delete tire products
- Auto-generate unique barcodes
- Print barcode labels
- Track stock levels with low-stock alerts
- Categorize by tire type (Passenger, SUV, Truck, Performance)

### Point of Sale
- Barcode scanner integration
- Quick product search
- Shopping cart management
- Multiple payment methods (Cash, Card, GCash, Maya)
- Receipt generation and printing

### Back Orders
- Create and track back orders
- Link to suppliers
- Status tracking (Pending → Ordered → Received)
- Automatic stock updates on receipt

### Suppliers
- Manage supplier information
- Contact details and notes
- Link products to suppliers

### Reports
- Sales analytics with charts
- Product performance metrics
- Inventory status overview
- Monthly/weekly trends

## 🔒 User Roles & Permissions

### Admin
- Full system access
- User management
- All CRUD operations

### Manager
- Product management
- Supplier management
- Back order management
- Sales and reports access

### Cashier
- POS access
- View products
- Process sales
- View own sales history

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

### Deploy to Netlify

1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🔧 Configuration

### Barcode Format
Barcodes are generated with the format: `GY{timestamp}{random}`
You can customize this in `src/pages/Products.jsx`:

```javascript
const barcode = `GY${Date.now()}${Math.floor(Math.random() * 1000)}`
```

### Payment Methods
Edit payment methods in `src/pages/POS.jsx`:

```javascript
<option value="cash">Cash</option>
<option value="card">Card</option>
<option value="gcash">GCash</option>
<option value="maya">Maya</option>
```

## 📊 Database Schema

### Main Tables
- `users` - User accounts and roles
- `products` - Tire inventory
- `suppliers` - Supplier information
- `back_orders` - Back order tracking
- `sales` - Sales transactions
- `sale_items` - Individual sale items
- `activity_logs` - System activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
Make sure `.env` file exists with correct credentials.

### Authentication errors
Verify your user exists in both Supabase Auth and the `users` table.

### Build errors
Delete `node_modules` and run `npm install` again.

### Database errors
Ensure all SQL from `goodyear_pos_schema.sql` was executed successfully.

## 📞 Support

For issues or questions, please open an issue on GitHub.

## 🎉 Acknowledgments

- Built with React + Vite
- Powered by Supabase
- Styled with Tailwind CSS
- Icons from Unicode Emoji

---

Made with ❤️ for Goodyear Tire Retailers
