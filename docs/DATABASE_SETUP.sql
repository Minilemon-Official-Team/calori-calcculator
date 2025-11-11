-- =========================================
-- 🧠 CalPal Database Schema & Backend Setup (vFinal)
-- =========================================
-- Author: Minilemon Technology Intern Team
-- Maintainer: @MohamadSolkhanNawawi
-- Version: 1.0.0
-- Description:
--   This script initializes all required tables, triggers, and functions
--   for the CalPal Supabase backend. Run this sequentially in Supabase SQL Editor.
--
-- Includes:
--   1️⃣ Core schema (tables & relationships)
--   2️⃣ Automatic triggers (profiles & coins)
--   3️⃣ RPC & functions (log_food, get summaries)
--   4️⃣ Gamification system (achievements & coins)
--   5️⃣ Automatic calorie calculation (trigger)
--
-- Run order:
--   1. Schema & relationships
--   2. Triggers
--   3. RPC functions
--   4. Achievement system
--   5. Seed data
-- =========================================

-- =========================================
-- 1️⃣ EXTENSIONS
-- =========================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================
-- 2️⃣ TABLE: profiles
-- -----------------------------------------
-- Stores basic user data linked to Supabase Auth users.
-- Automatically created via trigger after user signup.
-- =========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  current_weight_kg decimal(5,2) not null,
  target_calories integer default 2000,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint profiles_id_fk foreign key (id) references auth.users(id) on delete cascade
);

-- =========================================
-- 3️⃣ TABLE: food_logs
-- -----------------------------------------
-- Logs of consumed foods. Used for calorie intake calculation.
-- =========================================
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  food_name text not null,
  calories_kcal integer not null,
  serving_qty decimal(5,2) not null,
  serving_unit text not null,
  created_at timestamp default now(),
  constraint fk_food_logs_user foreign key (user_id) references public.profiles(id) on delete cascade
);

-- =========================================
-- 4️⃣ TABLE: met_activities
-- -----------------------------------------
-- Contains predefined MET values for physical activities.
-- =========================================
create table if not exists public.met_activities (
  id serial primary key,
  activity_name text unique not null,
  met_value decimal(4,2) not null,
  created_at timestamp default now()
);

-- =========================================
-- 5️⃣ TABLE: activity_logs
-- -----------------------------------------
-- Logs of performed activities. Calories burned auto-calculated via trigger.
-- =========================================
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  met_activity_id integer not null references public.met_activities(id),
  duration_minutes integer not null,
  calories_burned integer not null,
  created_at timestamp default now(),
  constraint fk_activity_user foreign key (user_id) references public.profiles(id) on delete cascade
);

-- =========================================
-- 6️⃣ TABLE: user_stats
-- -----------------------------------------
-- Stores total coins and gamification stats for each user.
-- =========================================
create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_coins integer default 0,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint fk_user_stats_user foreign key (user_id) references public.profiles(id) on delete cascade
);

-- =========================================
-- 7️⃣ TABLE: achievements
-- -----------------------------------------
-- Static achievement definitions. Seeded on setup.
-- =========================================
create table if not exists public.achievements (
  id serial primary key,
  name text not null,
  description text not null,
  icon_url text,
  created_at timestamp default now()
);

-- =========================================
-- 8️⃣ TABLE: user_achievements
-- -----------------------------------------
-- Join table for achievements earned by users.
-- =========================================
create table if not exists public.user_achievements (
  id serial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id integer not null references public.achievements(id) on delete cascade,
  awarded_at timestamp default now(),
  unique (user_id, achievement_id)
);

-- =========================================
-- 9️⃣ TRIGGER: Auto-create profile when new user signs up
-- =========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from public.profiles where id = new.id;
  if not found then
    insert into public.profiles (id, username, current_weight_kg)
    values (
      new.id,
      concat('user_', substr(new.id::text, 1, 8)),
      0.00::decimal(5,2)
    );
  end if;
  return new;
exception
  when others then
    raise warning 'Trigger handle_new_user failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================
