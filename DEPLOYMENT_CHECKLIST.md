# PortfolioCraft SaaS — Production Deployment Checklist

## Overview
This document outlines the step-by-step instructions for deploying the **PortfolioCraft Multi-User SaaS Platform** to **Vercel** with **Supabase** (Database, Auth, Storage) and **GitHub OAuth**.

---

## 1. Prerequisites & Source Control
- [x] Git repository clean.
- [x] `.env.local` removed from Git index (`git rm --cached .env.local`).
- [x] `.gitignore` updated with Next.js, Vercel, and environment security rules.
- [x] No hardcoded passwords, tokens, or service keys committed to Git.

---

## 2. Supabase Production Setup
1. **Migrations**: Apply all migration scripts in sequence to your production Supabase database:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_auth_integration.sql`
   - `supabase/migrations/00003_portfolio_crud_rls.sql`
   - `supabase/migrations/00004_github_import.sql`
   - `supabase/migrations/00005_onboarding_support.sql`

2. **Storage Bucket**: Ensure public storage bucket `portfolio-assets` is created under Supabase Storage with public read access.

3. **Authentication Redirect URLs**:
   Under Supabase Console -> **Authentication** -> **URL Configuration**:
   - **Site URL**: `https://<your-app-name>.vercel.app`
   - **Redirect URLs**:
     - `https://<your-app-name>.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local development)

---

## 3. GitHub & Google OAuth Setup
1. **GitHub OAuth App** (under GitHub Developer Settings):
   - **Homepage URL**: `https://<your-app-name>.vercel.app`
   - **Authorization Callback URL**: `https://<your-app-name>.vercel.app/auth/callback`

2. **Google OAuth Client** (under Google Cloud Console):
   - **Authorized JavaScript Origins**: `https://<your-app-name>.vercel.app`
   - **Authorized Redirect URIs**: `https://<your-app-name>.vercel.app/auth/callback`

---

## 4. Vercel Environment Variables Configuration
In your Vercel Project Settings -> **Environment Variables**, configure the following variables:

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Production / Preview | `https://<your-app-name>.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://<your-project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | `<your-supabase-anon-key>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (Server-Only) | `<your-supabase-service-role-key>` |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | All | `portfolio-assets` |
| `GITHUB_CLIENT_ID` | Production (Server-Only) | `<your-github-client-id>` |
| `GITHUB_CLIENT_SECRET` | Production (Server-Only) | `<your-github-client-secret>` |

---

## 5. Deployment Commands
- **Framework**: Next.js (App Router)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: Next.js default (`.next`)

---

## 6. Post-Deployment Verification (Smoke Test)
- [ ] `/api/health` returns `{ "status": "ok", "service": "PortfolioCraft SaaS" }`.
- [ ] User signup & login works via Google/GitHub OAuth.
- [ ] Onboarding wizard completes and provisions portfolio.
- [ ] Template Gallery allows switching between Minimal, Developer, and Research templates without losing data.
- [ ] Editor autosave and manual save persist changes.
- [ ] GitHub repository fetch & 1-click import maps repositories to portfolio projects.
- [ ] Published portfolio renders at `/u/<username>`.
- [ ] Incognito browser access confirms public visibility of published portfolios and non-accessibility of draft portfolios.
- [ ] Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-Robots-Tag`) are active.
