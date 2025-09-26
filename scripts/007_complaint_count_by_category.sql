-- Query to count complaints by category
-- Run this script to see how many complaints are in each category

SELECT 
    category,
    COUNT(*) as complaint_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints), 2) as percentage
FROM complaints 
GROUP BY category 
ORDER BY complaint_count DESC;

-- Additional useful queries:

-- Simple count by category
-- SELECT category, COUNT(*) as complaint_count 
-- FROM complaints 
-- GROUP BY category 
-- ORDER BY complaint_count DESC;

-- Count by category for last 30 days
-- SELECT 
--     category,
--     COUNT(*) as complaint_count
-- FROM complaints 
-- WHERE created_at >= NOW() - INTERVAL '30 days'
-- GROUP BY category 
-- ORDER BY complaint_count DESC;

-- Count by category with status breakdown
-- SELECT 
--     category,
--     COUNT(*) as total_complaints,
--     COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
--     COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
--     COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
-- FROM complaints 
-- GROUP BY category 
-- ORDER BY total_complaints DESC;
