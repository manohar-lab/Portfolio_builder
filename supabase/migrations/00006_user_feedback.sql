-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - USER FEEDBACK SYSTEM
-- Migration: 00006_user_feedback.sql
-- Creates public.user_feedback table with RLS Policies
-- =========================================================

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- 'bug' | 'feature_request' | 'confusing_ux' | 'template_feedback' | 'other'
  message TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to submit feedback
CREATE POLICY "Authenticated users can submit feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow anonymous visitors to submit feedback if desirable
CREATE POLICY "Anonymous users can submit feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.role() = 'anon');
