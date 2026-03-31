
CREATE OR REPLACE FUNCTION public.generate_public_slug(p_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_slug text;
  new_slug text;
  attempts int := 0;
BEGIN
  base_slug := lower(split_part(p_email, '@', 1));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]', '', 'g');
  base_slug := left(base_slug, 20);
  
  LOOP
    new_slug := base_slug || lpad(floor(random() * 1000)::text, 3, '0');
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_slug = new_slug) THEN
      RETURN new_slug;
    END IF;
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RETURN base_slug || lpad(floor(random() * 10000)::text, 4, '0');
    END IF;
  END LOOP;
END;
$function$;
