-- =============================================================================
-- FIX: pgcrypto на Supabase (схема extensions, gen_salt с одним аргументом)
-- Запустить если seed employees падает на gen_salt
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.hash_employee_password(p_plain TEXT)
RETURNS TEXT
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT extensions.crypt(p_plain, extensions.gen_salt('bf'));
$$;

CREATE OR REPLACE FUNCTION public.verify_employee_password(p_plain TEXT, p_hash TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT extensions.crypt(p_plain, p_hash) = p_hash;
$$;

CREATE OR REPLACE FUNCTION public.employees_hash_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    IF NEW.password_hash IS NULL OR NEW.password_hash = '' THEN
        RAISE EXCEPTION 'password_hash обязателен';
    END IF;

    IF NEW.password_hash NOT LIKE '$2%' THEN
        NEW.password_hash := public.hash_employee_password(NEW.password_hash);
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.encrypt_phone(p_phone TEXT, p_key TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT encode(extensions.pgp_sym_encrypt(p_phone, p_key), 'base64');
$$;

CREATE OR REPLACE FUNCTION public.decrypt_phone(p_encrypted TEXT, p_key TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT extensions.pgp_sym_decrypt(decode(p_encrypted, 'base64'), p_key);
$$;
