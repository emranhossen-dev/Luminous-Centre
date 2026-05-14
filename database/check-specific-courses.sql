-- Check specific course details with old_price
SELECT 
    id,
    title,
    price,
    old_price,
    CASE 
        WHEN old_price IS NULL THEN 'NO OLD PRICE'
        WHEN old_price > price THEN CONCAT('DISCOUNT: ', ROUND(((old_price - price) / old_price) * 100), '%')
        ELSE 'INVALID'
    END as discount_info
FROM courses
WHERE status = 'published'
ORDER BY price DESC;
