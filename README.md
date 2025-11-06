# 🥗 CalPal - Calorie Calculator

![Next.js](https://img.shields.io/badge/Next.js-13.4+-000000?style=for-the-badge&logo=nextdotjs)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)

---

This repository contains the project files used in building the **CalPal (Calorie Calculator)** web application.  
This project was initiated by **Teams Playground Minilemon Technology**.

---

## 📘 Project Overview

**CalPal** is a web-based tool designed to help users track their daily calorie intake and physical activities.  
With a simple interface and immediate daily summaries, this application is perfect for:

-   🏃‍♀️ Individuals starting their health and fitness journey.
-   🍏 Users who want to build sustainable healthy habits.
-   🧠 Anyone learning to balance calorie intake vs. expenditure.

---

## ⚙️ Features

-   🔐 **Secure Authentication:** Sign up and log in using Supabase Auth.
-   🍱 **Calorie Tracking:** Log daily food intake (calories, protein, carbs, fats).
-   🏋️ **Activity Tracking:** Log daily physical activities and see calories burned (based on METs formula).
-   📊 **Daily Dashboard:** View a clean summary of "Calories In" vs. "Calories Out" and your net calorie balance for the day.
-   👤 **User Profile:** Set your weight and height to ensure accurate activity calculations.
-   🤖 **AI Coach (Gemini):** Get personalized motivational feedback using the Gemini API.
-   📆 **Achievements & Coins:** Earn points for consistent tracking through Supabase triggers and cron jobs.

---

## 🧰 Prerequisites

Make sure you have the following installed:

-   [Node.js](https://nodejs.org/) **v18+**
-   **npm** or **yarn**
-   A [Supabase](https://supabase.com/) account (free tier is fine)
-   A code editor like **Visual Studio Code**

---

## 🚀 First Steps

### 1️⃣ Fork the repository

Click the **Fork** button at the top of this page.

### 2️⃣ Clone your fork

Replace the URL below with your fork's HTTPS URL (found via the green **Code** button):

```bash
git clone https://github.com/YOUR_USERNAME/calori-calcculator.git
```

### 3️⃣ Navigate into the project folder

```bash
cd calori-calcculator
```

### 4️⃣ Install dependencies

```bash
npm install
```

### 5️⃣ Set up Environment Variables

This project requires a **Supabase** backend.

1. Log in to your Supabase account and create a new project.
2. In the Supabase dashboard, go to **Project Settings > API**.
3. Find your **Project URL** and **anon (public) key**.
4. Create a new file in your project root named `.env.local`.
5. Add the following keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

---

### 6️⃣ Run the database migrations

1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open the `schema.sql` file from this repository (or from the Project Plan).
3. Copy the SQL code → paste it into the SQL Editor → click **RUN**.

---

### 7️⃣ Start the development server

```bash
npm run dev
```

Then open your browser at:  
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧩 Environment Variables Reference

| Variable                        | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL of your Supabase project                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key from Supabase                 |
| `NEXT_PUBLIC_GEMINI_API_KEY`    | Gemini API key for AI Coach                   |
| `NEXT_PUBLIC_USDA_API_KEY`      | USDA FoodData Central API key                 |
| `NEXT_PUBLIC_APP_URL`           | Base URL of your deployed frontend (optional) |

---

## 🔄 Stay Up-to-Date

To keep your fork synchronized with the main repository:

```bash
git remote add upstream https://github.com/Minilemon-Official-Team/calori-calcculator.git
git fetch upstream
git checkout main
git rebase upstream/main
git push origin main
```

💡 **Alternative:**  
You can also click **“Sync fork”** on your GitHub fork page, then run:

```bash
git pull
```

---

## 🧭 Good Practices

-   Create a new branch for each feature or bug fix:
    ```bash
    git checkout -b your-feature-name
    ```
-   Avoid committing directly to `main` — it’s reserved for upstream sync.
-   Use consistent naming for files and folders.
-   Write meaningful commit messages (e.g. `feat: add calorie summary endpoint`).
-   Test endpoints using **SwaggerHub** or **Postman** before committing changes.

---

## 🗂 Project Structure (Next.js App Router)

```
calori-calcculator/
├── app/                 # Next.js App Router (Pages, Layouts)
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (main)/          # Protected app routes
│   │   ├── dashboard/   # Dashboard page
│   │   └── profile/     # User profile page
│   └── page.tsx         # Landing page
│
├── components/            # Reusable UI components (Shadcn UI)
│   ├── auth/
│   └── ui/
│
├── lib/                   # Helper functions, utilities
│   ├── supabaseClient.ts  # Supabase client initialization
│   └── formulas.ts        # Business logic (e.g., METs calculation)
│
├── public/                # Static assets (images, fonts)
│
├── .env.local             # Local environment keys (Supabase)
└── README.md              # Project documentation
```

---

## 📝 Note

-   Ensure you have a stable internet connection for the first `npm install`.
-   This application is open-source — you are welcome to modify, develop, and use it for **educational or personal** purposes.

---

## 👥 Contributors

Developed by **Teams Playground Minilemon Technology**.  
We welcome contributions in:

-   💻 Development
-   🎨 Design
-   🔍 Research
-   🧾 Documentation

---

## 🌍 Vision

> “Building open technology for boundless collaboration.”

---

## ⚖️ License

This project is released under the **MIT License**.  
You are free to use and modify this project, but please include credit to  
**Teams Playground Minilemon Technology**.
