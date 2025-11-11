## 🔐 Protected Routes - Session Testing Guide

### Implementasi

Kedua halaman berikut sekarang memiliki session checking yang proper:

1. **`/setup-profile`** - Setup profil (kalpal/app/setup-profile/page.tsx)
2. **`/dashboard`** - Dashboard utama (calpal/app/dashboard/page.tsx)

### Cara Kerja

**Session Check Flow:**

```
User mengakses /setup-profile atau /dashboard
    ↓
Loading screen ditampilkan ("Memverifikasi session...")
    ↓
Component cek session dengan supabase.auth.getSession()
    ↓
Ada session? ↓ Tidak → Redirect ke /auth/login
             ↓ Ya    → Tampilkan halaman
```

### Testing Manual

#### ✅ Test 1: User Sudah Login

1. Login di `/auth/login`
2. Akses `/setup-profile` atau `/dashboard`
3. **Expected:** Halaman langsung ditampilkan tanpa redirect

#### ✅ Test 2: User Belum Login

1. Clear browser cache/logout
2. Akses `http://localhost:3000/setup-profile` atau `/dashboard` langsung via URL
3. **Expected:**
    - Loading screen muncul sebentar ("Memverifikasi session...")
    - Redirect otomatis ke `/auth/login`

#### ✅ Test 3: Session Expired

1. Login biasa
2. Buka Dev Tools → Application → Cookies
3. Delete cookie session Supabase
4. Refresh halaman atau akses halaman lain
5. **Expected:** Redirect ke login

### State Management

**Dashboard (`page.tsx`):**

-   `isSessionChecking` - Flag untuk tracking saat sedang cek session
-   Ketika `true` → tampilkan loading screen
-   Ketika `false` → tampilkan content

**Setup Profile (`page.tsx`):**

-   `isChecking` - Sama fungsinya dengan `isSessionChecking`

### Loading Screen Design

```tsx
// Minimal loading indicator
<div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
    <div className="text-center space-y-4">
        <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C2E66E]"></div>
        </div>
        <p className="text-gray-600 text-lg">Memverifikasi session...</p>
    </div>
</div>
```

### File yang di-Update

-   ✅ `app/dashboard/page.tsx`

    -   Added `isSessionChecking` state
    -   Enhanced session check with error handling
    -   Added loading screen before rendering content

-   ✅ `app/setup-profile/page.tsx`
    -   (Sudah diupdate di request sebelumnya)
    -   Added `isChecking` state
    -   Enhanced session check dengan router.push redirect
    -   Added loading screen

### Debugging

Jika ada issue, check console untuk:

```
Session check error: [error message]
```

Error ini akan tercatat dan user akan di-redirect ke login untuk safety.

---

**Next Steps (Optional):**

-   Tambahkan auth page protection juga jika diperlukan
-   Implement refresh token logic untuk session yang longer-lived
-   Add error boundary untuk better error handling
