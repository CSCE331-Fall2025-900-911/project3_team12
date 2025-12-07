-- Add nutrition facts columns to menu_items table
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS calories INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sugar DECIMAL(10, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS protein DECIMAL(10, 2) DEFAULT 0.0;

-- Update existing menu items with nutrition data
-- Values are per medium serving with normal sugar
UPDATE menu_items SET calories = 250, sugar = 25.0, protein = 3.5 WHERE name = 'Original Milk Tea';
UPDATE menu_items SET calories = 240, sugar = 24.0, protein = 3.0 WHERE name = 'Black Milk Tea';
UPDATE menu_items SET calories = 235, sugar = 23.5, protein = 3.2 WHERE name = 'Oolong Milk Tea';
UPDATE menu_items SET calories = 220, sugar = 22.0, protein = 2.8 WHERE name = 'Green Milk Tea';
UPDATE menu_items SET calories = 280, sugar = 26.0, protein = 4.0 WHERE name = 'Capuccino Milk Tea';
UPDATE menu_items SET calories = 290, sugar = 28.0, protein = 2.5 WHERE name = 'Coconut Milk Tea';
UPDATE menu_items SET calories = 310, sugar = 32.0, protein = 3.0 WHERE name = 'Ube Milk Tea';
UPDATE menu_items SET calories = 350, sugar = 20.0, protein = 15.0 WHERE name = 'Protein Shake Milk Tea';
UPDATE menu_items SET calories = 270, sugar = 25.0, protein = 4.5 WHERE name = 'Ice Blend Latte';
UPDATE menu_items SET calories = 200, sugar = 30.0, protein = 1.0 WHERE name = 'Winter Melon Green Tea';
UPDATE menu_items SET calories = 180, sugar = 28.0, protein = 0.8 WHERE name = 'Passionfruit Green Tea';
UPDATE menu_items SET calories = 160, sugar = 26.0, protein = 0.5 WHERE name = 'Mango Green Tea';
UPDATE menu_items SET calories = 150, sugar = 24.0, protein = 0.5 WHERE name = 'Strawberry Lemonade Tea';
UPDATE menu_items SET calories = 190, sugar = 22.0, protein = 2.0 WHERE name = 'Strawberry Matcha';
UPDATE menu_items SET calories = 170, sugar = 27.0, protein = 0.8 WHERE name = 'Peach Oolong Tea';
UPDATE menu_items SET calories = 210, sugar = 18.0, protein = 3.0 WHERE name = 'Secret Matcha';
