-- HOTFIX E1: «Код принят, но профиль не создан» — нет INSERT-политики на users.
-- Выполните целиком в Supabase SQL Editor, затем в /register снова «Подтвердить» или новый код.

DROP POLICY IF EXISTS users_insert_own ON public.users;

CREATE POLICY users_insert_own ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid()::text);

-- Проверка (должна вернуть одну строку users_insert_own)
SELECT polname, polcmd
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'users' AND polname = 'users_insert_own';
