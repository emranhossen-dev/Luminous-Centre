-- Check which courses have old_price and which don't
SELECT 
    id,
    title,
    price,
    old_price,
    CASE 
        WHEN old_price IS NULL THEN 'NO OLD PRICE'
        WHEN old_price > price THEN 'HAS DISCOUNT'
        ELSE 'INVALID'
    END as price_status
FROM courses
WHERE status = 'published'
ORDER BY price DESC;

-- Count courses by price range
SELECT 
    CASE 
        WHEN price < 10000 THEN 'Under 10000'
        WHEN price >= 10000 THEN '10000 and above'
    END as price_range,
    COUNT(*) as total,
    COUNT(old_price) as has_old_price
FROM courses
WHERE status = 'published'
GROUP BY price_range;
