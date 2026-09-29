-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - ONBOARDING SUPPORT
-- Migration: 00005_onboarding_support.sql
-- Adds onboarding completion, step tracking, and profile type
-- =========================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'developer';
