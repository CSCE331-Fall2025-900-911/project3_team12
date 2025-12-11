-- Add temperature column to order_items table
ALTER TABLE order_items 
ADD COLUMN temperature VARCHAR(20) DEFAULT 'cold';

-- Update description
COMMENT ON COLUMN order_items.temperature IS 'Temperature preference: hot or cold';
