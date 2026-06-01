-- Card 01 demo: product_details + product_images + похожие товары
-- Запускать в Supabase SQL Editor (не migration). Безопасно повторно.
-- Либо: cd green-pharmacy-web && npm run seed:demo (нужен SUPABASE_SERVICE_ROLE_KEY)

-- Опционально: если в product_details нет main_image_url (старая схема) — фронт не использует колонку.
-- ALTER TABLE public.product_details ADD COLUMN IF NOT EXISTS main_image_url TEXT;

-- RLS: чтение каталога для anon (если политик ещё нет)
ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosage_form ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_details_read ON public.product_details;
CREATE POLICY product_details_read ON public.product_details
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS product_images_read ON public.product_images;
CREATE POLICY product_images_read ON public.product_images
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS product_categories_read ON public.product_categories;
CREATE POLICY product_categories_read ON public.product_categories
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS dosage_form_read ON public.dosage_form;
CREATE POLICY dosage_form_read ON public.dosage_form
    FOR SELECT TO anon, authenticated USING (true);

-- Категория как в макете Figma (заголовок блока похожих)
INSERT INTO public.categories (name)
VALUES ('От простуды'), ('Поддержание здоровья')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (name)
SELECT v.name FROM (VALUES
    ('Тирзетта 5мг №30'),
    ('Витамин D3 2000'),
    ('Нурофен 200мг'),
    ('Амоксициллин 500мг №10'),
    ('Ибупрофен 200мг №15'),
    ('Парацетамол 500мг №20'),
    ('Цефтриаксон 1г №2'),
    ('Аспирин-С 400мг №10')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name);

INSERT INTO public.manufacturers (name) VALUES ('ФармСтандарт'), ('Тева')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.dosage_form (name) VALUES ('Таблетки'), ('Капсулы')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.product_categories (product_id, category_id)
SELECT p.id, c.id
FROM public.products p
JOIN public.categories c ON c.name = 'От простуды'
WHERE p.name IN (
    'Тирзетта 5мг №30',
    'Амоксициллин 500мг №10',
    'Ибупрофен 200мг №15',
    'Парацетамол 500мг №20',
    'Цефтриаксон 1г №2',
    'Аспирин-С 400мг №10'
)
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
JOIN public.categories c ON c.name = 'Поддержание здоровья'
WHERE p.name = 'Тирзетта 5мг №30'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_details (
    product_id, dosage_form_id, manufacturer_id, composition, usage_instructions
)
SELECT
    p.id, df.id, m.id,
    E'Активные вещества: тирзепатид — 5 мг.\nВспомогательные вещества: натрия цитрат, маннитол, полисорбат 80.',
    E'Подкожно 1 раз в неделю, в одно и то же время суток.\nПеред первым использованием проконсультируйтесь с врачом.'
FROM public.products p
JOIN public.dosage_form df ON df.name = 'Таблетки'
JOIN public.manufacturers m ON m.name = 'ФармСтандарт'
WHERE p.name = 'Тирзетта 5мг №30'
ON CONFLICT (product_id) DO UPDATE SET
    dosage_form_id = EXCLUDED.dosage_form_id,
    manufacturer_id = EXCLUDED.manufacturer_id,
    composition = EXCLUDED.composition,
    usage_instructions = EXCLUDED.usage_instructions;

INSERT INTO public.product_details (product_id, dosage_form_id, composition)
SELECT p.id, df.id, 'Холекальциферол 2000 МЕ'
FROM public.products p
JOIN public.dosage_form df ON df.name = 'Капсулы'
WHERE p.name = 'Витамин D3 2000'
ON CONFLICT (product_id) DO UPDATE SET
    dosage_form_id = EXCLUDED.dosage_form_id,
    composition = EXCLUDED.composition;

-- Нурофен: минимальные details для проверки fallback
INSERT INTO public.product_details (product_id, dosage_form_id, manufacturer_id, composition, usage_instructions)
SELECT p.id, df.id, m.id,
    'Ибупрофен 200 мг',
  'Принимать после еды, не более 3 раз в сутки.'
FROM public.products p
JOIN public.dosage_form df ON df.name = 'Таблетки'
JOIN public.manufacturers m ON m.name = 'Тева'
WHERE p.name = 'Нурофен 200мг'
ON CONFLICT (product_id) DO UPDATE SET
    dosage_form_id = EXCLUDED.dosage_form_id,
    manufacturer_id = EXCLUDED.manufacturer_id,
    composition = EXCLUDED.composition,
    usage_instructions = EXCLUDED.usage_instructions;

INSERT INTO public.product_prices (product_id, price, old_price, is_available)
SELECT p.id, v.price, v.old_price, true
FROM public.products p
JOIN (VALUES
    ('Тирзетта 5мг №30', 1200.00, 1400.00),
    ('Витамин D3 2000', 450.00, NULL),
    ('Нурофен 200мг', 320.00, 380.00),
    ('Амоксициллин 500мг №10', 120.00, 150.00),
    ('Ибупрофен 200мг №15', 130.00, 160.00),
    ('Парацетамол 500мг №20', 90.00, 110.00),
    ('Цефтриаксон 1г №2', 450.00, 520.00),
    ('Аспирин-С 400мг №10', 180.00, 220.00)
) AS v(name, price, old_price) ON p.name = v.name
WHERE NOT EXISTS (SELECT 1 FROM public.product_prices pp WHERE pp.product_id = p.id);

-- Локальные JPG из public/images/products (скопированы из components/Images)
INSERT INTO public.product_images (product_id, image_url, is_main)
SELECT p.id, v.url, v.is_main
FROM public.products p
CROSS JOIN (VALUES
    ('/images/products/big-01.jpg', true),
    ('/images/products/big-02.jpg', false),
    ('/images/products/big-03.jpg', false)
) AS v(url, is_main)
WHERE p.name = 'Тирзетта 5мг №30'
  AND NOT EXISTS (
    SELECT 1 FROM public.product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = v.url
  );

INSERT INTO public.product_images (product_id, image_url, is_main)
SELECT p.id, '/images/products/prev-01.jpg', true
FROM public.products p
WHERE p.name IN (
    'Амоксициллин 500мг №10',
    'Ибупрофен 200мг №15',
    'Парацетамол 500мг №20',
    'Цефтриаксон 1г №2',
    'Аспирин-С 400мг №10',
    'Витамин D3 2000',
    'Нурофен 200мг'
)
AND NOT EXISTS (
    SELECT 1 FROM public.product_images pi WHERE pi.product_id = p.id
);
