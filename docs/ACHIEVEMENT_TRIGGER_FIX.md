# 🔧 Fix: Achievement Trigger Error pada Activity Logging

## ❌ Masalah

Ketika mencoba log aktivitas, muncul error:

```
insert or update on table "user_achievements" violates foreign key constraint
"user_achievements_achievement_id_fkey"
Key (achievement_id)=(2) is not present in table "achievements".
```

## 🔍 Root Cause

Ada **trigger pada tabel `food_logs` dan `activity_logs`** yang otomatis mencoba memasukkan achievement dengan ID tertentu ke `user_achievements` ketika ada insert baru.

Namun, achievement ID tersebut tidak ada di tabel `achievements`, menyebabkan foreign key constraint error.

## ✅ Solusi

Disable triggers yang bermasalah di Supabase SQL Editor.

### Langkah-langkah:

1. **Buka Supabase Console** → SQL Editor
2. **Copy-paste script berikut:**

```sql
-- Drop achievement triggers
DROP TRIGGER IF EXISTS food_log_check_achievements ON public.food_logs;
DROP TRIGGER IF EXISTS activity_log_check_achievements ON public.activity_logs;
```

3. **Run script**
4. **Test kembali** - activity logging seharusnya sudah berfungsi

## 📋 Penjelasan Teknis

Triggers yang dihapus:

-   `food_log_check_achievements` - dipicu saat insert food_log
-   `activity_log_check_achievements` - dipicu saat insert activity_log

Kedua trigger memanggil function `handle_log_for_achievement()` yang mengecek achievement dan mencoba insert ke `user_achievements`.

Karena achievement system belum sepenuhnya terimplementasi dengan benar, triggers ini menyebabkan error instead of helping.

## 🚀 Langkah Selanjutnya

Setelah trigger dihapus, aplikasi akan:

-   ✅ Berhasil log aktivitas tanpa error
-   ✅ Coins tetap bertambah (dari trigger `add_coins_on_log`)
-   ❌ Achievement tidak akan otomatis diberikan (sistem disabled)

Jika ingin re-enable achievement system di masa depan, perlu:

1. Memastikan semua achievement records exist di tabel `achievements`
2. Memperbaiki logic di function `check_user_achievements()`
3. Re-create triggers dengan error handling yang lebih baik

---

**File yang berkaitan:**

-   `docs/DATABASE_SETUP.sql` - Database schema
-   `docs/FIX_ACHIEVEMENT_TRIGGER.sql` - SQL fix script
