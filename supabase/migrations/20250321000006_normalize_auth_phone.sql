-- Нормализация телефона для auth_codes: +7XXXXXXXXXX (устраняет mismatch +7 / 7 / 8)
--
-- ВАЖНО: в SQL Editor выполнять ВЕСЬ файл от начала до конца.
-- Если ошибка "normalize_phone_ru does not exist" — см. supabase/scripts/hotfix_normalize_phone_ru.sql

CREATE OR REPLACE FUNCTION public.normalize_phone_ru(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d TEXT;
BEGIN
  d := regexp_replace(coalesce(trim(p_phone), ''), '\D', '', 'g');
  IF length(d) = 11 AND left(d, 1) = '8' THEN
    d := '7' || substr(d, 2);
  ELSIF length(d) = 10 THEN
    d := '7' || d;
  END IF;
  IF length(d) <> 11 OR left(d, 1) <> '7' THEN
    RETURN NULL;
  END IF;
  RETURN '+' || d;
END;
$$;

CREATE OR REPLACE FUNCTION public.request_auth_code(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
BEGIN
  v_phone := public.normalize_phone_ru(p_phone);
  IF v_phone IS NULL THEN
    RETURN 'НЕВЕРНЫЙ_ТЕЛЕФОН';
  END IF;

  INSERT INTO public.auth_codes (phone, code, expires_at)
  VALUES (v_phone, '000000', NOW());

  RETURN 'ОТПРАВЛЕНО';
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_user_code(user_phone TEXT, input_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_code RECORD;
  v_phone TEXT;
BEGIN
  v_phone := public.normalize_phone_ru(user_phone);
  IF v_phone IS NULL THEN
    RETURN 'НЕВЕРНЫЙ_ТЕЛЕФОН';
  END IF;

  SELECT * INTO active_code
  FROM public.auth_codes
  WHERE phone = v_phone AND is_used = false AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN 'КОД_НЕ_НАЙДЕН_ИЛИ_ИСТЕК';
  END IF;

  IF active_code.attempts >= 5 THEN
    RETURN 'КОД_ЗАБЛОКИРОВАН_ПРЕВЫШЕНЫ_ПОПЫТКИ';
  END IF;

  IF active_code.code = trim(input_code) THEN
    UPDATE public.auth_codes SET is_used = true WHERE id = active_code.id;
    RETURN 'УСПЕШНО';
  ELSE
    UPDATE public.auth_codes SET attempts = attempts + 1 WHERE id = active_code.id;
    IF (active_code.attempts + 1) >= 5 THEN
      RETURN 'КОД_АННУЛИРОВАН_НАЖМИТЕ_ПОВТОРНО';
    ELSE
      RETURN 'НЕВЕРНО_ОСТАЛОСЬ_ПОПЫТОК: ' || (5 - (active_code.attempts + 1));
    END IF;
  END IF;
END;
$$;
