
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin_master', 'admin_company', 'member');

-- Companies
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text,
  cnpj text,
  email text,
  phone text,
  website text,
  logo_url text,
  address text,
  plan text NOT NULL DEFAULT 'card',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  job_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, company_id)
);

-- Security definer helpers
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_company(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- Cards
CREATE TABLE public.cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  template text NOT NULL DEFAULT 'minimalist',
  status text NOT NULL DEFAULT 'active',
  avatar_url text,
  public_name text NOT NULL,
  job_title text,
  bio text,
  whatsapp text,
  phone text,
  email text,
  website text,
  address text,
  company_name text,
  logo_url text,
  primary_color text DEFAULT '#1E40AF',
  secondary_color text DEFAULT '#10B981',
  video_url text,
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_buttons jsonb NOT NULL DEFAULT '[]'::jsonb,
  capture_leads boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  seo_image_url text,
  meta_pixel_id text,
  ga_id text,
  gtm_id text,
  default_utm jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cards_company_idx ON public.cards(company_id);
CREATE INDEX cards_slug_idx ON public.cards(slug);

-- Leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text,
  whatsapp text,
  email text,
  company text,
  job_title text,
  message text,
  interest text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  ip text,
  user_agent text,
  referer text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_card_idx ON public.leads(card_id);
CREATE INDEX leads_company_idx ON public.leads(company_id);

-- Analytics events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_label text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_card_idx ON public.analytics_events(card_id);
CREATE INDEX analytics_company_idx ON public.analytics_events(company_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-provision company + profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _company_id uuid;
  _company_name text;
  _full_name text;
BEGIN
  _company_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name',''), 'Minha Empresa');
  _full_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), NEW.email);

  INSERT INTO public.companies (name, email) VALUES (_company_name, NEW.email)
  RETURNING id INTO _company_id;

  INSERT INTO public.profiles (id, company_id, full_name, email)
  VALUES (NEW.id, _company_id, _full_name, NEW.email);

  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (NEW.id, _company_id, 'admin_company');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GRANTS + RLS
-- companies
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own company" ON public.companies FOR SELECT TO authenticated
  USING (id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "update own company" ON public.companies FOR UPDATE TO authenticated
  USING ((id = public.get_user_company(auth.uid()) AND public.has_role(auth.uid(), 'admin_company')) OR public.has_role(auth.uid(), 'admin_master'));

-- profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view profiles in company" ON public.profiles FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR id = auth.uid() OR public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- user_roles
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- cards
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT ON public.cards TO anon;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active" ON public.cards FOR SELECT TO anon, authenticated
  USING (status = 'active');
CREATE POLICY "company view all" ON public.cards FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "company insert" ON public.cards FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "company update" ON public.cards FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "company delete" ON public.cards FOR DELETE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));

-- leads
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon insert" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth insert" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company view leads" ON public.leads FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));
CREATE POLICY "company update leads" ON public.leads FOR UPDATE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));
CREATE POLICY "company delete leads" ON public.leads FOR DELETE TO authenticated
  USING (company_id = public.get_user_company(auth.uid()));

-- analytics
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon insert events" ON public.analytics_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth insert events" ON public.analytics_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company view events" ON public.analytics_events FOR SELECT TO authenticated
  USING (company_id = public.get_user_company(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));
