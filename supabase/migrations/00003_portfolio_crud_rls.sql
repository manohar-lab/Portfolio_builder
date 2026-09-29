-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - PORTFOLIO CRUD & RLS POLICIES
-- Migration: 00003_portfolio_crud_rls.sql
-- Multi-Tenant Portfolio Ownership & Nested Security Rules
-- =========================================================

-- Enable RLS on all portfolio domain tables
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- HELPER FUNCTION FOR PORTFOLIO OWNERSHIP VERIFICATION
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_owns_portfolio(check_portfolio_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.portfolios
    WHERE id = check_portfolio_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------
-- RLS POLICIES FOR PORTFOLIOS TABLE
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Public portfolios are viewable by anyone" ON public.portfolios;

CREATE POLICY "Public published portfolios are viewable by anyone"
  ON public.portfolios FOR SELECT
  USING (is_published = true AND is_public = true);

CREATE POLICY "Users can select their own portfolios"
  ON public.portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------
-- RLS POLICIES FOR PORTFOLIO SECTIONS
-- ---------------------------------------------------------
CREATE POLICY "Users can manage their portfolio sections"
  ON public.portfolio_sections FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

-- ---------------------------------------------------------
-- RLS POLICIES FOR PROJECTS
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Public portfolio projects are viewable by anyone" ON public.projects;

CREATE POLICY "Users can manage their own portfolio projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Public projects are viewable by anyone"
  ON public.projects FOR SELECT
  USING (public.user_owns_portfolio(portfolio_id));

-- ---------------------------------------------------------
-- RLS POLICIES FOR EDUCATION & ACADEMIC SEMESTERS
-- ---------------------------------------------------------
CREATE POLICY "Users can manage their education entries"
  ON public.education FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Users can manage their academic semesters"
  ON public.academic_semesters FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

-- ---------------------------------------------------------
-- RLS POLICIES FOR SKILLS, EXPERIENCE, RESEARCH, ETC.
-- ---------------------------------------------------------
CREATE POLICY "Users can manage their skills"
  ON public.skills FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Users can manage their experience entries"
  ON public.experience FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Users can manage their research entries"
  ON public.research FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Users can manage their achievements"
  ON public.achievements FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Users can manage their certifications"
  ON public.certifications FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Users can manage their social links"
  ON public.social_links FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));

CREATE POLICY "Users can manage their portfolio themes"
  ON public.portfolio_themes FOR ALL
  USING (auth.uid() = user_id OR public.user_owns_portfolio(portfolio_id));
