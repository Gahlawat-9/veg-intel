
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  city TEXT DEFAULT 'Chandigarh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create vegetables master table
CREATE TABLE public.vegetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  shelf_life_days INTEGER NOT NULL DEFAULT 3,
  icon TEXT DEFAULT '🥬',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create crops table (farmer submissions)
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vegetable_id UUID REFERENCES public.vegetables(id) ON DELETE CASCADE NOT NULL,
  quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
  harvest_date DATE NOT NULL,
  city TEXT NOT NULL DEFAULT 'Chandigarh',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create demand_config table (admin sets demand targets)
CREATE TABLE public.demand_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vegetable_id UUID REFERENCES public.vegetables(id) ON DELETE CASCADE NOT NULL UNIQUE,
  daily_demand_kg NUMERIC NOT NULL DEFAULT 1000,
  price_per_kg NUMERIC NOT NULL DEFAULT 30,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  city TEXT DEFAULT 'Chandigarh',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create weather_cache table
CREATE TABLE public.weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  temperature NUMERIC,
  humidity NUMERIC,
  weather_condition TEXT,
  wind_speed NUMERIC,
  weather_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vegetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Vegetables policies (public read)
CREATE POLICY "Anyone can view vegetables" ON public.vegetables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage vegetables" ON public.vegetables FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Crops policies
CREATE POLICY "Farmers can view own crops" ON public.crops FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own crops" ON public.crops FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own crops" ON public.crops FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own crops" ON public.crops FOR DELETE USING (auth.uid() = farmer_id);
CREATE POLICY "Admins can view all crops" ON public.crops FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Demand config policies
CREATE POLICY "Authenticated can view demand" ON public.demand_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage demand" ON public.demand_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Alerts policies
CREATE POLICY "Authenticated can view active alerts" ON public.alerts FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage alerts" ON public.alerts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Feedback policies
CREATE POLICY "Farmers can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Admins can view all feedback" ON public.feedback FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update feedback" ON public.feedback FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Weather cache policies (public read for authenticated)
CREATE POLICY "Authenticated can view weather" ON public.weather_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service can insert weather" ON public.weather_cache FOR INSERT TO authenticated WITH CHECK (true);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_demand_config_updated_at BEFORE UPDATE ON public.demand_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed vegetables
INSERT INTO public.vegetables (name, shelf_life_days, icon) VALUES
  ('Tomato', 5, '🍅'),
  ('Potato', 15, '🥔'),
  ('Onion', 20, '🧅'),
  ('Cauliflower', 4, '🥦'),
  ('Spinach', 2, '🥬'),
  ('Carrot', 10, '🥕'),
  ('Brinjal', 4, '🍆'),
  ('Capsicum', 5, '🫑'),
  ('Cabbage', 7, '🥬'),
  ('Green Peas', 3, '🟢'),
  ('Bitter Gourd', 4, '🥒'),
  ('Lady Finger', 3, '🌿');
