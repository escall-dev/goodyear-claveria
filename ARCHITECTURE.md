# 🏗️ Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              React Application (SPA)                    │    │
│  │                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │   Pages     │  │ Components  │  │   Stores    │   │    │
│  │  │             │  │             │  │             │   │    │
│  │  │ • Login     │  │ • Header    │  │ • authStore │   │    │
│  │  │ • Dashboard │  │ • Sidebar   │  │             │   │    │
│  │  │ • Products  │  │ • Loading   │  │             │   │    │
│  │  │ • POS       │  │ • Protected │  │             │   │    │
│  │  │ • Sales     │  │   Route     │  │             │   │    │
│  │  │ • etc...    │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │           Supabase Client Library                │ │    │
│  │  │  • Authentication                                │ │    │
│  │  │  • Database queries                              │ │    │
│  │  │  • Real-time subscriptions                       │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE CLOUD                            │
│                                                                  │
│  ┌────────────────────┐     ┌────────────────────────────┐     │
│  │  Authentication    │     │    PostgreSQL Database      │     │
│  │                    │     │                             │     │
│  │ • JWT tokens       │────▶│ • users                     │     │
│  │ • User sessions    │     │ • products                  │     │
│  │ • Password hashing │     │ • suppliers                 │     │
│  │                    │     │ • back_orders               │     │
│  └────────────────────┘     │ • sales                     │     │
│                             │ • sale_items                │     │
│  ┌────────────────────┐     │ • activity_logs             │     │
│  │  Row Level         │     │                             │     │
│  │  Security (RLS)    │────▶│ Security policies per table │     │
│  │                    │     │                             │     │
│  └────────────────────┘     └────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────┐                                         │
│  │  RESTful API       │                                         │
│  │  • Auto-generated  │                                         │
│  │  • Type-safe       │                                         │
│  └────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.jsx                                 │
│                    (Router & Providers)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  AuthLayout  │  │  MainLayout  │  │   Routes     │
    │              │  │              │  │              │
    │  • Login bg  │  │  • Sidebar   │  │  • Public    │
    │              │  │  • Header    │  │  • Protected │
    └──────────────┘  └──────┬───────┘  └──────────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
            ┌──────────┬─────────┬─────────┐
            │ Pages    │ Pages   │ Pages   │
            │          │         │         │
            │ Dashboard│ Products│   POS   │
            │          │         │         │
            └──────────┴─────────┴─────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT COMPONENT                               │
│  • User clicks button                                           │
│  • Form submission                                              │
│  • Page navigation                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT HANDLER                                 │
│  • Validate input                                               │
│  • Call API function                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SUPABASE CLIENT                                 │
│  • Build query                                                  │
│  • Add authentication                                           │
│  • Send HTTP request                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE SERVER                                │
│  • Verify JWT token                                             │
│  • Check RLS policies                                           │
│  • Execute query                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL                                    │
│  • Run SQL query                                                │
│  • Return data                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE CHAIN                                │
│  Database → Supabase → Client → Component → UI Update          │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER VISITS APP                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. App.jsx INITIALIZES                                          │
│    • Check for existing session                                 │
│    • Load auth state                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
        ┌─────────────────┐   ┌─────────────────┐
        │  NO SESSION     │   │  SESSION EXISTS │
        │                 │   │                 │
        │ → Redirect to   │   │ → Fetch user    │
        │   Login page    │   │   profile       │
        └────────┬────────┘   └────────┬────────┘
                 │                     │
                 ▼                     ▼
        ┌─────────────────┐   ┌─────────────────┐
        │ 3. LOGIN PAGE   │   │ 4. LOAD APP     │
        │                 │   │                 │
        │ User enters     │   │ Show Dashboard  │
        │ credentials     │   │ Enable features │
        └────────┬────────┘   └─────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ 5. AUTHENTICATE │
        │                 │
        │ Supabase Auth   │
        │ verifies        │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   SUCCESS    │   │    FAILURE   │
