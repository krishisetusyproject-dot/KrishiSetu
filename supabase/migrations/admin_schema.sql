-- ============================================================
-- KrishiSetu Admin Panel Database Migration
-- Creates Disputes table, aligns Market Prices, and sets Admin RLS Policies
-- ============================================================

-- 1. DISPUTES TABLE (For /admin/disputes)
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    raised_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    against_user UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    evidence_images TEXT[],
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
    resolution_notes TEXT,
    refund_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT disputes_raised_by_fkey FOREIGN KEY (raised_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT disputes_against_user_fkey FOREIGN KEY (against_user) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. ALIGN MARKET_PRICES COLUMNS (For /admin/prices)
ALTER TABLE public.market_prices
    ADD COLUMN IF NOT EXISTS crop_name TEXT,
    ADD COLUMN IF NOT EXISTS market_name TEXT,
    ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '₹/quintal',
    ADD COLUMN IF NOT EXISTS price_date DATE DEFAULT CURRENT_DATE;

-- 3. ENSURE PROFILES HAS KYC COLUMNS (For /admin/users)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR ADMIN
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow admins full access to disputes
DROP POLICY IF EXISTS "Admins can manage disputes" ON public.disputes;
CREATE POLICY "Admins can manage disputes" ON public.disputes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE (id = auth.uid() OR profile_id = auth.uid()) AND role = 'admin')
    );

-- Allow admins to insert/update market prices
DROP POLICY IF EXISTS "Admins can insert and update market prices" ON public.market_prices;
CREATE POLICY "Admins can insert and update market prices" ON public.market_prices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE (id = auth.uid() OR profile_id = auth.uid()) AND role = 'admin')
    );

-- Allow admins to update user verification status
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE (id = auth.uid() OR profile_id = auth.uid()) AND role = 'admin')
    );
