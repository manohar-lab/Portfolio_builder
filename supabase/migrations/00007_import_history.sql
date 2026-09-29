-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - IMPORT HISTORY SYSTEM
-- Migration: 00007_import_history.sql
-- Creates public.import_history table with RLS Policies
-- =========================================================

CREATE TABLE IF NOT EXISTS public.import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'github' | 'resume' | 'manual'
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed' | 'cancelled' | 'failed'
  items_imported_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own import history"
  ON public.import_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own import history"
  ON public.import_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import history"
  ON public.import_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own import history"
  ON public.import_history FOR DELETE
  USING (auth.uid() = user_id);
