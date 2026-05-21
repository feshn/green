-- =============================================================================
-- HOTFIX: выполни ВЕСЬ файл одним Run (Supabase SQL Editor)
-- Удаляет старую hash_employee_password с gen_salt('bf', 10)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DROP TRIGGER IF EXISTS trg_employees_hash_password ON public.employees;

DROP FUNCTION IF EXISTS public.hash_employee_password(TEXT);
DROP FUNCTION IF EXISTS public.verify_employee_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.employees_hash_password();

CREATE OR REPLACE FUNCTION public.hash_employee_password(p_plain TEXT)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN extensions.crypt(p_plain, extensions.gen_salt('bf'));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_employee_password(p_plain TEXT, p_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN extensions.crypt(p_plain, p_hash) = p_hash;
END;
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

CREATE TRIGGER trg_employees_hash_password
    BEFORE INSERT OR UPDATE OF password_hash ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.employees_hash_password();

-- Проверка: должно вернуть строку, начинающуюся с $2
SELECT public.hash_employee_password('test123') AS sample_hash;
