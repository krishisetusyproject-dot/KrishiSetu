-- ============================================================
-- KrishiSetu Authentication & Profile Creation
-- Supports both Farmer and Buyer accounts
-- ============================================================

-- ============================================================
-- 1. ADD PROFILE FIELDS
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS village TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS profile_image TEXT;


-- ============================================================
-- 2. INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own profile"
ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = profile_id
);


-- ============================================================
-- 3. FUNCTION: CREATE PROFILE AFTER AUTH SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN

  -- ----------------------------------------------------------
  -- Determine user role
  -- ----------------------------------------------------------

  user_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'role' IN ('farmer', 'buyer')
      THEN NEW.raw_user_meta_data ->> 'role'
    ELSE
      'farmer'
  END;


  -- ----------------------------------------------------------
  -- Create profile
  --
  -- IMPORTANT:
  -- profiles.profile_id stores the Supabase auth.users.id
  -- ----------------------------------------------------------

  INSERT INTO public.profiles (
    profile_id,
    full_name,
    phone,
    role,
    email,
    village,
    city,
    district,
    state,
    pincode
  )
  VALUES (
    NEW.id,

    COALESCE(
      NULLIF(
        NEW.raw_user_meta_data ->> 'full_name',
        ''
      ),
      'KrishiSetu User'
    ),

    NEW.raw_user_meta_data ->> 'phone',

    user_role,

    NEW.email,

    NEW.raw_user_meta_data ->> 'village',

    NEW.raw_user_meta_data ->> 'city',

    NEW.raw_user_meta_data ->> 'district',

    NEW.raw_user_meta_data ->> 'state',

    NEW.raw_user_meta_data ->> 'pincode'
  )

  ON CONFLICT (profile_id)
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    village = EXCLUDED.village,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pincode = EXCLUDED.pincode;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'KrishiSetu profile creation failed for auth user %: %', NEW.id, SQLERRM;
    -- Do not abort Auth signup because profile repair can happen after login.
    NULL;
  END;

  RETURN NEW;

END;
$$;


-- ============================================================
-- 4. CREATE AUTH USER TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created_profile
ON auth.users;

CREATE TRIGGER on_auth_user_created_profile

AFTER INSERT ON auth.users

FOR EACH ROW

EXECUTE FUNCTION public.handle_new_user_profile();