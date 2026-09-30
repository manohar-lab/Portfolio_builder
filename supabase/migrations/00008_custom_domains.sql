-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - CUSTOM DOMAIN SYSTEM
-- Migration: 00008_custom_domains.sql
-- Creates public.custom_domains table with RLS Policies
-- =========================================================

CREATE TABLE IF NOT EXISTS public.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'active' | 'failed' | 'disconnected'
  verification_token TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for domain lookup in middleware
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_portfolio ON public.custom_domains(portfolio_id);

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own custom domains"
  ON public.custom_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom domains"
  ON public.custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom domains"
  ON public.custom_domains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom domains"
  ON public.custom_domains FOR DELETE
  USING (auth.uid() = user_id);
