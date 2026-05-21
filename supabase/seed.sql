-- =============================================================================
-- Демо-данные для проверки views и 8 запросов (можно удалить перед продом)
-- Запускать один раз после 01–04
-- =============================================================================

INSERT INTO public.cities (name) VALUES ('Омск'), ('Москва')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.categories (name) VALUES ('Витамины'), ('Антибиотики'), ('Уход')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.manufacturers (name) VALUES ('ФармСтандарт'), ('Тева')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.dosage_form (name) VALUES ('Таблетки'), ('Капсулы')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (name)
SELECT v.name FROM (VALUES
    ('Тирзетта 5мг №30'),
    ('Витамин D3 2000'),
    ('Нурофен 200мг')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name);

-- Привязки (id могут отличаться — подставь свои id при необходимости)
INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
CROSS JOIN public.categories c
WHERE p.name = 'Тирзетта 5мг №30' AND c.name = 'Антибиотики'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
JOIN public.categories c ON c.name = 'Витамины'
WHERE p.name = 'Витамин D3 2000'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
JOIN public.categories c ON c.name = 'Уход'
WHERE p.name = 'Нурофен 200мг'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_details (product_id, dosage_form_id, manufacturer_id, composition, usage_instructions)
SELECT p.id, df.id, m.id, 'Действующее вещество ...', 'По назначению врача'
FROM public.products p
JOIN public.dosage_form df ON df.name = 'Таблетки'
JOIN public.manufacturers m ON m.name = 'ФармСтандарт'
WHERE p.name = 'Тирзетта 5мг №30'
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO public.product_prices (product_id, price, old_price, is_available)
SELECT p.id, 1200.00, 1400.00, true FROM public.products p
WHERE p.name = 'Тирзетта 5мг №30'
  AND NOT EXISTS (SELECT 1 FROM public.product_prices pp WHERE pp.product_id = p.id);

INSERT INTO public.product_prices (product_id, price, old_price, is_available)
SELECT p.id, 450.00, NULL, true FROM public.products p
WHERE p.name = 'Витамин D3 2000'
  AND NOT EXISTS (SELECT 1 FROM public.product_prices pp WHERE pp.product_id = p.id);

INSERT INTO public.product_prices (product_id, price, old_price, is_available)
SELECT p.id, 320.00, 380.00, true FROM public.products p
WHERE p.name = 'Нурофен 200мг'
  AND NOT EXISTS (SELECT 1 FROM public.product_prices pp WHERE pp.product_id = p.id);

INSERT INTO public.product_images (product_id, image_url, is_main)
SELECT p.id, 'https://placehold.co/200x200', true
FROM public.products p
WHERE NOT EXISTS (SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id AND pi.is_main = true);

INSERT INTO public.pharmacies (city_id, address, latitude, longitude)
SELECT c.id, 'Омск, Разбитых фонарей 25', 54.9924, 73.3686
FROM public.cities c WHERE c.name = 'Омск'
  AND NOT EXISTS (SELECT 1 FROM public.pharmacies ph WHERE ph.address = 'Омск, Разбитых фонарей 25');

INSERT INTO public.pharmacies (city_id, address, latitude, longitude)
SELECT c.id, 'Омск, Ленина 10', 54.9700, 73.4000
FROM public.cities c WHERE c.name = 'Омск'
  AND NOT EXISTS (SELECT 1 FROM public.pharmacies ph WHERE ph.address = 'Омск, Ленина 10');

-- Тестовый клиент (id как в Supabase Auth после регистрации — замени на свой uuid)
INSERT INTO public.users (id, phone, name, opd_accepted)
VALUES ('00000000-0000-4000-8000-000000000001', '+79853522331', 'Тест Клиент', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.employees (username, password_hash, role, name, surname)
VALUES
    ('admin@test.local', 'Admin123!', 'admin', 'Админ', 'Тестов'),
    ('picker@test.local', 'Picker123!', 'picker', 'Сборщик', 'Тестов'),
    ('courier@test.local', 'Courier123!', 'courier', 'Курьер', 'Тестов')
ON CONFLICT (username) DO NOTHING;

-- Заказы для запросов
INSERT INTO public.orders (user_id, status, total_price, pharmacy_id, delivery_date, picker_id, courier_id)
SELECT
    '00000000-0000-4000-8000-000000000001',
    'paid',
    1200.00,
    (SELECT id FROM public.pharmacies LIMIT 1),
    CURRENT_DATE + 3,
    (SELECT id FROM public.employees WHERE role = 'picker' LIMIT 1),
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM public.orders
    WHERE user_id = '00000000-0000-4000-8000-000000000001' AND status = 'paid'
);

INSERT INTO public.order_items (order_id, product_id, quantity, price_at_purchase)
SELECT o.id, p.id, 2, 1200.00
FROM public.orders o
JOIN public.products p ON p.name = 'Тирзетта 5мг №30'
WHERE o.user_id = '00000000-0000-4000-8000-000000000001' AND o.status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.order_id = o.id)
LIMIT 1;

-- Корзина
INSERT INTO public.orders (user_id, status, total_price)
SELECT '00000000-0000-4000-8000-000000000001', 'in_cart', 0
WHERE NOT EXISTS (
    SELECT 1 FROM public.orders
    WHERE user_id = '00000000-0000-4000-8000-000000000001' AND status = 'in_cart'
);

INSERT INTO public.order_items (order_id, product_id, quantity, price_at_purchase)
SELECT o.id, p.id, 1, 450.00
FROM public.orders o
JOIN public.products p ON p.name = 'Витамин D3 2000'
WHERE o.status = 'in_cart'
  AND o.user_id = '00000000-0000-4000-8000-000000000001'
  AND NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.order_id = o.id AND oi.product_id = p.id);
