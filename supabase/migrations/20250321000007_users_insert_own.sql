-- E1: клиент создаёт строку users после 2FA (id = auth.uid())

DROP POLICY IF EXISTS users_insert_own ON public.users;

CREATE POLICY users_insert_own ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid()::text);
