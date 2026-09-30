-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - PRODUCT ANALYTICS SYSTEM
-- Migration: 00009_analytics_events.sql
-- Creates public.analytics_events table with RLS Policies
-- =========================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes for Owner Dashboard Aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_portfolio_id ON public.analytics_events(portfolio_id);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anonymous users to insert analytics events safely
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Restrict SELECT access to authenticated sessions (further guarded server-side for owner email)
CREATE POLICY "Authenticated users can read analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.role() = 'authenticated');
