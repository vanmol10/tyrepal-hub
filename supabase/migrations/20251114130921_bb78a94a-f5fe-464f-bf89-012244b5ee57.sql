-- Create enums
CREATE TYPE service_type AS ENUM (
  'wheel_alignment',
  'wheel_balancing',
  'tyre_rotation',
  'nitrogen_filling',
  'air_pressure_check'
);

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled'
);

CREATE TYPE usage_type AS ENUM (
  'hilly_area',
  'touring',
  'sports',
  'fuel_efficient'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  mobile_number TEXT,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_brand TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_variant TEXT,
  vehicle_year INTEGER NOT NULL,
  registration_number TEXT NOT NULL,
  current_kms INTEGER DEFAULT 0,
  kms_per_day INTEGER,
  kms_per_month INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vehicles"
  ON public.vehicles FOR ALL
  USING (auth.uid() = user_id);

-- Create tyre_purchases table
CREATE TABLE public.tyre_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  number_of_tyres INTEGER NOT NULL,
  tyre_brand TEXT NOT NULL,
  tyre_serial_number TEXT,
  warranty_certificate_url TEXT,
  warranty_start_date DATE,
  warranty_end_date DATE,
  purchase_date DATE NOT NULL,
  kms_at_purchase INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tyre_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tyre purchases"
  ON public.tyre_purchases FOR ALL
  USING (auth.uid() = user_id);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  current_kms INTEGER NOT NULL,
  service_date DATE NOT NULL,
  invoice_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own services"
  ON public.services FOR ALL
  USING (auth.uid() = user_id);

-- Create dealers table
CREATE TABLE public.dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  google_map_link TEXT,
  opening_time TIME,
  closing_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active dealers"
  ON public.dealers FOR SELECT
  USING (is_active = true);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookings"
  ON public.bookings FOR ALL
  USING (auth.uid() = user_id);

-- Create tyre_knowledge table
CREATE TABLE public.tyre_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tyre_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON public.tyre_knowledge FOR SELECT
  USING (is_published = true);

-- Create tyre_recommendations table
CREATE TABLE public.tyre_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_brand TEXT NOT NULL,
  car_model TEXT NOT NULL,
  car_variant TEXT NOT NULL,
  usage_type usage_type NOT NULL,
  recommended_pattern TEXT NOT NULL,
  recommended_size TEXT NOT NULL,
  recommended_brands TEXT[] NOT NULL,
  price_range_min INTEGER,
  price_range_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tyre_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tyre recommendations"
  ON public.tyre_recommendations FOR SELECT
  USING (true);

-- Create user_roles table for admin management
CREATE TYPE app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for managing bookings
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for dealers
CREATE POLICY "Admins can manage dealers"
  ON public.dealers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for tyre knowledge
CREATE POLICY "Admins can manage articles"
  ON public.tyre_knowledge FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for recommendations
CREATE POLICY "Admins can manage recommendations"
  ON public.tyre_recommendations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tyre_purchases_updated_at
  BEFORE UPDATE ON public.tyre_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tyre_knowledge_updated_at
  BEFORE UPDATE ON public.tyre_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tyre_recommendations_updated_at
  BEFORE UPDATE ON public.tyre_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();