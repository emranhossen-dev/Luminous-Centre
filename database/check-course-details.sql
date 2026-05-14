-- Check specific course details with exact values
SELECT 
    id,
    title,
    price,
    old_price,
    CASE 
        WHEN old_price IS NULL THEN 'NULL'
        WHEN old_price = 0 THEN 'ZERO'
        ELSE CONCAT('VALUE: ', old_price)
    END as old_price_status,
    CASE 
        WHEN old_price IS NOT NULL AND old_price > price THEN 'SHOW DISCOUNT'
        ELSE 'NO DISCOUNT'
    END as should_show_discount
FROM courses
WHERE status = 'published'
ORDER BY price DESC;
