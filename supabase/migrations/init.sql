-- Initial Supabase Schema for KrishiSetu Marketplace

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    phone TEXT,
    location TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. LISTINGS TABLE (Produce posted by farmers)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    asking_price NUMERIC(10, 2) NOT NULL,
    quantity_available NUMERIC(10, 2) NOT NULL,
    unit TEXT DEFAULT 'kg' NOT NULL,
    quality_grade TEXT,
    apmc_reference_rate NUMERIC(10, 2),
    location TEXT NOT NULL,
    description TEXT,
    images TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived')),
    harvest_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. OFFERS TABLE (Negotiations submitted by buyers)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    offered_price NUMERIC(10, 2) NOT NULL,
    offered_quantity NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE (Confirmed procurement transactions)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
    farmer_id UUID REFERENCES public.profiles(id) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pickup_ready', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MARKET PRICES TABLE (APMC Mandi & MSP Benchmarks)
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commodity TEXT NOT NULL,
    apmc_mandi TEXT NOT NULL,
    state TEXT NOT NULL,
    min_price NUMERIC(10, 2) NOT NULL,
    max_price NUMERIC(10, 2) NOT NULL,
    modal_price NUMERIC(10, 2) NOT NULL,
    msp_price NUMERIC(10, 2),
    trend TEXT DEFAULT 'flat' CHECK (trend IN ('up', 'down', 'flat')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Repair columns when these tables already existed before this migration.
ALTER TABLE public.offers
    ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings Policies
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;
CREATE POLICY "Active listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Farmers can create listings" ON public.listings;
CREATE POLICY "Farmers can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = farmer_id);
DROP POLICY IF EXISTS "Farmers can update own listings" ON public.listings;
CREATE POLICY "Farmers can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = farmer_id);

-- Offers Policies
DROP POLICY IF EXISTS "Buyers and farmers can view related offers" ON public.offers;
CREATE POLICY "Buyers and farmers can view related offers" ON public.offers FOR SELECT USING (
    auth.uid() = buyer_id OR listing_id IN (
        SELECT l.id
        FROM public.listings AS l
        WHERE l.farmer_id = auth.uid()
    )
);
DROP POLICY IF EXISTS "Buyers can create offers" ON public.offers;
CREATE POLICY "Buyers can create offers" ON public.offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Market Prices Policies
DROP POLICY IF EXISTS "Market prices are viewable by everyone" ON public.market_prices;
CREATE POLICY "Market prices are viewable by everyone" ON public.market_prices FOR SELECT USING (true);
