-- Целостность: одна корзина, auth_codes без FK, переходы статусов, RPC
-- На уже развёрнутой БД: безопасно перезапускать (IF NOT EXISTS / OR REPLACE)

-- -----------------------------------------------------------------------------
-- 1. Одна корзина на пользователя
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_one_cart_per_user
    ON public.orders (user_id)
    WHERE status = 'in_cart' AND user_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. auth_codes: убрать FK на users(phone) — код до регистрации пользователя
-- -----------------------------------------------------------------------------
ALTER TABLE public.auth_codes
    DROP CONSTRAINT IF EXISTS auth_codes_phone_fkey;

-- -----------------------------------------------------------------------------
-- 3. Хелперы для RLS и триггеров (SECURITY DEFINER — только public schema)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_employee_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT e.id
    FROM public.employees e
    WHERE e.username = (auth.jwt() ->> 'email')
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_employee_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT e.role
    FROM public.employees e
    WHERE e.username = (auth.jwt() ->> 'email')
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(public.current_employee_role() = 'admin', false);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.current_employee_id() IS NOT NULL;
$$;

-- Контекст сотрудника для аудита (задаёт API перед UPDATE orders)
CREATE OR REPLACE FUNCTION public.set_audit_employee(p_employee_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM set_config('app.audit_employee_id', p_employee_id::TEXT, true);
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. Улучшенный аудит статусов (кто изменил — из app.* или JWT)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_employee_id INTEGER;
BEGIN
    IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
        RETURN NEW;
    END IF;

    v_employee_id := NULLIF(current_setting('app.audit_employee_id', true), '')::INTEGER;
    IF v_employee_id IS NULL THEN
        v_employee_id := public.current_employee_id();
    END IF;

    INSERT INTO public.order_history (order_id, status, employee_id, changed_at)
    VALUES (NEW.id, NEW.status, v_employee_id, NOW());

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_order_status ON public.orders;
CREATE TRIGGER trg_audit_order_status
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.log_order_status_change();

-- -----------------------------------------------------------------------------
-- 5. Допустимые переходы статусов + самоназначение
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_order_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_emp_id INTEGER;
    v_items_count INTEGER;
BEGIN
    v_role := public.current_employee_role();
    v_emp_id := public.current_employee_id();

    -- Смена статуса
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Клиент: только in_cart -> paid (оформление)
        IF v_role IS NULL AND auth.uid() IS NOT NULL THEN
            IF NOT (OLD.status = 'in_cart' AND NEW.status = 'paid') THEN
                RAISE EXCEPTION 'Клиент может перевести заказ только из in_cart в paid';
            END IF;
        END IF;

        -- Сборщик
        IF v_role = 'picker' THEN
            IF OLD.status = 'paid' AND NEW.status = 'assembling' THEN
                NULL;
            ELSIF OLD.status = 'assembling' AND NEW.status = 'packed' THEN
                NULL;
            ELSE
                RAISE EXCEPTION 'Сборщик: недопустимый переход % -> %', OLD.status, NEW.status;
            END IF;
        END IF;

        -- Курьер
        IF v_role = 'courier' THEN
            IF OLD.status = 'packed' AND NEW.status = 'in_transit' THEN
                NULL;
            ELSIF OLD.status = 'in_transit' AND NEW.status = 'ready' THEN
                NULL;
            ELSE
                RAISE EXCEPTION 'Курьер: недопустимый переход % -> %', OLD.status, NEW.status;
            END IF;
        END IF;

        -- Админ — любой переход, включая cancelled
        IF v_role = 'admin' THEN
            NULL;
        ELSIF NEW.status = 'cancelled' THEN
            RAISE EXCEPTION 'Отмена заказа доступна только администратору';
        END IF;

        -- completed только из ready (кроме админа)
        IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'ready' AND v_role IS DISTINCT FROM 'admin' THEN
            RAISE EXCEPTION 'Завершить заказ можно только из статуса ready';
        END IF;

        -- paid: в корзине должны быть товары
        IF NEW.status = 'paid' THEN
            SELECT COUNT(*) INTO v_items_count FROM public.order_items WHERE order_id = NEW.id;
            IF v_items_count = 0 THEN
                RAISE EXCEPTION 'Нельзя оплатить пустой заказ';
            END IF;
        END IF;
    END IF;

    -- Самоназначение сборщика
    IF NEW.picker_id IS DISTINCT FROM OLD.picker_id THEN
        IF NEW.picker_id IS NOT NULL AND OLD.picker_id IS NOT NULL AND NEW.picker_id IS DISTINCT FROM OLD.picker_id THEN
            IF v_role IS DISTINCT FROM 'admin' THEN
                RAISE EXCEPTION 'Сборщик уже назначен';
            END IF;
        END IF;
        IF v_role = 'picker' AND OLD.picker_id IS NULL THEN
            NEW.picker_id := v_emp_id;
        END IF;
    END IF;

    -- Самоназначение курьера
    IF NEW.courier_id IS DISTINCT FROM OLD.courier_id THEN
        IF NEW.courier_id IS NOT NULL AND OLD.courier_id IS NOT NULL AND NEW.courier_id IS DISTINCT FROM OLD.courier_id THEN
            IF v_role IS DISTINCT FROM 'admin' THEN
                RAISE EXCEPTION 'Курьер уже назначен';
            END IF;
        END IF;
        IF v_role = 'courier' AND OLD.courier_id IS NULL THEN
            NEW.courier_id := v_emp_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_update ON public.orders;
CREATE TRIGGER trg_validate_order_update
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_order_update();

-- -----------------------------------------------------------------------------
-- 6. Выдача заказа по коду (ready -> completed)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_order_with_code(
    p_order_id INTEGER,
    p_code TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order public.orders%ROWTYPE;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN 'ЗАКАЗ_НЕ_НАЙДЕН';
    END IF;

    IF v_order.status IS DISTINCT FROM 'ready' THEN
        RETURN 'ЗАКАЗ_НЕ_ГОТОВ_К_ВЫДАЧЕ';
    END IF;

    IF v_order.verification_code IS DISTINCT FROM p_code THEN
        RETURN 'НЕВЕРНЫЙ_КОД';
    END IF;

    UPDATE public.orders
    SET status = 'completed'
    WHERE id = p_order_id;

    RETURN 'УСПЕШНО';
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_order_with_code(INTEGER, TEXT) TO authenticated;

-- -----------------------------------------------------------------------------
-- 7. Создание / получение корзины (одна на пользователя)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_or_create_cart(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id INTEGER;
BEGIN
    SELECT id INTO v_order_id
    FROM public.orders
    WHERE user_id = p_user_id AND status = 'in_cart'
    LIMIT 1;

    IF v_order_id IS NOT NULL THEN
        RETURN v_order_id;
    END IF;

    INSERT INTO public.orders (user_id, status, total_price)
    VALUES (p_user_id, 'in_cart', 0)
    RETURNING id INTO v_order_id;

    RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_cart(TEXT) TO authenticated;

-- Запрос SMS-кода (обход RLS на auth_codes)
CREATE OR REPLACE FUNCTION public.request_auth_code(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_phone IS NULL OR length(trim(p_phone)) < 10 THEN
        RETURN 'НЕВЕРНЫЙ_ТЕЛЕФОН';
    END IF;

    INSERT INTO public.auth_codes (phone, code, expires_at)
    VALUES (trim(p_phone), '000000', NOW());
    -- trg_prepare_auth_code (BEFORE INSERT) задаёт реальный code и expires_at

    RETURN 'ОТПРАВЛЕНО';
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_auth_code(TEXT) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.verify_user_code(TEXT, TEXT) TO anon, authenticated;
