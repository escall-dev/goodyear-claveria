-- Goodyear Tires POS System Database Schema
-- This script creates all necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    barcode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Goodyear',
    category TEXT NOT NULL CHECK (category IN ('Passenger', 'SUV', 'Truck', 'Performance', 'All-Season')),
    size TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 5,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Back orders table
CREATE TABLE IF NOT EXISTS back_orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
    expected_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'gcash', 'maya')),
    customer_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_back_orders_status ON back_orders(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_back_orders_updated_at BEFORE UPDATE ON back_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment product stock
CREATE OR REPLACE FUNCTION increment_stock(product_id INTEGER, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock = stock + quantity
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE back_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Users can read all users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can insert/update/delete users
CREATE POLICY "Only admins can modify users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- All authenticated users can read suppliers
CREATE POLICY "Authenticated users can view suppliers" ON suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Managers and admins can modify suppliers
CREATE POLICY "Managers and admins can modify suppliers" ON suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- All authenticated users can read products
CREATE POLICY "Authenticated users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Managers and admins can modify products
CREATE POLICY "Managers and admins can modify products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- All authenticated users can read back orders
CREATE POLICY "Authenticated users can view back orders" ON back_orders
    FOR SELECT USING (auth.role() = 'authenticated');

-- Managers and admins can modify back orders
CREATE POLICY "Managers and admins can modify back orders" ON back_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- All authenticated users can read and create sales
CREATE POLICY "Authenticated users can view sales" ON sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create sales" ON sales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can read and create sale items
CREATE POLICY "Authenticated users can view sale items" ON sale_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create sale items" ON sale_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can read and create activity logs
CREATE POLICY "Authenticated users can view activity logs" ON activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert sample data

-- Sample admin user (you'll need to create this user in Supabase Auth first)
-- Then run: INSERT INTO users (id, email, full_name, role) 
-- VALUES ('your-user-id-from-auth', 'admin@goodyear.com', 'Admin User', 'admin');

-- Sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('Goodyear Philippines Inc.', 'John Doe', 'sales@goodyear.ph', '+63 2 1234 5678', 'Makati City, Metro Manila'),
('Tire Distributors Corp.', 'Jane Smith', 'info@tiredist.com', '+63 2 8765 4321', 'Quezon City, Metro Manila'),
('Premium Tire Supplies', 'Mike Johnson', 'sales@premiumtire.ph', '+63 917 123 4567', 'Pasig City, Metro Manila');

-- Sample products
INSERT INTO products (barcode, name, brand, category, size, price, stock, reorder_level, supplier_id) VALUES
('GY1698765432101', 'Eagle F1 Asymmetric 5', 'Goodyear', 'Performance', '225/45R17', 8500.00, 20, 5, 1),
('GY1698765432102', 'Assurance MaxLife', 'Goodyear', 'Passenger', '195/65R15', 4200.00, 35, 10, 1),
('GY1698765432103', 'Wrangler All-Terrain Adventure', 'Goodyear', 'SUV', '265/70R16', 7800.00, 15, 5, 1),
('GY1698765432104', 'EfficientGrip Performance', 'Goodyear', 'Passenger', '205/55R16', 5500.00, 25, 8, 1),
('GY1698765432105', 'Wrangler HP All Weather', 'Goodyear', 'SUV', '235/60R18', 9200.00, 12, 5, 1),
('GY1698765432106', 'Eagle Sport All-Season', 'Goodyear', 'Performance', '245/40R18', 10500.00, 8, 3, 1),
('DN1698765432107', 'SP Sport Maxx GT', 'Dunlop', 'Performance', '255/35R19', 11800.00, 10, 3, 2),
('DN1698765432108', 'Grandtrek AT3G', 'Dunlop', 'SUV', '265/65R17', 8900.00, 18, 5, 2),
('KL1698765432109', 'Edge HP', 'Kelly', 'Passenger', '185/65R15', 3200.00, 40, 15, 3),
('KL1698765432110', 'Navigator Touring Gold', 'Kelly', 'Passenger', '195/60R15', 3800.00, 30, 12, 3);

-- Sample back orders
INSERT INTO back_orders (product_id, supplier_id, quantity, status, expected_date, notes) VALUES
(1, 1, 10, 'ordered', CURRENT_DATE + INTERVAL '7 days', 'Urgent restock for high-demand tire'),
(6, 1, 5, 'pending', CURRENT_DATE + INTERVAL '14 days', 'Performance tire running low'),
(7, 2, 8, 'pending', CURRENT_DATE + INTERVAL '10 days', 'Premium series reorder');

-- Note: Sales, sale_items, and activity_logs will be populated through the application
