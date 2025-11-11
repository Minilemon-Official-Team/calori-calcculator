# 🔄 Reset Database (Supabase)

## Problem

Foreign key constraint error in `user_achievements` table because achievements don't exist in `achievements` table.

## Solution: Reset Database

### Option 1: Full Reset via Supabase SQL (RECOMMENDED)

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Run this script to clear everything and re-seed:

```sql
-- Drop all tables (this will cascade delete everything)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS food_logs CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS met_activities CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Confirm data is cleared
SELECT * FROM achievements;  -- Should return empty
SELECT * FROM profiles;       -- Should return empty
```

3. Then go to **SQL Editor** and run the full `DATABASE_SETUP.sql`:

    - Copy entire content from `calpal/docs/DATABASE_SETUP.sql`
    - Paste into Supabase SQL Editor
    - Execute

4. Verify:

```sql
-- Check achievements are seeded
SELECT * FROM achievements;

-- Should show:
-- id=1, name='3-Day Streak'
-- id=2, name='1K Calories Burned'
-- id=3, name='Consistent Logger'

-- Check activities are seeded
SELECT * FROM met_activities;

-- Should show 7 activities
```

### Option 2: Disable Achievement Trigger (TEMPORARY)

If you want to keep data but disable achievements:

In Supabase SQL Editor:

```sql
-- Disable achievement triggers temporarily
DROP TRIGGER IF EXISTS food_log_check_achievements ON public.food_logs;
DROP TRIGGER IF EXISTS activity_log_check_achievements ON public.activity_logs;

-- Verify
SELECT * FROM information_schema.triggers
WHERE trigger_name LIKE '%achievement%';
-- Should return empty
```

To re-enable later:

```sql
CREATE TRIGGER food_log_check_achievements
AFTER INSERT ON public.food_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_log_for_achievement();

CREATE TRIGGER activity_log_check_achievements
AFTER INSERT ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_log_for_achievement();
```

## After Reset

1. **Hard refresh browser**: `Ctrl+Shift+R`
2. **Clear LocalStorage**:
    - Open DevTools (F12)
    - Go to **Storage** tab
    - Click **Clear All**
3. **Register new account** or login
4. **Test activity logging** - should work now!

## Verification

After reset, in browser console:

```javascript
// Should work without errors
const response = await fetch("/api/translate", {
    method: "POST",
    body: JSON.stringify({ text: "apel" }),
});
console.log(await response.json());
```

---

## Notes

-   **Why this happens**: Schema changes or incomplete seed data
-   **Achievement trigger**: Attempts to insert achievements when logging food/activity
-   **Foreign key error**: Happens when achievement_id doesn't exist in `achievements` table
-   **Fix robustness**: Updated function to use achievement names instead of IDs (more reliable)
