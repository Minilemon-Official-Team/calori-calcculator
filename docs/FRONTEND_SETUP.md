# 🚀 CalPal Frontend Setup Guide

Dokumen ini menjelaskan cara melakukan instalasi, konfigurasi, dan menjalankan aplikasi **frontend CalPal**. Proyek ini dibangun dengan tumpukan teknologi modern untuk memastikan skalabilitas, kinerja, dan pengalaman pengembang yang baik.

---

## 🧱 1️⃣ Prerequisites

Sebelum memulai, pastikan lingkungan pengembangan Anda memenuhi persyaratan berikut:

- **Backend Ready:** Follow the [**Backend Setup Guide**](./BACKEND_SETUP.md) to initialize your Supabase project.
- **Node.js:** `v18.0` or higher.
- **Package Manager:** `npm`, `yarn`, or `pnpm`.

---

## ✨ 2️⃣ Tech Stack & Libraries

Frontend CalPal dibangun menggunakan beberapa teknologi utama:

| Teknologi / Library | Peran & Kegunaan                                                                    |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Next.js 14**      | Framework React dengan App Router untuk routing, rendering, dan API routes.         |
| **TypeScript**      | Menambahkan _type-safety_ untuk mengurangi bug dan meningkatkan kualitas kode.      |
| **TailwindCSS**     | Framework CSS _utility-first_ untuk styling yang cepat dan konsisten.               |
| **Shadcn/UI**       | Kumpulan komponen UI yang dapat digunakan ulang, dibangun di atas Radix & Tailwind. |
| **Recharts**        | Library untuk membuat grafik dan visualisasi data (misalnya, ringkasan mingguan).   |
| **Framer Motion**   | Library untuk membuat animasi yang halus dan interaktif.                            |
| **Lucide React**    | Pustaka ikon yang ringan dan mudah dikustomisasi.                                   |

---

## ⚙️ 3️⃣ Project Installation

1.  **Clone the Repository**
    Clone the project to your local machine.

    ```bash
    git clone https://github.com/your-username/calori-calcculator.git
    cd calori-calcculator
    ```

2.  **Install Dependencies**
    Install all the required packages using your preferred package manager.
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

---

## 🔐 4️⃣ Environment Variable Setup

The frontend connects to Supabase and Google Gemini API. Create a `.env.local` file in the root of the project and add the following variables:

```bash
# .env.local

# Supabase credentials (get from your Supabase project dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# Google Gemini API Key (for AI Coach feature)
# This is a server-side variable and MUST NOT be prefixed with NEXT_PUBLIC_
GEMINI_API_KEY=your-gemini-api-key
```

- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in your Supabase project's **Settings > API**.

---

## 🖥️ 4️⃣ Running the Development Server

Once the dependencies are installed and the environment variables are configured, you can start the development server.

```bash
npm run dev
```

The application will be accessible at **http://localhost:3000**.

---

## 📂 5️⃣ Project Structure Overview

The project uses the Next.js App Router, which organizes the application by features and routes.

| Folder        | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `app/`        | Main application folder containing all routes and pages.                  |
| `app/api/`    | Contains backend API routes handled by Next.js (e.g., AI Coach proxy).    |
| `app/(auth)/` | Route group for authentication pages like Login and Register.             |
| `app/(main)/` | Route group for protected main application pages (e.g., Dashboard).       |
| `components/` | Reusable React components (UI elements, charts, forms).                   |
| `lib/`        | Utility functions and client initializations (e.g., `supabaseClient.ts`). |
| `public/`     | Static assets like images and fonts.                                      |
| `docs/`       | Project documentation, including this guide.                              |

---

## 🔐 6️⃣ Session & Route Protection

Several routes are protected and require an active user session. If a user is not logged in, they will be redirected to the login page.

- **Protected Routes:** `/dashboard`, `/setup-profile`
- **Mechanism:** A client-side check in each page component verifies the session using `supabase.auth.getSession()`.
- **Guide:** For detailed testing steps, refer to the **Session Protection Guide**.

---

## 🧪 7️⃣ Testing the Frontend

Perform these checks to ensure the frontend is set up correctly:

| Action                                  | Expected Behavior                                                   |
| --------------------------------------- | ------------------------------------------------------------------- |
| Visit `http://localhost:3000`           | The landing page is displayed correctly.                            |
| Register a new user                     | You are redirected to the `/setup-profile` page after registration. |
| Log in with an existing user            | You are redirected to the `/dashboard`.                             |
| Access `/dashboard` without logging in  | You are redirected to `/auth/login`.                                |
| Log a food or activity on the dashboard | The data appears in your logs, and your coin count increases.       |
| Check the AI Coach card                 | A motivational message is generated based on your daily summary.    |

---

## ❤️ Credits

**CalPal Frontend**  
Built with ❤️ by the Minilemon Technology Intern Team  
Maintainer: @IqbalDarusallam

---