-- 🔟 TRIGGER: Auto-create user_stats when profile created
-- =========================================
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_stats (user_id, total_coins)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
exception
  when others then
    raise warning 'Trigger handle_new_profile failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
after insert on public.profiles
for each row execute function public.handle_new_profile();

-- =========================================
-- 1️⃣1️⃣ FUNCTION: get_daily_summary
-- -----------------------------------------
-- Returns total calories in, out, and net for a given user and date.
-- =========================================
create or replace function public.get_daily_summary(
  p_user_id uuid,
  p_log_date date
)
returns table (
  total_calories_in numeric,
  total_calories_out numeric,
  net_calories numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select
    coalesce((select sum(calories_kcal::numeric)
      from public.food_logs
      where user_id = p_user_id and log_date = p_log_date), 0),
    coalesce((select sum(calories_burned::numeric)
      from public.activity_logs
      where user_id = p_user_id and log_date = p_log_date), 0),
    coalesce((select sum(calories_kcal::numeric)
      from public.food_logs
      where user_id = p_user_id and log_date = p_log_date), 0)
    -
    coalesce((select sum(calories_burned::numeric)
      from public.activity_logs
      where user_id = p_user_id and log_date = p_log_date), 0);
end;
$$;

-- =========================================
-- 1️⃣2️⃣ FUNCTION: get_weekly_summary
-- -----------------------------------------
-- Returns 7-day calorie summary for charts.
-- =========================================
create or replace function public.get_weekly_summary(p_user_id uuid)
returns table(
  log_date date,
  total_in integer,
  total_out integer,
  net_calories integer
)
language sql
as $$
with daily_series as (
  select d::date as log_date
  from generate_series(current_date - interval '6 day', current_date, interval '1 day') as d
),
daily_food as (
  select log_date, sum(calories_kcal) as total_in
  from public.food_logs
  where user_id = p_user_id
  group by log_date
),
daily_activity as (
  select log_date, sum(calories_burned) as total_out
  from public.activity_logs
  where user_id = p_user_id
  group by log_date
)
select
  ds.log_date,
  coalesce(df.total_in, 0)::integer as total_in,
  coalesce(da.total_out, 0)::integer as total_out,
  (coalesce(df.total_in, 0) - coalesce(da.total_out, 0))::integer as net_calories
from daily_series ds
left join daily_food df on ds.log_date = df.log_date
left join daily_activity da on ds.log_date = da.log_date
order by ds.log_date;
$$;

-- =========================================
-- 1️⃣3️⃣ TRIGGER: Add coins when logging food or activity
-- =========================================
create or replace function public.add_coins_on_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_stats
  set total_coins = total_coins + 5,
      updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists food_log_reward on public.food_logs;
create trigger food_log_reward
after insert on public.food_logs
for each row execute function public.add_coins_on_log();

drop trigger if exists activity_log_reward on public.activity_logs;
create trigger activity_log_reward
after insert on public.activity_logs
for each row execute function public.add_coins_on_log();

-- =========================================
-- 1️⃣4️⃣ FUNCTION: check_user_achievements
-- -----------------------------------------
-- Checks and awards achievements based on user logs.
-- =========================================
create or replace function public.check_user_achievements(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Achievement system disabled for now
  -- Function body left empty to prevent errors
  return;
end;
$$;

create or replace function public.handle_log_for_achievement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    perform public.check_user_achievements(new.user_id);
  exception when others then
    -- Log error but don't fail the insert
    raise warning 'Achievement check failed for user %: %', new.user_id, sqlerrm;
  end;
  return new;
end;
$$;

-- Achievement triggers disabled to prevent foreign key errors
-- The achievement system is currently not operational
-- drop trigger if exists food_log_check_achievements on public.food_logs;
-- create trigger food_log_check_achievements
-- after insert on public.food_logs
-- for each row execute function public.handle_log_for_achievement();

-- drop trigger if exists activity_log_check_achievements on public.activity_logs;
-- create trigger activity_log_check_achievements
-- after insert on public.activity_logs
-- for each row execute function public.handle_log_for_achievement();

-- =========================================
-- 1️⃣5️⃣ FUNCTION: calculate_activity_calories
-- -----------------------------------------
-- Automatically calculates calories burned before insert.
-- =========================================
create or replace function public.calculate_activity_calories()
returns trigger
language plpgsql
as $$
declare
  user_weight numeric;
  met_val numeric;
begin
  select current_weight_kg into user_weight
  from public.profiles
  where id = new.user_id;

  select met_value into met_val
  from public.met_activities
  where id = new.met_activity_id;

  if user_weight is null then
    user_weight := 70;
  end if;

  new.calories_burned := round((met_val * 3.5 * user_weight * new.duration_minutes) / 200);
  return new;
end;
$$;

drop trigger if exists trg_calories_burned on public.activity_logs;
create trigger trg_calories_burned
before insert or update on public.activity_logs
for each row execute function public.calculate_activity_calories();

-- =========================================
-- 1️⃣6️⃣ RPC: log_food
-- -----------------------------------------
-- RPC for inserting new food logs (used by frontend).
-- Calculates total calories automatically based on serving quantity.
-- =========================================
create or replace function public.log_food(
  p_user_id uuid,
  p_food_name text,
  p_calories_kcal numeric,
  p_serving_qty numeric,
  p_serving_unit text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.food_logs (
    user_id,
    food_name,
    calories_kcal,
    serving_qty,
    serving_unit,
    log_date
  )
  values (
    p_user_id,
    p_food_name,
    p_calories_kcal * p_serving_qty,
    p_serving_qty,
    p_serving_unit,
    current_date
  );
end;
$$;

-- =========================================
-- 1️⃣7️⃣ SEED DATA: met_activities and achievements
-- =========================================
insert into public.met_activities (activity_name, met_value)
values
('Lari, 8 km/jam', 8.3),
('Sepeda, 16 km/jam', 6.8),
('Jalan cepat', 4.3),
('Yoga', 3.0),
('Renang', 7.0),
('Latihan kekuatan', 5.0),
('Bersih-bersih rumah', 3.5),
('Berkebun', 4.0),
('Senam pagi', 4.5),
('Futsal', 7.0),
('Volleyball pantai', 6.0),
('Bersepeda gunung', 7.5),
('Bermain bola kaki', 7.0),
('Berjalan kaki santai', 2.9),
('Tari tradisional', 4.0),
('Berenang gaya bebas', 7.5),
('Lari maraton', 12.0),
('Lempar lembing', 6.0),
('Berkuda', 5.5),
('Angkat beban', 6.0),
('Berenang gaya dada', 6.5),
('Tai chi', 3.5),
('Mendaki gunung', 8.0),
('Jogging santai', 5.0),
('Berkemah', 3.0),
('Bermain sepak takraw', 6.5),
('Bermain tenis', 7.0),
('Bersih-bersih halaman', 3.0),
('Berenang gaya punggung', 6.0),
('Lari interval', 9.0),
('Bermain badminton', 6.0),
('Basket', 7.5),
('Golf (jalan kaki)', 4.3),
('Panjat tebing', 8.5),
('Ski air', 7.0),
('Parkour', 10.0),
('Bersepeda santai', 4.0),
('Pijat relaksasi', 2.0),
('Olahraga bela diri', 7.0),
('Jogging cepat', 6.5),
('Lari trail', 8.5),
('Lompat tali', 10.0),
('Hiking', 7.0),
('Skateboard', 5.0),
('Berenang gaya kupu-kupu', 9.0),
('Wushu', 7.5),
('Trekking', 7.5),
('Ski salju', 8.0),
('Mendayung kano', 5.5),
('Ski lintas alam', 7.0),
('Panahan', 4.0),
('Aerobik', 6.0),
('Berenang santai', 4.0),
('Kebugaran kelas', 5.0),
('Bodycombat', 6.5),
('Bergulat', 8.0),
('Lari cepat', 9.5),
('Berenang dengan alat', 5.5),
('Berjalan di pasir', 5.5),
('Bermain frisbee', 4.0),
('Kickboxing', 8.0),
('Squash', 8.0),
('Lempar cakram', 6.5),
('Tai Chi', 3.5),
('Berenang di kolam renang', 5.5),
('Menari zumba', 6.5),
('Bermain ping pong', 4.5),
('Jalan kaki santai', 2.9),
('Lari sprint', 12.0),
('Berjalan di bukit', 5.5),
('Naik sepeda listrik', 3.5),
('Lari gunung', 9.0),
('Bermain bola voli', 7.0),
('Bermain skateboard', 5.0),
('Jalan-jalan pagi', 3.5),
('Berenang dengan gaya bebas', 6.0),
('Menggendong anak', 3.5),
('Jogging ringan', 5.0),
('Panen padi', 4.0),
('Lari di tempat', 7.0),
('Ski air', 7.5),
('Bermain sepak bola', 7.0),
('Senam aerobik', 5.5),
('Bersepeda kota', 4.5),
('Mengangkat barang berat', 6.0),
('Panjat tebing luar ruang', 8.5),
('Mandi dengan cepat', 1.5),
('Membawa barang berat', 3.0),
('Bermain bola tangan', 6.0),
('Latihan sepeda statis', 6.0),
('Menggunakan alat kebugaran', 5.0),
('Melakukan push-up', 8.0),
('Gulat', 7.5),
('Berjalan di mall', 3.0),
('Lari cepat interval', 10.0),
('Jalan kaki ringan', 3.0),
('Memancing', 3.0),
('Berkendara sepeda', 3.5),
('Melompat', 7.0),
('Berjalan naik tangga', 8.0),
('Jalan di pantai', 3.5),
('Menyapu halaman', 3.0),
('Bermain bola basket', 6.5),
('Bermain badminton', 6.0),
('Berlari dengan anak', 4.5),
('Cuci mobil', 3.0),
('Kebugaran kelas high-intensity', 7.0),
('Bermain tenis meja', 5.0),
('Sepak bola pantai', 6.5),
('Nge-gym', 5.5),
('Sepeda dalam ruangan', 6.5),
('Berjalan dengan kecepatan tinggi', 4.5),
('Lari jarak jauh', 8.0),
('Renang gaya dada', 6.5),
('Berjalan cepat naik bukit', 6.5),
('Mengajar yoga', 4.0),
('Naik sepeda gunung', 7.0),
('Bermain sepak bola pantai', 6.5),
('Melakukan gerakan planking', 8.0),
('Panjat tebing indoor', 7.5),
('Berjalan dengan anjing', 3.0),
('Mendayung', 4.5),
('Main voli pantai', 6.5)
on conflict (activity_name) do nothing;

-- Hapus semua data pencapaian yang ada sebelumnya
DELETE FROM public.achievements;

-- Menambahkan pencapaian untuk koleksi koin saja
insert into public.achievements (name, description)
values
  ('First Step', 'Diberikan saat kamu memulai langkah pertamamu di aplikasi.'),
  ('Getting Started', 'Diberikan ketika kamu mencapai 500 koin.'),
  ('On Track', 'Diberikan setelah mencapai 1000 koin.'),
  ('Dedicated', 'Diberikan setelah mengumpulkan 1500 koin.'),
  ('Superstar', 'Diberikan saat kamu mengumpulkan 2500 koin.'),
  ('Champion', 'Diberikan ketika mencapai 10000 koin, pencapaian tertinggi.')
on conflict do nothing;


-- =========================================
-- 1️⃣8️⃣ Translations: food search convert to english language
-- =========================================
-- Membuat tabel jika belum ada
CREATE TABLE IF NOT EXISTS translations (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    source_text TEXT NOT NULL UNIQUE,
    translated_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Menambahkan indeks untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS idx_translations_source_text ON translations(source_text);


-- =========================================
-- ✅ END OF SETUP
-- =========================================



