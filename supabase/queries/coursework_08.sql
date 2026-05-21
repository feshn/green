-- =============================================================================
-- Шаг 7: 8 обязательных запросов (3+ таблицы, разные типы)
-- Для отчёта: скрин результата каждого запроса в SQL Editor
-- =============================================================================

-- 1) JOIN: каталог с категорией и актуальной ценой
SELECT product_id, product_name, category_name, current_price, old_price
FROM public.vw_client_catalog
ORDER BY product_name
LIMIT 20;

-- 2) Фильтр + JOIN: товары выбранных категорий (чекбоксы на main)
SELECT p.id, p.name, c.name AS category, pp.price
FROM public.products p
JOIN public.product_categories pc ON p.id = pc.product_id
JOIN public.categories c ON c.id = pc.category_id
JOIN LATERAL (
    SELECT price, old_price
    FROM public.product_prices
    WHERE product_id = p.id AND is_available = true
    ORDER BY created_at DESC
    LIMIT 1
) pp ON true
WHERE c.id IN (1, 2, 3)
ORDER BY pp.price ASC;

-- 3) Агрегация: корзина пользователя (сумма и количество позиций)
SELECT
    o.user_id,
    o.id AS order_id,
    COUNT(oi.id) AS items_count,
    SUM(oi.quantity * oi.price_at_purchase) AS cart_total
FROM public.orders o
JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.status = 'in_cart'
GROUP BY o.user_id, o.id;

-- 4) Подзапрос EXISTS: заказы клиента с адресом ПВЗ
SELECT
    o.id,
    o.status,
    o.total_price,
    (
        SELECT ph.address
        FROM public.pharmacies ph
        WHERE ph.id = o.pharmacy_id
    ) AS pickup_address
FROM public.orders o
WHERE o.user_id = '00000000-0000-4000-8000-000000000001'  -- тестовый id из 06_seed
  AND o.status <> 'in_cart'
ORDER BY o.created_at DESC;

-- 5) LEFT JOIN: админ-таблица заказов со сборщиком и курьером
SELECT
    order_id,
    client_name,
    pickup_point,
    order_status,
    picker_name,
    courier_username,
    total_sum
FROM public.vw_admin_orders
WHERE order_status IN ('paid', 'assembling', 'packed', 'in_transit', 'ready')
ORDER BY order_id DESC;

-- 6) CTE: журнал аудита за последние 7 дней
WITH recent_audit AS (
    SELECT *
    FROM public.order_history
    WHERE changed_at >= NOW() - INTERVAL '7 days'
)
SELECT
    ra.order_id,
    ra.status,
    ra.changed_at,
    e.name AS employee_name,
    e.role
FROM recent_audit ra
LEFT JOIN public.employees e ON e.id = ra.employee_id
ORDER BY ra.changed_at DESC;

-- 7) HAVING: категории с более чем N товарами
SELECT
    c.name AS category_name,
    COUNT(DISTINCT pc.product_id) AS products_count
FROM public.categories c
JOIN public.product_categories pc ON pc.category_id = c.id
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT pc.product_id) > 2
ORDER BY products_count DESC;

-- 8) Аналитика: выручка по городам (заказы + аптеки + города)
SELECT
    ci.name AS city,
    COUNT(DISTINCT o.id) AS orders_count,
    SUM(o.total_price) AS revenue
FROM public.orders o
JOIN public.pharmacies ph ON ph.id = o.pharmacy_id
JOIN public.cities ci ON ci.id = ph.city_id
WHERE o.status NOT IN ('in_cart', 'cancelled')
GROUP BY ci.id, ci.name
ORDER BY revenue DESC NULLS LAST;
