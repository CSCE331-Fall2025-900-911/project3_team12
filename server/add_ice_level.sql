-- Add ice_level column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS ice_level VARCHAR(20) DEFAULT 'regular';

-- Update any existing records to have regular ice as default
UPDATE order_items 
SET ice_level = 'regular' 
WHERE ice_level IS NULL;
