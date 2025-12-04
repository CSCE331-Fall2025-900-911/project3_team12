-- Migration script to add inventory table
-- This script can be run on an existing database without losing data

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    ingredient_name VARCHAR(255) NOT NULL UNIQUE,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'units',
    min_quantity DECIMAL(10, 2) DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert inventory items if they don't exist
INSERT INTO inventory (ingredient_name, quantity, unit, min_quantity) VALUES
('Water', 1000.00, 'liters', 100.00),
('Milk', 500.00, 'liters', 50.00),
('Sugar', 200.00, 'kg', 20.00),
('Tea', 100.00, 'kg', 10.00),
('Black Tea', 80.00, 'kg', 10.00),
('Oolong Tea', 80.00, 'kg', 10.00),
('Green Tea', 80.00, 'kg', 10.00),
('Coffee', 50.00, 'kg', 5.00),
('Cream', 100.00, 'liters', 10.00),
('Coconut', 60.00, 'kg', 5.00),
('Ube Powder', 40.00, 'kg', 5.00),
('Protein Powder', 50.00, 'kg', 5.00),
('Winter Melon', 60.00, 'kg', 10.00),
('Passionfruit', 70.00, 'kg', 10.00),
('Mango', 80.00, 'kg', 10.00),
('Strawberry Lemonade', 60.00, 'liters', 10.00),
('Strawberry', 75.00, 'kg', 10.00),
('Peach', 70.00, 'kg', 10.00),
('Matcha', 30.00, 'kg', 5.00),
('Boba', 150.00, 'kg', 15.00),
('Lychee Jelly', 100.00, 'kg', 10.00),
('Pudding', 100.00, 'kg', 10.00)
ON CONFLICT (ingredient_name) DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_ingredient ON inventory(ingredient_name);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at 
BEFORE UPDATE ON inventory
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 'Inventory table created successfully!' as message;
SELECT COUNT(*) as total_ingredients FROM inventory;
