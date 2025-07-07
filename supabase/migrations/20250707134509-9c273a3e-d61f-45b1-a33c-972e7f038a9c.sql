
-- Ensure the database tables are properly created with all necessary constraints
-- This migration is idempotent and safe to run multiple times

-- Create profiles table for user data (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create events table to replace localStorage (if not exists)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'Por acontecer' CHECK (status IN ('Por acontecer', 'Em andamento', 'Encerrado')),
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event confirmations table to track who confirmed presence (if not exists)
CREATE TABLE IF NOT EXISTS public.event_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_confirmations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view confirmations" ON public.event_confirmations;
DROP POLICY IF EXISTS "Users can confirm their own presence" ON public.event_confirmations;
DROP POLICY IF EXISTS "Users can cancel their own confirmation" ON public.event_confirmations;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own events" ON public.events FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for event confirmations
CREATE POLICY "Anyone can view confirmations" ON public.event_confirmations FOR SELECT USING (true);
CREATE POLICY "Users can confirm their own presence" ON public.event_confirmations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel their own confirmation" ON public.event_confirmations FOR DELETE USING (auth.uid() = user_id);

-- Create or replace function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

-- Drop and recreate trigger to handle new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable real-time for all tables
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_confirmations REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication (ignore errors if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.event_confirmations;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add validation constraints for security
ALTER TABLE public.profiles 
  ADD CONSTRAINT username_length_check CHECK (length(username) BETWEEN 3 AND 50),
  ADD CONSTRAINT username_format_check CHECK (username ~ '^[a-zA-Z0-9_]+$');

ALTER TABLE public.events
  ADD CONSTRAINT address_not_empty CHECK (length(trim(address)) > 0),
  ADD CONSTRAINT type_valid CHECK (type IN ('futebol', 'volei', 'futebol,volei', 'volei,futebol')),
  ADD CONSTRAINT coordinates_valid CHECK (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180);