│              │   │              │
│ Set session  │   │ Show error   │
│ Load profile │   │ Stay on      │
│ Redirect to  │   │ login page   │
│ Dashboard    │   │              │
└──────────────┘   └──────────────┘
```

## POS Transaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CASHIER OPENS POS PAGE                                       │
│    • Fetch available products                                   │
│    • Initialize empty cart                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ADD PRODUCTS TO CART                                         │
│    • Scan barcode OR                                            │
│    • Search and select OR                                       │
│    • Click product card                                         │
│                                                                  │
│    → Validate stock availability                                │
│    → Update cart state                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. REVIEW CART                                                  │
│    • Adjust quantities                                          │
│    • Remove items                                               │
│    • Add customer name (optional)                               │
│    • Select payment method                                      │
│    • View total                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CHECKOUT BUTTON CLICKED                                      │
│    • Validate cart not empty                                    │
│    • Create sale record                                         │
│    • Create sale items                                          │
│    • Update product stock                                       │
│    • Log activity                                               │
│                                                                  │
│    (All in transaction)                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. SHOW RECEIPT                                                 │
│    • Display receipt modal                                      │
│    • Show barcode                                               │
│    • Show all details                                           │
│    • Enable print                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. PRINT & COMPLETE                                             │
│    • Print receipt (optional)                                   │
│    • Clear cart                                                 │
│    • Ready for next sale                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │  suppliers   │         │  products    │
│              │         │              │         │              │
│ • id (UUID)  │         │ • id         │         │ • id         │
│ • email      │         │ • name       │         │ • barcode    │
│ • full_name  │         │ • contact    │         │ • name       │
│ • role       │         │ • email      │         │ • brand      │
└──────┬───────┘         └──────┬───────┘         │ • category   │
       │                        │                 │ • size       │
       │                        │                 │ • price      │
       │                        │                 │ • stock      │
       │                        │                 │ • supplier_id│
       │                        └─────────────────┤              │
       │                                          └──────┬───────┘
       │                                                 │
       │                                                 │
       ├─────────────────────────────────────────────────┤
       │                                                 │
       ▼                                                 ▼
┌──────────────┐                               ┌──────────────┐
│    sales     │                               │ back_orders  │
│              │                               │              │
│ • id         │                               │ • id         │
│ • user_id    │──┐                            │ • product_id │──┐
│ • total      │  │                            │ • supplier_id│  │
│ • payment    │  │                            │ • quantity   │  │
│ • customer   │  │                            │ • status     │  │
└──────┬───────┘  │                            └──────────────┘  │
       │          │                                              │
       │          │                                              │
       ▼          │                                              │
┌──────────────┐  │                                              │
│  sale_items  │  │                                              │
│              │  │                                              │
│ • id         │  │                                              │
│ • sale_id    │──┘                                              │
│ • product_id │──────────────────────────────────────────────────┘
│ • quantity   │
│ • price      │
│ • subtotal   │
└──────────────┘

       │
       ▼
┌──────────────┐
│activity_logs │
│              │
│ • id         │
│ • user_id    │───────────────┐
│ • action     │               │
│ • details    │               ▼
└──────────────┘         (references users)
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORE                               │
│                       (authStore)                                │
│                                                                  │
│  State:                                                         │
│  • user         - Current authenticated user                    │
│  • profile      - User profile data                             │
│  • loading      - Loading state                                 │
│                                                                  │
│  Actions:                                                       │
│  • initialize() - Check session on app load                     │
│  • signIn()     - Authenticate user                             │
│  • signOut()    - Logout user                                   │
│  • updateProfile() - Update user info                           │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Used by
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ ProtectedRoute│  │  Sidebar.jsx │  │  Header.jsx  │
    │              │  │              │  │              │
    │ Check user   │  │ Show profile │  │ Show name    │
    └──────────────┘  └──────────────┘  └──────────────┘
```

## File Structure Map

```
src/
│
├── main.jsx                 - Entry point
├── App.jsx                  - Main app with routing
├── index.css                - Global styles
│
├── lib/
│   └── supabase.js          - Supabase client config
│
├── stores/
│   └── authStore.js         - Authentication state
│
├── layouts/
│   ├── AuthLayout.jsx       - Login page layout
│   └── MainLayout.jsx       - App layout with sidebar
│
├── components/
│   ├── Header.jsx           - Page header
│   ├── Sidebar.jsx          - Navigation sidebar
│   ├── Loading.jsx          - Loading spinner
│   └── ProtectedRoute.jsx   - Route guard
│
└── pages/
    ├── Login.jsx            - Login page
    ├── Dashboard.jsx        - Analytics dashboard
    ├── Products.jsx         - Product management
    ├── Suppliers.jsx        - Supplier management
    ├── BackOrders.jsx       - Back order tracking
    ├── POS.jsx              - Point of sale
    ├── Sales.jsx            - Sales history
    ├── Reports.jsx          - Reports & charts
    ├── Users.jsx            - User management
    └── Profile.jsx          - User profile
```

## Build Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                                   │
│                                                                  │
│  npm run dev                                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐                                               │
│  │    Vite     │                                               │
│  │             │                                               │
│  │ • HMR       │                                               │
│  │ • Dev server│                                               │
│  │ • Fast      │                                               │
│  └─────────────┘                                               │
│                                                                  │
│  → http://localhost:3000                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION BUILD                              │
│                                                                  │
│  npm run build                                                  │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐                                               │
│  │    Vite     │                                               │
│  │             │                                               │
│  │ • Optimize  │                                               │
│  │ • Minify    │                                               │
│  │ • Bundle    │                                               │
│  │ • Tree shake│                                               │
│  └──────┬──────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │  dist/      │                                               │
│  │             │                                               │
│  │ • index.html│                                               │
│  │ • assets/   │                                               │
│  │   • js      │                                               │
│  │   • css     │                                               │
│  └─────────────┘                                               │
│                                                                  │
│  → Ready for deployment                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

*This architecture enables a fast, scalable, and maintainable POS system*
