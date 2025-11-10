-- Quick queries to view your orders and data

-- View most recent 10 orders with summary
SELECT 
    o.id as order_id,
    o.total_price,
    o.status,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total_price, o.status, o.created_at
ORDER BY o.created_at DESC
LIMIT 10;

-- View order details with item names
SELECT 
    o.id as order_id,
    o.total_price as order_total,
    o.status,
    o.created_at as order_time,
    mi.name as drink_name,
    oi.quantity,
    oi.size,
    oi.sugar_level,
    oi.price as item_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN menu_items mi ON oi.menu_item_id = mi.id
ORDER BY o.created_at DESC
LIMIT 20;

-- Sales summary
SELECT 
    COUNT(*) as total_orders,
    SUM(total_price) as total_revenue,
    AVG(total_price) as avg_order_value,
    MIN(created_at) as first_order,
    MAX(created_at) as last_order
FROM orders;

-- Most popular drinks
SELECT 
    mi.name,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
GROUP BY mi.name
ORDER BY times_ordered DESC
LIMIT 10;

-- Orders by status
SELECT 
    status,
    COUNT(*) as count,
    SUM(total_price) as total_value
FROM orders
GROUP BY status
ORDER BY count DESC;

-- Recent orders (simple view)
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Recent order items (simple view)
SELECT * FROM order_items ORDER BY created_at DESC LIMIT 10;

-- All menu items
SELECT * FROM menu_items ORDER BY category, name;

-- All toppings
SELECT * FROM toppings ORDER BY name;
