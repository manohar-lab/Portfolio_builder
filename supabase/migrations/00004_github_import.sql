-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - GITHUB IMPORT EXTENSION
-- Migration: 00004_github_import.sql
-- Adds GitHub repository mapping fields to projects table
-- =========================================================

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS github_repository_id TEXT,
  ADD COLUMN IF NOT EXISTS github_full_name TEXT,
  ADD COLUMN IF NOT EXISTS github_last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_projects_github_repo_id 
  ON public.projects(portfolio_id, github_repository_id);
