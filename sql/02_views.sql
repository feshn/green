-- =============================================================================
-- Шаг 3: представления (витрина для фронта + роли)
-- =============================================================================

-- Актуальная цена: последняя запись product_prices на товар
CREATE OR REPLACE VIEW public.vw_client_catalog AS
SELECT DISTINCT ON (p.id)
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    pp.price AS current_price,
    pp.old_price AS old_price,
    pi.image_url AS preview_image,
    pp.is_available
FROM public.products p
LEFT JOIN public.product_categories pc ON p.id = pc.product_id
LEFT JOIN public.categories c ON pc.category_id = c.id
LEFT JOIN public.product_prices pp ON p.id = pp.product_id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_main = true
WHERE pp.is_available = true
ORDER BY p.id, pp.created_at DESC NULLS LAST;

-- Корзина (один in_cart на user)
CREATE OR REPLACE VIEW public.vw_cart_items AS
SELECT
    o.user_id,
    oi.order_id,
    oi.product_id,
    p.name AS product_name,
    oi.quantity,
    oi.price_at_purchase AS unit_price,
    (oi.quantity * oi.price_at_purchase) AS total_item_price,
    pi.image_url AS product_image
FROM public.orders o
JOIN public.order_items oi ON o.id = oi.order_id
JOIN public.products p ON oi.product_id = p.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_main = true
WHERE o.status = 'in_cart';

CREATE OR REPLACE VIEW public.vw_user_order_history AS
SELECT
    o.user_id,
    o.id AS order_id,
    o.status,
    o.delivery_date,
    ph.address AS pharmacy_address,
    o.total_price
FROM public.orders o
LEFT JOIN public.pharmacies ph ON o.pharmacy_id = ph.id
WHERE o.status <> 'in_cart';

CREATE OR REPLACE VIEW public.vw_admin_orders AS
SELECT
    o.id AS order_id,
    o.user_id AS client_id,
    u.name AS client_name,
    ph.address AS pickup_point,
    o.total_price AS total_sum,
    o.status AS order_status,
    ep.name AS picker_name,
    ep.username AS picker_username,
    ec.name AS courier_name,
    ec.username AS courier_username,
    o.verification_code
FROM public.orders o
LEFT JOIN public.users u ON o.user_id = u.id
LEFT JOIN public.pharmacies ph ON o.pharmacy_id = ph.id
LEFT JOIN public.employees ep ON o.picker_id = ep.id
LEFT JOIN public.employees ec ON o.courier_id = ec.id
WHERE o.status <> 'in_cart';

CREATE OR REPLACE VIEW public.vw_admin_audit_history AS
SELECT
    oh.id AS log_id,
    oh.order_id,
    oh.status AS set_status,
    oh.changed_at,
    e.name AS employee_name,
    e.role AS employee_role
FROM public.order_history oh
LEFT JOIN public.employees e ON oh.employee_id = e.id;

-- Сборщик: заказы + состав
CREATE OR REPLACE VIEW public.vw_picker_orders AS
SELECT
    o.id AS order_id,
    o.status,
    o.total_price,
    ph.address AS pickup_point,
    o.picker_id,
    o.courier_id,
    o.delivery_date,
    o.created_at
FROM public.orders o
LEFT JOIN public.pharmacies ph ON o.pharmacy_id = ph.id
WHERE o.status IN ('paid', 'assembling', 'packed')
   OR o.picker_id = public.current_employee_id();

CREATE OR REPLACE VIEW public.vw_picker_order_items AS
SELECT
    oi.order_id,
    oi.product_id,
    p.name AS product_name,
    oi.quantity,
    oi.price_at_purchase,
    pi.image_url AS product_image
FROM public.order_items oi
JOIN public.products p ON oi.product_id = p.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_main = true
WHERE oi.order_id IN (SELECT order_id FROM public.vw_picker_orders);

-- Курьер: без состава заказа
CREATE OR REPLACE VIEW public.vw_courier_orders AS
SELECT
    o.id AS order_id,
    o.status,
    o.total_price,
    ph.address AS pickup_point,
    ph.latitude,
    ph.longitude,
    o.courier_id,
    o.delivery_date,
    o.verification_code,
    o.created_at
FROM public.orders o
LEFT JOIN public.pharmacies ph ON o.pharmacy_id = ph.id
WHERE o.status IN ('packed', 'in_transit', 'ready')
   OR o.courier_id = public.current_employee_id();

-- Похожие товары: общие категории (для Card 01)
CREATE OR REPLACE VIEW public.vw_similar_products AS
SELECT
    pc1.product_id AS source_product_id,
    pc2.product_id AS similar_product_id,
    p.name AS similar_product_name,
    pp.price AS current_price,
    pp.old_price,
    pi.image_url AS preview_image
FROM public.product_categories pc1
JOIN public.product_categories pc2
    ON pc1.category_id = pc2.category_id
   AND pc1.product_id <> pc2.product_id
JOIN public.products p ON p.id = pc2.product_id
LEFT JOIN LATERAL (
    SELECT price, old_price, is_available
    FROM public.product_prices
    WHERE product_id = pc2.product_id AND is_available = true
    ORDER BY created_at DESC
    LIMIT 1
) pp ON true
LEFT JOIN public.product_images pi ON pi.product_id = pc2.product_id AND pi.is_main = true
WHERE pp.is_available = true;

-- Пункты выдачи для checkout (город + координаты для карты)
-- В таблице pharmacies нет name — подпись для UI = address
CREATE OR REPLACE VIEW public.vw_pickup_points AS
SELECT
    ph.id AS pharmacy_id,
    ph.address AS pickup_label,
    ph.address,
    ph.latitude,
    ph.longitude,
    c.id AS city_id,
    c.name AS city_name
FROM public.pharmacies ph
JOIN public.cities c ON ph.city_id = c.id;

GRANT SELECT ON public.vw_client_catalog TO anon, authenticated;
GRANT SELECT ON public.vw_cart_items TO authenticated;
GRANT SELECT ON public.vw_user_order_history TO authenticated;
GRANT SELECT ON public.vw_admin_orders TO authenticated;
GRANT SELECT ON public.vw_admin_audit_history TO authenticated;
GRANT SELECT ON public.vw_picker_orders TO authenticated;
GRANT SELECT ON public.vw_picker_order_items TO authenticated;
GRANT SELECT ON public.vw_courier_orders TO authenticated;
GRANT SELECT ON public.vw_similar_products TO anon, authenticated;
GRANT SELECT ON public.vw_pickup_points TO anon, authenticated;
