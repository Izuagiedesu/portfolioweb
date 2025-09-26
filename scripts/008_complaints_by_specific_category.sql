-- View all complaints from a specific category
-- Change the category name in the WHERE clause to filter by different categories

-- CHANGE THIS VALUE to view different categories:
-- Available categories: 'Academic Issues', 'Facilities', 'Administrative', 'Student Services', 'Technology', 'Other'

SELECT 
    id,
    title,
    description,
    category,
    status,
    is_anonymous,
    CASE 
        WHEN is_anonymous = true THEN 'Anonymous'
        ELSE student_name
    END as submitted_by,
    student_email,
    created_at,
    updated_at
FROM complaints 
WHERE category = 'Academic Issues'  -- <-- CHANGE THIS CATEGORY NAME
ORDER BY created_at DESC;

-- Alternative queries for different use cases:

-- Get complaints from a category with word count
/*
SELECT 
    id,
    title,
    LEFT(description, 100) || '...' as description_preview,
    category,
    status,
    LENGTH(description) - LENGTH(REPLACE(description, ' ', '')) + 1 as word_count,
    created_at
FROM complaints 
WHERE category = 'Academic Issues'  -- <-- CHANGE THIS CATEGORY NAME
ORDER BY created_at DESC;
*/

-- Get only pending complaints from a category
/*
SELECT 
    id,
    title,
    description,
    category,
    CASE 
        WHEN is_anonymous = true THEN 'Anonymous'
        ELSE student_name
    END as submitted_by,
    created_at
FROM complaints 
WHERE category = 'Academic Issues'  -- <-- CHANGE THIS CATEGORY NAME
    AND status = 'pending'
ORDER BY created_at DESC;
*/

-- Get complaints from a category within date range
/*
SELECT 
    id,
    title,
    category,
    status,
    created_at
FROM complaints 
WHERE category = 'Academic Issues'  -- <-- CHANGE THIS CATEGORY NAME
    AND created_at >= '2024-01-01'
    AND created_at <= '2024-12-31'
ORDER BY created_at DESC;
*/
