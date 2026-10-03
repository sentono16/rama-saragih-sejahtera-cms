BEGIN;
CREATE TABLE IF NOT EXISTS public.rama_site_content (
  key text PRIMARY KEY CHECK (key = 'main'),
  value jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.rama_contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 200),
  company text NOT NULL DEFAULT '',
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 2 AND 150),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rama_messages_email_created ON public.rama_contact_messages (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rama_messages_created ON public.rama_contact_messages (created_at DESC);
CREATE TABLE IF NOT EXISTS public.rama_uploads (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL CHECK (size > 0 AND size <= 10000000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rama_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rama_contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rama_uploads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rama_site_content, public.rama_contact_messages, public.rama_uploads FROM anon, authenticated;
GRANT ALL ON public.rama_site_content, public.rama_contact_messages, public.rama_uploads TO service_role;
CREATE OR REPLACE FUNCTION public.save_rama_content(p_value jsonb, p_expected_version integer)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_version integer;
BEGIN
  IF p_expected_version = 0 THEN
    INSERT INTO public.rama_site_content (key,value,version,updated_at)
    VALUES ('main',p_value,1,now()) ON CONFLICT (key) DO NOTHING RETURNING version INTO v_version;
  ELSE
    UPDATE public.rama_site_content SET value=p_value,version=version+1,updated_at=now()
    WHERE key='main' AND version=p_expected_version RETURNING version INTO v_version;
  END IF;
  RETURN v_version;
END;
$$;
REVOKE ALL ON FUNCTION public.save_rama_content(jsonb,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_rama_content(jsonb,integer) TO service_role;
CREATE OR REPLACE FUNCTION public.submit_rama_message(p_name text,p_email text,p_company text,p_subject text,p_message text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(lower(p_email),0));
  IF (SELECT count(*) FROM public.rama_contact_messages WHERE lower(email)=lower(p_email) AND created_at>now()-interval '10 minutes') >= 3 THEN
    RETURN false;
  END IF;
  INSERT INTO public.rama_contact_messages (name,email,company,subject,message) VALUES (p_name,lower(p_email),p_company,p_subject,p_message);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_rama_message(text,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_rama_message(text,text,text,text,text) TO service_role;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('rama-media','rama-media',false,10000000,ARRAY['image/png','image/jpeg','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;
COMMIT;
