# 🚨 Activity Logging Issue: Foreign Key Error in user_achievements

## Error Message

```
insert or update on table "user_achievements" violates foreign key constraint
"user_achievements_achievement_id_fkey"
```

## Root Cause

✅ **Identified**: The `check_user_achievements()` trigger tries to insert achievements with hardcoded IDs (1, 2) but the `achievements` table in your Supabase database doesn't have these records.

This happens because:

1. Schema was updated but achievements weren't seeded
2. Database wasn't reset after schema changes
3. Achievement IDs don't match actual database records

## Fix Applied ✅

### Code Changes:

1. **Updated `check_user_achievements()` function** to use achievement names instead of hardcoded IDs

    - Before: `insert into user_achievements (user_id, achievement_id) values (p_user_id, 1)`
    - After: Queries achievement by name first, only inserts if exists

2. **Added error handling** to trigger so achievement check doesn't break activity insertion

### File Updated:

-   `calpal/docs/DATABASE_SETUP.sql` - Lines 300-350 (achievement function)

## What You Need To Do

### Step 1: Reset Supabase Database

Go to **Supabase Console** → **SQL Editor** → Run these commands:

```sql
-- Clear all tables
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS food_logs CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS met_activities CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Verify cleared
SELECT COUNT(*) as achievements_count FROM achievements;  -- Should show error (table doesn't exist yet)
```

Then run the full setup:

```sql
-- Copy-paste the ENTIRE content of: calpal/docs/DATABASE_SETUP.sql
-- (starting from line 1 to the end)
```

### Step 2: Verify Achievements Exist

```sql
SELECT * FROM achievements;
```

Should show:

```
id | name                    | description
1  | 3-Day Streak            | Log food for 3 consecutive days
2  | 1K Calories Burned      | Burn a total of 1000 calories
3  | Consistent Logger       | Add activity logs every day for a week
```

### Step 3: Clear Browser Storage

1. Open DevTools: `F12`
2. Go to **Application** tab
3. Click **Clear All** (LocalStorage, SessionStorage, etc.)

### Step 4: Test

1. Hard refresh: `Ctrl+Shift+R`
2. Login to dashboard
3. Try logging an activity
4. Should work without foreign key error! ✅

## Temporary Workaround (If you can't reset database yet)

If you can't reset the database, disable achievements temporarily:

In **Supabase SQL Editor**:

```sql
-- Drop achievement triggers
DROP TRIGGER IF EXISTS food_log_check_achievements ON public.food_logs;
DROP TRIGGER IF EXISTS activity_log_check_achievements ON public.activity_logs;

-- Now activity/food logging should work
-- Re-enable after database is reset:
CREATE TRIGGER food_log_check_achievements
AFTER INSERT ON public.food_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_log_for_achievement();

CREATE TRIGGER activity_log_check_achievements
AFTER INSERT ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_log_for_achievement();
```

## Expected Outcome

✅ Activity logging works without foreign key errors
✅ Food logging works without foreign key errors  
✅ Achievements system ready (after seed data exists)
✅ Coins awarded on successful logs

---

**Questions?**

-   Check browser console for detailed error messages
-   Verify achievements table has seed data
-   Confirm RLS policies allow inserts
