# 🚀 Deployment Guide for Corner Club

This guide will walk you through deploying your **Next.js Frontend** to Vercel and **Node.js Backend** to Render. This is the best free/performance stack.

---

## 📌 Phase 1: Push Code to GitHub

Ensure your latest code is on GitHub (we have been doing this).
1.  Open your terminal in VS Code.
2.  Run these commands to be sure:
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```

---

## 🛠 Phase 2: Deploy Backend (Render)

We deploy the Backend **first** because the Frontend needs the Backend URL.

1.  **Sign Up**: Go to [Render.com](https://render.com/) and sign up with GitHub.
2.  **Create Service**: Click **"New"** -> **"Web Service"**.
3.  **Connect Repo**: Select your `Cornor-club` repository.
4.  **Configure Settings**:
    *   **Name**: `corner-club-backend` (or unique name)
    *   **Region**: Singapore (Closest to India) or Frankfurt.
    *   **Root Directory**: `backend` (⚠️ **Important!**)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: Free
5.  **Environment Variables**:
    Scroll down to "Environment Variables" and click **"Add Environment Variable"**. Add these keys from your `backend/.env` file:
    *   `EMAIL_USER` : (Your email)
    *   `EMAIL_PASS` : (Your app password)
    *   `RAZORPAY_KEY_ID`: (Your real Key ID)
    *   `RAZORPAY_KEY_SECRET`: (Your real Secret)
    *   (*Add any Firebase keys if your backend uses them directly*)
6.  **Deploy**: Click **"Create Web Service"**.
7.  **Wait**: It will take 2-3 minutes. Once done, copy the **Backend URL** (e.g., `https://corner-club-backend.onrender.com`).

---

## 🌐 Phase 3: Deploy Frontend (Vercel)

1.  **Sign Up**: Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2.  **Import Project**: Click **"Add New"** -> **"Project"**.
3.  **Select Repo**: Import your `Cornor-club` repository.
4.  **Configure Project**:
    *   **Framework**: Next.js (Auto-detected).
    *   **Root Directory**: Click "Edit" and select `Frontend`. (⚠️ **Important!**)
5.  **Environment Variables**:
    Add these variables (Copy from `Frontend/.env.local`):
    *   `NEXT_PUBLIC_API_URL` : **PASTE YOUR RENDER BACKEND URL HERE** (e.g., `https://corner-club-backend.onrender.com/api`).
    *   `NEXT_PUBLIC_FIREBASE_API_KEY` : (Value from firebase.ts)
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` : ...
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID` : ...
    *   `NEXT_PUBLIC_RAZORPAY_KEY_ID` : (Your public Key ID)
6.  **Deploy**: Click **"Deploy"**.

---

## ✅ Phase 4: Final Checks

1.  **Wait for Vercel**: It will build and give you a live URL (e.g., `https://corner-club.vercel.app`).
2.  **Test Login**: Login with Google on the live site.
3.  **Test Booking**: Try to book a ticket.
4.  **Check Emails**: Ensure you receive the ticket email.

**Congratulations! Your site is LIVE! 🌍**
