
-- Add public_slug column
ALTER TABLE public.profiles ADD COLUMN public_slug text UNIQUE;

-- Function to generate slug from email
CREATE OR REPLACE FUNCTION public.generate_public_slug(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  new_slug text;
  attempts int := 0;
BEGIN
  -- Extract part before @ and clean it
  base_slug := lower(split_part(p_email, '@', 1));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]', '', 'g');
  -- Truncate to reasonable length
  base_slug := left(base_slug, 20);
  
  LOOP
    new_slug := base_slug || lpad(floor(random() * 10000)::text, 4, '0');
    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_slug = new_slug) THEN
      RETURN new_slug;
    END IF;
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RETURN base_slug || lpad(floor(random() * 100000)::text, 5, '0');
    END IF;
  END LOOP;
END;
$$;

-- Update handle_new_user to set slug
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, public_slug)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', public.generate_public_slug(NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

-- Generate slugs for existing profiles that don't have one
UPDATE public.profiles 
SET public_slug = public.generate_public_slug(COALESCE(email, id::text))
WHERE public_slug IS NULL;
