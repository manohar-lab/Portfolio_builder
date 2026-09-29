-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - INITIAL DATABASE SCHEMA
-- Migration: 00001_initial_schema.sql
-- PostgreSQL / Supabase Compatible DDL with RLS Policies
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. USERS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. CONNECTED OAUTH ACCOUNTS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google' | 'github'
  provider_account_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- ---------------------------------------------------------
-- 3. PROFILES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  is_available_for_work BOOLEAN DEFAULT TRUE,
  resume_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 4. PORTFOLIOS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'developer',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. PORTFOLIO THEMES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID UNIQUE NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'system', -- 'light' | 'dark' | 'system'
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  font_family TEXT NOT NULL DEFAULT 'sans',
  border_radius TEXT NOT NULL DEFAULT 'md',
  animation_level TEXT NOT NULL DEFAULT 'subtle',
  layout_spacing TEXT NOT NULL DEFAULT 'comfortable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 6. PORTFOLIO SECTIONS CONFIGURATION
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 7. SOCIAL LINKS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 8. SKILLS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  proficiency TEXT,
  icon_name TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 9. PROJECTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  detailed_description TEXT,
  problem_statement TEXT,
  solution_approach TEXT,
  technologies TEXT[] DEFAULT '{}',
  image_url TEXT,
  github_url TEXT,
  live_demo_url TEXT,
  paper_url TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 10. EDUCATION TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  start_year INT NOT NULL,
  end_year INT,
  is_current_status BOOLEAN NOT NULL DEFAULT FALSE,
  cgpa TEXT,
  max_cgpa TEXT DEFAULT '4.0',
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 11. ACADEMIC SEMESTERS TABLE (OPTIONAL STUDENT DETAIL)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  education_id UUID NOT NULL REFERENCES public.education(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  semester_number INT NOT NULL,
  cgpa TEXT,
  subjects TEXT[] DEFAULT '{}',
  projects TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(education_id, semester_number)
);

-- ---------------------------------------------------------
-- 12. EXPERIENCE TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 13. RESEARCH TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  research_area TEXT NOT NULL,
  methodology TEXT,
  dataset TEXT,
  technologies TEXT[] DEFAULT '{}',
  paper_url TEXT,
  github_url TEXT,
  publication_status TEXT NOT NULL DEFAULT 'published',
  publication_date DATE,
  venue TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 14. ACHIEVEMENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date DATE,
  description TEXT,
  url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 15. CERTIFICATIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 16. PUBLICATIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  publisher TEXT NOT NULL,
  publication_date DATE,
  doi_url TEXT,
  abstract TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 17. SERVICES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- INDEXES FOR FAST LOOKUP & PERFORMANCE
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_portfolio_id ON public.projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_skills_portfolio_id ON public.skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_education_portfolio_id ON public.education(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_research_portfolio_id ON public.research(portfolio_id);

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------

-- Portfolios table security
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public portfolios are viewable by anyone" 
  ON public.portfolios FOR SELECT 
  USING (is_published = true AND is_public = true);

CREATE POLICY "Users can manage their own portfolios" 
  ON public.portfolios FOR ALL 
  USING (auth.uid() = user_id);

-- Projects table security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public portfolio projects are viewable by anyone" 
  ON public.projects FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios 
      WHERE portfolios.id = projects.portfolio_id 
        AND portfolios.is_published = true 
        AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage their own projects" 
  ON public.projects FOR ALL 
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------
-- AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolios_modtime BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
