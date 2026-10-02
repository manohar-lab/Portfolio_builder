# PortfolioCraft — Multi-User SaaS Portfolio Builder Platform

**PortfolioCraft** is a multi-user SaaS platform for creating, customizing, and publishing professional portfolio websites. Designed for students, software engineers, AI/ML researchers, designers, and freelancers.

---

## 🏛️ Phase 0 Architecture Summary

### 1. Technology Stack
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase compatibility with Row Level Security - RLS)
- **Validation**: Zod Schemas
- **Testing**: Vitest

### 2. Standardized Portfolio Data Architecture
All presentation templates consume a single standardized domain payload (`PortfolioData`). Users can switch between templates instantly without re-entering profile details, projects, education history, or research.

```
                  ┌──────────────────────┐
                  │    User Database     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  PortfolioData Model │
                  └──────────┬───────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Minimal    │      │  Developer   │      │   Research   │
│   Template   │      │   Template   │      │   Template   │
└──────────────┘      └──────────────┘      └──────────────┘
```

### 3. Folder Structure Overview
```
src/
├── app/                  # Next.js App Router (Landing, /u/[username], API routes)
├── components/           # Reusable UI components & layouts
├── templates/            # Presentation templates (Minimal, Developer, Registry)
├── editor/               # Editor components (Phase 2)
├── dashboard/            # User management dashboard (Phase 1)
├── auth/                 # Server auth helpers & middleware (Phase 1)
├── database/             # Database clients & query repositories
├── api/                  # API response handlers & endpoints
├── validation/           # Zod schema definitions
├── types/                # Domain TypeScript models
├── utilities/            # Slug generators, data adapters, cn helper
├── config/               # Platform constants & template registry config
└── tests/                # Vitest test suite
```

### 4. Database Model & Multi-Tenant RLS Security
Database DDL migrations are located in `supabase/migrations/00001_initial_schema.sql`. Includes 17 tables:
- `users`, `connected_accounts`, `profiles`, `portfolios`, `portfolio_themes`, `portfolio_sections`
- `projects`, `skills`, `education`, `academic_semesters`, `experience`, `research`
- `achievements`, `certifications`, `publications`, `services`, `social_links`

Row Level Security (RLS) ensures:
- Anonymous users can **only read** published & public portfolios (`is_published = true AND is_public = true`).
- Authenticated users can **only insert/update/delete** records where `auth.uid() = user_id`.

### 5. Public URL Strategy
Portfolios are accessible via clean, scalable public URLs:
`https://platform.com/u/[username]`

- **Slug Protection**: Slugs are lowercased, hyphenated, and checked against `RESERVED_SLUGS` (`admin`, `api`, `dashboard`, `auth`, `u`, etc.).
- **Isolation**: Each user has ownership over their unique slug.

---
## 🚧 Development Status

PortfolioCraft is currently under active development.

### Current Phase

**Phase 0 — Architecture & Foundation ✅**

The initial architecture and technical foundation have been established, including:

* ✅ Next.js 15 App Router setup
* ✅ TypeScript with strict mode
* ✅ Tailwind CSS integration
* ✅ PostgreSQL / Supabase-compatible database architecture
* ✅ Multi-user database design
* ✅ Row Level Security (RLS) strategy
* ✅ Standardized `PortfolioData` architecture
* ✅ Public portfolio URL strategy using `/u/[username]`
* ✅ Reserved username/slug protection
* ✅ Zod validation architecture
* ✅ Vitest testing setup
* ✅ Template-based portfolio architecture
* ✅ Scalable project folder structure

### Upcoming Development

**Phase 1 — Authentication & Dashboard**

Planned work includes:

* User authentication
* User profile management
* Portfolio creation
* Portfolio dashboard
* Portfolio settings
* Username management
* Database integration
* Protected dashboard routes

**Phase 2 — Portfolio Editor**

Planned work includes:

* Visual portfolio editor
* Profile editing
* Project management
* Education and experience management
* Skills and certifications
* Research and publications
* Social links
* Section visibility controls
* Live preview

**Phase 3 — Templates & Publishing**

Planned work includes:

* Multiple portfolio templates
* Template switching
* Responsive public portfolios
* Publishing workflow
* Public portfolio sharing
* SEO optimization

> PortfolioCraft is being developed incrementally with a focus on security, scalability, reusable architecture, and a consistent portfolio data model.

## 🛠️ Commands

```bash
# Run local development server
npm run dev

# Run type check (TypeScript strict mode)
npm run typecheck

# Run linting
npm run lint

# Run unit tests (Vitest)
npm run test

# Build production bundle
npm run build
```
