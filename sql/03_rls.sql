-- =============================================================================
-- Шаг 4: RLS (клиент, сборщик, курьер, админ)
--
-- Требование Supabase: сотрудники — пользователи Auth, email = employees.username
-- Опционально: app_metadata.role и app_metadata.employee_id в JWT
-- =============================================================================

-- Сброс старых политик
DROP POLICY IF EXISTS policy_orders_select ON public.orders;
DROP POLICY IF EXISTS policy_employees_select ON public.employees;
DROP POLICY IF EXISTS policy_order_items_select ON public.order_items;
DROP POLICY IF EXISTS policy_order_history_select ON public.order_history;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_codes ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------- orders
CREATE POLICY orders_select ON public.orders
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR (user_id = auth.uid()::text)
        OR (picker_id = public.current_employee_id())
        OR (courier_id = public.current_employee_id())
        OR (
            public.current_employee_role() = 'picker'
            AND status IN ('paid', 'assembling')
        )
        OR (
            public.current_employee_role() = 'courier'
            AND status IN ('packed', 'in_transit', 'ready')
        )
    );

CREATE POLICY orders_insert_customer ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY orders_update ON public.orders
    FOR UPDATE TO authenticated
    USING (
        public.is_admin()
        OR (user_id = auth.uid()::text AND status = 'in_cart')
        OR (picker_id = public.current_employee_id())
        OR (courier_id = public.current_employee_id())
        OR (
            public.current_employee_role() = 'picker'
            AND status IN ('paid', 'assembling', 'packed')
        )
        OR (
            public.current_employee_role() = 'courier'
            AND status IN ('packed', 'in_transit', 'ready')
        )
    );

-- ----------------------------------------------------------------------------- order_items
CREATE POLICY order_items_select ON public.order_items
    FOR SELECT TO authenticated
    USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND (
                  o.user_id = auth.uid()::text
                  OR o.picker_id = public.current_employee_id()
              )
        )
    );

CREATE POLICY order_items_insert ON public.order_items
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.user_id = auth.uid()::text
              AND o.status = 'in_cart'
        )
    );

CREATE POLICY order_items_update ON public.order_items
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.user_id = auth.uid()::text
              AND o.status = 'in_cart'
        )
    );

CREATE POLICY order_items_delete ON public.order_items
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.user_id = auth.uid()::text
              AND o.status = 'in_cart'
        )
    );

-- ----------------------------------------------------------------------------- order_history
CREATE POLICY order_history_select ON public.order_history
    FOR SELECT TO authenticated
    USING (public.is_staff() OR public.is_admin());

-- ----------------------------------------------------------------------------- employees
CREATE POLICY employees_select_self ON public.employees
    FOR SELECT TO authenticated
    USING (public.is_admin() OR username = auth.jwt() ->> 'email');

-- ----------------------------------------------------------------------------- users (профиль)
CREATE POLICY users_select_own ON public.users
    FOR SELECT TO authenticated
    USING (id = auth.uid()::text OR public.is_admin());

CREATE POLICY users_update_own ON public.users
    FOR UPDATE TO authenticated
    USING (id = auth.uid()::text)
    WITH CHECK (id = auth.uid()::text);

-- ----------------------------------------------------------------------------- auth_codes (только через RPC verify — insert от service)
CREATE POLICY auth_codes_deny_all ON public.auth_codes
    FOR ALL TO authenticated
    USING (false)
    WITH CHECK (false);

-- ----------------------------------------------------------------------------- каталог: чтение всем
CREATE POLICY products_read ON public.products
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY product_prices_read ON public.product_prices
    FOR SELECT TO anon, authenticated
    USING (true);

-- Админ: полный доступ к ценам и товарам (упрощённо — через is_admin)
CREATE POLICY product_prices_admin ON public.product_prices
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY products_admin ON public.products
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Справочники: чтение всем, запись админ
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY cities_read ON public.cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pharmacies_read ON public.pharmacies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_read ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY manufacturers_read ON public.manufacturers FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY cities_admin ON public.cities FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY pharmacies_admin ON public.pharmacies FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY categories_admin ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY manufacturers_admin ON public.manufacturers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
