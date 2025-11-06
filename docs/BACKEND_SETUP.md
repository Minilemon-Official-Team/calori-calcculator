# ⚙️ CalPal Supabase Backend Setup Guide

This guide explains how to set up and initialize the **CalPal backend** using **Supabase** and **PostgreSQL**.  
It covers database creation, SQL schema setup, authentication configuration, and testing steps.

---

## 🧱 1️⃣ Create Supabase Project

1. Visit [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Configure the project:
   - **Name:** `CalPal`
   - **Region:** `Singapore (Asia)` (recommended for latency)
   - **Database:** PostgreSQL 15+
4. Wait until your project and database are fully provisioned.

---

## 🔐 2️⃣ Configure Authentication

1. Go to **Authentication → Providers**
2. Enable **Email / Password** authentication.
3. (Optional) Under **Policies**, ensure `Enable Row Level Security (RLS)` is active for safety.

---

## ⚙️ 3️⃣ Frontend Environment Setup

In your **Next.js** project, open the `.env.local` file and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
```

💡 Replace `your-project-ref` and `your-anon-key` with actual values from your Supabase dashboard.

---

## 🗄️ 4️⃣ Apply Database Schema

1. Open your **Supabase Dashboard**
2. Navigate to the **SQL Editor**
3. Copy and paste the full contents of `docs/DATABASE_SETUP.sql`
4. Click **Run** to execute the schema setup.

You should now have the following tables created automatically:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to Supabase Auth |
| `food_logs` | User food intake logs |
| `activity_logs` | Logged physical activities |
| `met_activities` | Static list of physical activities and MET values |
| `user_stats` | Gamification coins and totals |
| `achievements` | Static list of unlockable achievements |
| `user_achievements` | Relationship table for user-earned achievements |

---

## 🔁 5️⃣ Confirm Triggers and Functions

After running the script, verify that the following triggers exist:

| Trigger | Description |
|---------|-------------|
| `on_auth_user_created` | Auto-creates a profile when a new user registers |
| `on_profile_created` | Auto-creates a user_stats entry when a profile is made |
| `trg_calories_burned` | Calculates calories burned based on MET value and user weight |
| `food_log_reward` / `activity_log_reward` | Adds coins after each log entry |
| `food_log_check_achievements` / `activity_log_check_achievements` | Checks and awards achievements automatically |

---

## 🌱 6️⃣ Seed Data (Initial Setup)

If not already populated, run the following queries manually in Supabase SQL Editor:

```sql
-- Seed MET activity reference data
INSERT INTO public.met_activities (activity_name, met_value)
VALUES
('Running, 5 mph', 8.3),
('Cycling, 10 mph', 6.8),
('Walking, brisk pace', 4.3),
('Yoga', 3.0),
('Swimming', 7.0),
('Strength training', 5.0),
('House cleaning', 3.5)
ON CONFLICT (activity_name) DO NOTHING;

-- Seed default achievements
INSERT INTO public.achievements (name, description)
VALUES
('3-Day Streak', 'Log food for 3 consecutive days'),
('1K Calories Burned', 'Burn a total of 1000 calories'),
('Consistent Logger', 'Add activity logs every day for a week')
ON CONFLICT DO NOTHING;
```

✅ This ensures that initial activities and achievements are ready for use by the app.

---

## 🧪 7️⃣ Test the Setup

Perform these quick checks to confirm everything works correctly:

| Action | Expected Behavior |
|--------|-------------------|
| Register a new user | A new record appears in `profiles` |
| Add a food log | Entry appears in `food_logs`; calories counted |
| Add an activity log | Entry appears in `activity_logs`; calories auto-calculated |
| Check achievements | `user_achievements` updates with new achievements |
| Check coins | `user_stats.total_coins` increases after logging |

---

## 🔍 8️⃣ Verify RPC Functions

Run these SQL commands in Supabase to confirm the custom RPCs:

```sql
select * from public.get_daily_summary('<user-id>', current_date);
select * from public.get_weekly_summary('<user-id>');
```

You should get summarized calorie data (in/out/net) for the given user.

---

## 🧹 9️⃣ Developer Utilities (Optional)

To reset all data while keeping the schema (for testing or debugging):

```sql
set session_replication_role = replica;

truncate table
  activity_logs,
  food_logs,
  user_achievements,
  user_stats,
  profiles,
  met_activities,
  achievements
restart identity cascade;

set session_replication_role = origin;
```

⚠️ **Warning:** This deletes all user and log data — only run in development environments.

---

## ✅ 1️⃣0️⃣ Verification Queries

To double-check your setup:

```sql
select * from public.profiles limit 5;
select * from public.food_logs order by created_at desc;
select * from public.activity_logs order by created_at desc;
select * from public.user_stats order by updated_at desc;
```

---

## ❤️ Credits

**CalPal Backend**  
Built with ❤️ by the Minilemon Technology Intern Team  
Maintainer: @MohamadSolkhanNawawi

---

## 📄 License

This documentation and associated SQL setup files are open-sourced under the MIT License.  
You are free to use, modify, and distribute with attribution.
