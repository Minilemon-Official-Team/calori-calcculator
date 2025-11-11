## 🆘 Troubleshooting Guide

### Error: "user_achievements foreign key constraint"

**Symptoms:** When clicking "Log Activity", you get error about `user_achievements` and achievement ID not found.

**Solution:**

1. Open **Supabase SQL Editor**
2. Run this command:

```sql
DROP TRIGGER IF EXISTS food_log_check_achievements ON public.food_logs;
DROP TRIGGER IF EXISTS activity_log_check_achievements ON public.activity_logs;
```

3. Try activity logging again - should work now! ✅

**Why?** Achievement system has triggers that try to insert non-existent achievements. Disabling them fixes the issue temporarily while we redesign the achievement system.

---

**See also:** `docs/ACHIEVEMENT_TRIGGER_FIX.md` for detailed explanation.
