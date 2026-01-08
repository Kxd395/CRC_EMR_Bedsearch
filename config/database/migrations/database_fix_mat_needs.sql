-- Fix MAT Needs JSON Field Migration
-- Date: September 29, 2025
-- Purpose: Convert plain text MAT needs values to proper JSON objects

-- First, let's see what we have
SELECT 'Current MAT needs values:' as status;
SELECT DISTINCT mat_needs, COUNT(*) as count 
FROM patients 
WHERE mat_needs IS NOT NULL 
GROUP BY mat_needs
ORDER BY count DESC;

-- Update the mat_needs field to convert text strings to JSON objects
UPDATE patients 
SET mat_needs = CASE 
    -- Handle plain text values by converting them to JSON objects
    WHEN mat_needs::text = '"MethadoneContinue"' OR mat_needs::text = 'MethadoneContinue' 
        THEN '{"type": "MethadoneContinue", "status": "active"}'::jsonb
    WHEN mat_needs::text = '"MethadoneInduction"' OR mat_needs::text = 'MethadoneInduction'
        THEN '{"type": "MethadoneInduction", "status": "pending"}'::jsonb
    WHEN mat_needs::text = '"SuboxoneInduction"' OR mat_needs::text = 'SuboxoneInduction'
        THEN '{"type": "SuboxoneInduction", "status": "pending"}'::jsonb
    WHEN mat_needs::text = '"SuboxoneContinue"' OR mat_needs::text = 'SuboxoneContinue'
        THEN '{"type": "SuboxoneContinue", "status": "active"}'::jsonb
    WHEN mat_needs::text = '"None"' OR mat_needs::text = 'None' OR mat_needs::text = '""'
        THEN '{}'::jsonb
    -- If it's already valid JSON, keep it as is
    ELSE 
        CASE 
            WHEN mat_needs IS NULL THEN '{}'::jsonb
            ELSE mat_needs
        END
END
WHERE mat_needs IS NOT NULL 
   AND (
       mat_needs::text ~ '^"?[A-Za-z]+(")?$' -- Matches plain text strings
       OR mat_needs::text = '""'
       OR mat_needs::text = 'null'
   );

-- Set any remaining NULL values to empty JSON
UPDATE patients 
SET mat_needs = '{}'::jsonb 
WHERE mat_needs IS NULL;

-- Verify the results
SELECT 'Updated MAT needs values:' as status;
SELECT DISTINCT mat_needs, COUNT(*) as count 
FROM patients 
GROUP BY mat_needs
ORDER BY count DESC;

-- Show some example records to verify
SELECT id, first_name, last_name, mat_needs 
FROM patients 
LIMIT 10;