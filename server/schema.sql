-- Database Schema for Bubble Tea Kiosk Application

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS toppings CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create menu_items table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create toppings table
CREATE TABLE toppings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(20) NOT NULL,
    sugar_level VARCHAR(20) NOT NULL,
    toppings JSONB DEFAULT '[]',
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample menu items
INSERT INTO menu_items (name, description, base_price, image_url, category) VALUES
('Original Milk Tea', 'Classic milk tea blend', 5.25, 'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0', 'milk-tea'),
('Black Milk Tea', 'Traditional black tea with creamy milk', 5.25, 'https://images.unsplash.com/photo-1707560664096-12857c4ddb91', 'milk-tea'),
('Oolong Milk Tea', 'Smooth oolong tea with milk', 5.25, 'https://images.unsplash.com/photo-1670468642364-6cacadfb7bb0', 'milk-tea'),
('Green Milk Tea', 'Refreshing green tea with milk', 5.25, 'https://images.unsplash.com/photo-1722478347147-7238a01b78d3', 'milk-tea'),
('Capuccino Milk Tea', 'Coffee-infused milk tea blend', 6.25, 'https://images.unsplash.com/photo-1565600587185-6883f2725f73', 'milk-tea'),
('Coconut Milk Tea', 'Tropical coconut with milk tea', 7.25, 'https://images.unsplash.com/photo-1597406138443-dfaf216f4efa', 'milk-tea'),
('Ube Milk Tea', 'Purple yam sweetness with milk tea', 7.25, 'https://images.unsplash.com/photo-1635687941366-f68b26aabdaf', 'milk-tea'),
('Protein Shake Milk Tea', 'Energizing protein-infused milk tea', 9.75, 'https://images.unsplash.com/photo-1622485831138-b6891b568a97', 'milk-tea'),
('Ice Blend Latte', 'Smooth blended iced latte', 6.25, 'https://images.unsplash.com/photo-1565600587185-6883f2725f73', 'specialty'),
('Winter Melon Green Tea', 'Sweet winter melon with green tea', 8.25, 'https://images.unsplash.com/photo-1722478347147-7238a01b78d3', 'fruit-tea'),
('Passionfruit Green Tea', 'Tangy passionfruit with green tea', 7.25, 'https://images.unsplash.com/photo-1717615720953-300770cd5831', 'fruit-tea'),
('Mango Green Tea', 'Fresh mango with green tea', 3.25, 'https://images.unsplash.com/photo-1717615720953-300770cd5831', 'fruit-tea'),
('Strawberry Lemonade Tea', 'Sweet strawberry with refreshing lemonade', 3.25, 'https://images.unsplash.com/photo-1573500883698-e3ef47a95feb', 'fruit-tea'),
('Strawberry Matcha', 'Strawberry paired with premium matcha', 7.25, 'https://images.unsplash.com/photo-1573500883698-e3ef47a95feb', 'specialty'),
('Peach Oolong Tea', 'Juicy peach with smooth oolong', 7.25, 'https://images.unsplash.com/photo-1717615720953-300770cd5831', 'fruit-tea'),
('Secret Matcha', 'Our exclusive premium matcha blend', 69.25, 'https://images.unsplash.com/photo-1722478347147-7238a01b78d3', 'specialty');

-- Insert toppings
INSERT INTO toppings (name, price) VALUES
('Boba', 0.75),
('Lychee Jelly', 0.75),
('Pudding', 0.85);

-- Create indexes for better query performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at column
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
