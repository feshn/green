-- Оплата корзины: клиент переводит in_cart → paid.
-- Без WITH CHECK Postgres отклоняет UPDATE с текстом
-- "new row violates row-level security policy for table orders".
-- Выполнить в Supabase SQL Editor.

DROP POLICY IF EXISTS orders_update ON public.orders;

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
    )
    WITH CHECK (
        public.is_admin()
        OR (user_id = auth.uid()::text AND status IN ('in_cart', 'paid'))
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
