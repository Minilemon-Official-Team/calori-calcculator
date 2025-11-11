-- =========================================
-- 🔧 FIX: Disable Achievement Triggers
-- =========================================
-- This script disables the achievement triggers that are causing
-- foreign key constraint errors during activity logging.
-- 
-- The achievement system references non-existent records.
-- Until we implement a proper achievement system, these triggers 
-- should remain disabled.
-- =========================================

-- Drop the achievement triggers
DROP TRIGGER IF EXISTS food_log_check_achievements ON public.food_logs;
DROP TRIGGER IF EXISTS activity_log_check_achievements ON public.activity_logs;

-- Verify triggers are removed
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table IN ('food_logs', 'activity_logs') 
AND trigger_name LIKE '%achievement%';
-- Result should be empty

-- ✅ Now activity and food logging should work without achievement errors
