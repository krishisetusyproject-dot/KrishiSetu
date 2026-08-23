-- KrishiSetu buyer-side schema.
-- public.produce is the only canonical farmer marketplace table.
-- The legacy alternate listing table is intentionally untouched and unused.
-- Existing farmer data and Supabase Auth are preserved.

-- Buyer business details use the existing profile row.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS business_city TEXT,
  ADD COLUMN IF NOT EXISTS business_district TEXT,
  ADD COLUMN IF NOT EXISTS business_state TEXT,
  ADD COLUMN IF NOT EXISTS business_pincode TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_business_type_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_business_type_check
      CHECK (business_type IS NULL OR business_type IN ('kirana', 'trader', 'retailer', 'restaurant', 'other')) NOT VALID;
  END IF;
END
$$;

-- Offers use produce_id to reference the canonical produce table.
ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS produce_id UUID,
  ADD COLUMN IF NOT EXISTS buyer_id UUID,
  ADD COLUMN IF NOT EXISTS farmer_id UUID,
  ADD COLUMN IF NOT EXISTS quantity NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS offered_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Derive the farmer from produce instead of trusting a browser-supplied owner.
UPDATE public.offers AS o
SET farmer_id = p.farmer_id
FROM public.produce AS p
WHERE p.produce_id = o.produce_id
  AND o.farmer_id IS NULL;

-- Orders support offer-based checkout and pickup tracking.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS offer_id UUID,
  ADD COLUMN IF NOT EXISTS pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS pickup_date DATE,
  ADD COLUMN IF NOT EXISTS buyer_notes TEXT,
  ADD COLUMN IF NOT EXISTS farmer_notes TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_status_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'completed', 'cancelled', 'rejected')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_payment_status_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'not_required', 'paid', 'failed', 'refunded')) NOT VALID;
  END IF;
END
$$;

