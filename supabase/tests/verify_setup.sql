-- =============================================================================
-- Проверка: все объекты на месте (запустить в Supabase SQL Editor)
-- =============================================================================

-- 1) Таблицы
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2) Views
SELECT table_name AS view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3) Функции (наши RPC)
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'verify_user_code',
    'request_auth_code',
    'get_or_create_cart',
    'complete_order_with_code',
    'current_employee_id',
    'hash_employee_password'
  )
ORDER BY routine_name;

-- 4) RLS включён
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('orders', 'order_items', 'users', 'employees', 'auth_codes')
ORDER BY c.relname;

-- 5) Политики на orders
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'orders';

-- 6) Индекс одной корзины
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND indexname = 'uq_orders_one_cart_per_user';

-- 7) Быстрый smoke-test views (должны вернуть строки после 06_seed)
SELECT 'vw_client_catalog' AS check_name, COUNT(*) AS rows FROM public.vw_client_catalog
UNION ALL
SELECT 'vw_pickup_points', COUNT(*) FROM public.vw_pickup_points
UNION ALL
SELECT 'vw_admin_orders', COUNT(*) FROM public.vw_admin_orders;

-- 8) pgcrypto
SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
) AS pgcrypto_installed;
