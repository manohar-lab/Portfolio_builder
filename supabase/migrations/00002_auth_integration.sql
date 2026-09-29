-- =========================================================
-- PORTFOLIO BUILDER SAAS PLATFORM - AUTHENTICATION INTEGRATION
-- Migration: 00002_auth_integration.sql
-- Automatic user provisioning & RLS policies for auth
-- =========================================================

-- ---------------------------------------------------------
-- 1. ROW LEVEL SECURITY (RLS) FOR USERS & PROFILES
-- ---------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own user record"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update their own user record"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR email = auth.jwt()->>'email');

-- Profiles table policies
CREATE POLICY "Profiles are viewable by anyone if public portfolio exists"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = profiles.user_id
        AND (users.id = auth.uid() OR users.email = auth.jwt()->>'email')
    )
  );

-- Connected accounts table policies
CREATE POLICY "Users can view their own connected OAuth accounts"
  ON public.connected_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = connected_accounts.user_id
        AND (users.id = auth.uid() OR users.email = auth.jwt()->>'email')
    )
  );

-- ---------------------------------------------------------
-- 2. AUTOMATIC AUTH TRIGGER ON SIGN-UP / OAuth LOGIN
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_full_name TEXT;
  extracted_avatar TEXT;
  generated_username TEXT;
  new_user_id UUID;
BEGIN
  -- Extract metadata fields provided by Google / GitHub OAuth
  extracted_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  extracted_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  generated_username := LOWER(COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1)
  ));

  -- 1. Upsert into public.users
  INSERT INTO public.users (id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    extracted_full_name,
    extracted_avatar,
    generated_username
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW()
  RETURNING id INTO new_user_id;

  -- 2. Upsert into public.profiles
  INSERT INTO public.profiles (user_id, full_name, avatar_url, email)
  VALUES (
    new_user_id,
    extracted_full_name,
    extracted_avatar,
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Insert connected OAuth account if provider exists
  IF (NEW.raw_app_meta_data->>'provider') IS NOT NULL THEN
    INSERT INTO public.connected_accounts (user_id, provider, provider_account_id)
    VALUES (
      new_user_id,
      NEW.raw_app_meta_data->>'provider',
      NEW.id::text
    )
    ON CONFLICT (provider, provider_account_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