-- Order items use the actual named primary key and canonical produce reference.
CREATE TABLE IF NOT EXISTS public.order_items (
  order_item_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  produce_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  price_per_unit NUMERIC(10, 2) NOT NULL CHECK (price_per_unit >= 0),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS produce_id UUID,
  ADD COLUMN IF NOT EXISTS crop_name TEXT,
  ADD COLUMN IF NOT EXISTS quantity NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Favorites use favorite_id because no existing favorites primary key was supplied.
CREATE TABLE IF NOT EXISTS public.favorites (
  favorite_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  produce_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT favorites_buyer_produce_unique UNIQUE (buyer_id, produce_id)
);

ALTER TABLE public.favorites
  ADD COLUMN IF NOT EXISTS buyer_id UUID,
  ADD COLUMN IF NOT EXISTS produce_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Notifications are shared by farmers and buyers.
CREATE TABLE IF NOT EXISTS public.notifications (
  notification_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS related_id UUID,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add named foreign keys only when the relationship is not already present.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'offers_produce_id_fkey') THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_produce_id_fkey
      FOREIGN KEY (produce_id) REFERENCES public.produce(produce_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'offers_buyer_id_fkey') THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_buyer_id_fkey
      FOREIGN KEY (buyer_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'offers_farmer_id_fkey') THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_farmer_id_fkey
      FOREIGN KEY (farmer_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_buyer_id_fkey') THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_buyer_id_fkey
      FOREIGN KEY (buyer_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_farmer_id_fkey') THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_farmer_id_fkey
      FOREIGN KEY (farmer_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_offer_id_fkey') THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_offer_id_fkey
      FOREIGN KEY (offer_id) REFERENCES public.offers(offer_id) ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey') THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_produce_id_fkey') THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_produce_id_fkey
      FOREIGN KEY (produce_id) REFERENCES public.produce(produce_id) ON DELETE RESTRICT NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_buyer_id_fkey') THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_buyer_id_fkey
      FOREIGN KEY (buyer_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_produce_id_fkey') THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_produce_id_fkey
      FOREIGN KEY (produce_id) REFERENCES public.produce(produce_id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey') THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'offers_status_check') THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_status_check
      CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_type_check') THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_type_check
      CHECK (type IN ('offer_received', 'offer_accepted', 'offer_rejected', 'order_created', 'order_confirmed', 'order_ready', 'order_completed', 'order_cancelled')) NOT VALID;
  END IF;
END
$$;

-- Indexes use the actual primary and relationship column names.
CREATE INDEX IF NOT EXISTS produce_farmer_id_idx ON public.produce (farmer_id);
CREATE INDEX IF NOT EXISTS produce_status_idx ON public.produce (status);
CREATE INDEX IF NOT EXISTS offers_produce_id_idx ON public.offers (produce_id);
CREATE INDEX IF NOT EXISTS offers_buyer_id_idx ON public.offers (buyer_id);
CREATE INDEX IF NOT EXISTS offers_farmer_id_idx ON public.offers (farmer_id);
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS orders_farmer_id_idx ON public.orders (farmer_id);
CREATE INDEX IF NOT EXISTS orders_offer_id_idx ON public.orders (offer_id);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_produce_id_idx ON public.order_items (produce_id);
CREATE INDEX IF NOT EXISTS favorites_buyer_id_idx ON public.favorites (buyer_id);
CREATE INDEX IF NOT EXISTS favorites_produce_id_idx ON public.favorites (produce_id);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications (user_id, is_read);

-- Enable RLS without changing authentication or farmer data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profile ownership. Existing public profile reads remain untouched.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Buyers can read active produce; farmers retain ownership of their records.
DROP POLICY IF EXISTS "Buyers can view active produce" ON public.produce;
CREATE POLICY "Buyers can view active produce" ON public.produce
  FOR SELECT USING (status = 'active' OR auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can insert own produce" ON public.produce;
CREATE POLICY "Farmers can insert own produce" ON public.produce
  FOR INSERT WITH CHECK (
    auth.uid() = farmer_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.profile_id = auth.uid() AND p.role = 'farmer')
  );

DROP POLICY IF EXISTS "Farmers can update own produce" ON public.produce;
CREATE POLICY "Farmers can update own produce" ON public.produce
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete own produce" ON public.produce;
CREATE POLICY "Farmers can delete own produce" ON public.produce
  FOR DELETE USING (auth.uid() = farmer_id);

-- Offers: buyer ownership is checked for writes; farmer ownership is derived from produce.
DROP POLICY IF EXISTS "Buyers and farmers can view related offers" ON public.offers;
DROP POLICY IF EXISTS "Buyers can create offers" ON public.offers;
DROP POLICY IF EXISTS "Users can view related offers" ON public.offers;
CREATE POLICY "Users can view related offers" ON public.offers
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Buyers can create own offers" ON public.offers;
CREATE POLICY "Buyers can create own offers" ON public.offers
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.profile_id = auth.uid() AND p.role = 'buyer')
    AND farmer_id = (
      SELECT p.farmer_id
      FROM public.produce p
      WHERE p.produce_id = public.offers.produce_id
    )
  );

DROP POLICY IF EXISTS "Buyers can update own offers" ON public.offers;
CREATE POLICY "Buyers can update own offers" ON public.offers
  FOR UPDATE USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Farmers can respond to offers" ON public.offers;
CREATE POLICY "Farmers can respond to offers" ON public.offers
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

-- Orders: participants can read; buyers create; participants update their own records.
DROP POLICY IF EXISTS "Users can view related orders" ON public.orders;
CREATE POLICY "Users can view related orders" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.profile_id = auth.uid() AND p.role = 'buyer')
  );

DROP POLICY IF EXISTS "Buyers can update own orders" ON public.orders;
CREATE POLICY "Buyers can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Farmers can update related orders" ON public.orders;
CREATE POLICY "Farmers can update related orders" ON public.orders
  FOR UPDATE USING (auth.uid() = farmer_id)
  WITH CHECK (auth.uid() = farmer_id);

-- Order items inherit access from their parent order.
DROP POLICY IF EXISTS "Users can view related order items" ON public.order_items;
CREATE POLICY "Users can view related order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = public.order_items.order_id
        AND (o.buyer_id = auth.uid() OR o.farmer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Buyers can create order items" ON public.order_items;
CREATE POLICY "Buyers can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_id = public.order_items.order_id
        AND o.buyer_id = auth.uid()
    )
  );

-- Favorites belong exclusively to buyers.
DROP POLICY IF EXISTS "Buyers can view own favorites" ON public.favorites;
CREATE POLICY "Buyers can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers can create own favorites" ON public.favorites;
CREATE POLICY "Buyers can create own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers can remove own favorites" ON public.favorites;
CREATE POLICY "Buyers can remove own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = buyer_id);

-- Notifications belong exclusively to their recipient.
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark own notifications read" ON public.notifications;
CREATE POLICY "Users can mark own notifications read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
