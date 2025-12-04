-- Migration script to add inventory_usage tracking table
-- This table tracks when and how inventory items are used

-- Create inventory_usage table
CREATE TABLE IF NOT EXISTS inventory_usage (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    quantity_used DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2) DEFAULT 0,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_usage_inventory_id ON inventory_usage(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_used_at ON inventory_usage(used_at);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_order_id ON inventory_usage(order_id);

-- Add sample usage data (optional - for demonstration)
-- This inserts some sample usage records for the past 30 days
INSERT INTO inventory_usage (inventory_id, quantity_used, unit_cost, used_at, notes)
SELECT 
    i.id,
    (RANDOM() * 50 + 10)::DECIMAL(10,2),
    (RANDOM() * 5 + 1)::DECIMAL(10,2),
    CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days'),
    'Sample usage data'
FROM inventory i
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_usage WHERE inventory_id = i.id
)
LIMIT 10;

-- Create a trigger to automatically update inventory quantity when usage is recorded
CREATE OR REPLACE FUNCTION update_inventory_on_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease inventory quantity when usage is recorded
    UPDATE inventory 
    SET quantity = quantity - NEW.quantity_used,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.inventory_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only if it doesn't exist)
DROP TRIGGER IF EXISTS trigger_update_inventory_on_usage ON inventory_usage;
CREATE TRIGGER trigger_update_inventory_on_usage
    AFTER INSERT ON inventory_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_on_usage();

-- Create a view for easy reporting
CREATE OR REPLACE VIEW inventory_usage_summary AS
SELECT 
    i.id as inventory_id,
    i.ingredient_name,
    i.unit,
    i.quantity as current_quantity,
    i.min_quantity,
    COUNT(iu.id) as total_usage_records,
    COALESCE(SUM(iu.quantity_used), 0) as total_quantity_used,
    COALESCE(AVG(iu.unit_cost), 0) as avg_unit_cost,
    COALESCE(SUM(iu.quantity_used * iu.unit_cost), 0) as total_cost,
    MAX(iu.used_at) as last_used_at
FROM inventory i
LEFT JOIN inventory_usage iu ON i.id = iu.inventory_id
GROUP BY i.id, i.ingredient_name, i.unit, i.quantity, i.min_quantity
ORDER BY total_cost DESC;

COMMENT ON TABLE inventory_usage IS 'Tracks inventory item usage over time for reporting and cost analysis';
COMMENT ON VIEW inventory_usage_summary IS 'Aggregated view of inventory usage for quick reporting';
