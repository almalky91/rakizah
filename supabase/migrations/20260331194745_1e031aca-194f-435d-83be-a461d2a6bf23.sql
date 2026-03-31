CREATE OR REPLACE FUNCTION public.set_public_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND (NEW.public_slug IS NULL OR btrim(NEW.public_slug) = '') THEN
    NEW.public_slug := public.generate_public_slug(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_public_slug ON public.profiles;

CREATE TRIGGER trg_set_public_slug
BEFORE INSERT OR UPDATE OF email, public_slug ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_public_slug();