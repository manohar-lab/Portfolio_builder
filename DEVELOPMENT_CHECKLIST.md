# PortfolioCraft — SaaS Development Roadmap & Phase Checklist

## ✅ Phase 0 — Architecture & Foundation (COMPLETED)
- [x] Analyze SaaS product requirements & design multi-tenant system.
- [x] Initialize Next.js 15 + TypeScript (strict mode) + Tailwind CSS app.
- [x] Configure path aliases `@/*` and Tailwind custom tokens.
- [x] Define standardized `PortfolioData` domain models in `src/types/portfolio.ts`.
- [x] Write PostgreSQL DDL schema with 17 normalized tables & Row Level Security (RLS) policies.
- [x] Implement slug generation, sanitization, and reserved word validation with tests.
- [x] Build template registry & presentation components (`MinimalTemplate`, `DeveloperTemplate`).
- [x] Build public URL dynamic route `/u/[username]` with template switcher.
- [x] Set up Vitest test suite and Zod validation schemas.
- [x] Create developer documentation & architecture specifications.

---

## ✅ Phase 1 — Authentication & User Identity (COMPLETED)
- [x] Integrate Supabase Auth for Google & GitHub OAuth.
- [x] Build Next.js App Router auth clients (`src/auth/client.ts`, `src/auth/server.ts`).
- [x] Implement server middleware (`src/middleware.ts`) for route protection & session refreshing.
- [x] Create OAuth Server Actions (`signInWithOAuthAction`, `signOutAction`).
- [x] Create OAuth callback handler (`/auth/callback/route.ts`).
- [x] Create Auth UI login page (`/login`) with Google and GitHub buttons, loading states & error alerts.
- [x] Create protected `/dashboard` layout and page displaying user identity, email, and connected providers.
- [x] Create protected `/dashboard/account` page for user profile & security details.
- [x] Implement automatic PostgreSQL user synchronization trigger (`00002_auth_integration.sql`).
- [x] Add Unit & Security integration tests for session validation, identity extraction, and access control.

---

## ⏳ Phase 2 — Portfolio Management Dashboard & Builder Editor (Upcoming)
- [ ] Build workspace portfolio management (Create, Edit, Delete, Slug customization).
- [ ] Build modular form editor for sections (Profile, Projects, Skills, Education, Research, Academic Journey).
- [ ] Add drag-and-drop / order toggling for sections.
- [ ] Live preview frame synchronization.
- [ ] Publish / Draft status toggles.

---

## ⏳ Phase 3 — Template Expansion & Theme Customization (Upcoming)
- [ ] Implement remaining templates (Research, Creative, Student, AI/Tech).
- [ ] Enable theme customizer (light/dark mode, primary colors, fonts, border radius, layout spacing).
- [ ] Responsive preview toggles (mobile, tablet, desktop viewports).

---

## ⏳ Phase 4 — Public Portfolio Engine & Assets Management (Upcoming)
- [ ] Implement server-side rendering for public `/u/[username]` with high performance.
- [ ] Secure image upload & resume file storage via Supabase Storage buckets.
- [ ] SEO meta tag auto-generation & OpenGraph social sharing previews.

---

## ⏳ Phase 5 — Quality Assurance & End-to-End Verification (Upcoming)
- [ ] Comprehensive security audit (cross-user access prevention, RLS verification).
- [ ] Accessibility (WCAG 2.1 compliance) audit.
- [ ] E2E integration testing.
