
-- Create table for sub-organizers
CREATE TABLE IF NOT EXISTS public.sub_organizers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sub_organizers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sub_organizers
-- Only authenticated users (main organizers) can manage sub-organizers
CREATE POLICY "Authenticated users can view sub_organizers" ON public.sub_organizers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create sub_organizers" ON public.sub_organizers FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update sub_organizers" ON public.sub_organizers FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Authenticated users can delete sub_organizers" ON public.sub_organizers FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Enable realtime for sub_organizers table
ALTER TABLE public.sub_organizers REPLICA IDENTITY FULL;

-- Add table to realtime publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sub_organizers;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add validation constraints
ALTER TABLE public.sub_organizers 
  ADD CONSTRAINT email_format_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT password_length_check CHECK (length(password) >= 6);
