# Green Pharmacy — базовая линия и план доработок

Документ фиксирует **что уже есть в Supabase** (после шагов 1–2) и **что добавляем** миграциями `sql/01` … `sql/05` без полного переписывания схемы.

Дизайн: [Figma Green](https://www.figma.com/design/rzkHWJsXsgN36q3P8mrkAA/Green) — страница **Ready**, 29 экранных фреймов.

---

## Статусы заказа (зафиксировано)

| Статус | Смысл | Кто переводит |
|--------|--------|----------------|
| `in_cart` | Корзина | Клиент |
| `paid` | Оплачен (заглушка) | Клиент / API |
| `assembling` | В сборке | Сборщик «Взять» |
| `packed` | Собран | Сборщик «Завершить сборку» |
| `in_transit` | В пути | Курьер |
| `ready` | На ПВЗ, ждёт клиента | Курьер (+ SMS с кодом) |
| `completed` | Клиент забрал | Код выдачи / админ |
| `cancelled` | Отменён | Админ (chip) |

**Самоназначение:** `picker_id` / `courier_id` — только если `IS NULL`.  
**Одна корзина:** не более одного `in_cart` на `user_id`.

---

## Базовая линия (уже сделано — не удаляем)

### Шаг 1 — схема и автоматика

| Объект | Статус |
|--------|--------|
| 16 таблиц | `cities`, `pharmacies`, `categories`, `products`, `product_categories`, `dosage_form`, `manufacturers`, `product_details`, `product_prices`, `product_images`, `users`, `employees`, `orders`, `order_items`, `order_history`, `auth_codes` |
| ENUM `order_status` | 8 значений |
| Триггер `trg_calculate_order_total` | пересчёт `orders.total_price` |
| Триггер `trg_audit_order_status` | запись в `order_history` |
| Триггер `trg_generate_verification_code` | код при `ready` |
| Триггер `trg_prepare_auth_code` | генерация SMS-кода |

### Шаг 2 — 2FA

| Объект | Статус |
|--------|--------|
| `verify_user_code(phone, code)` | лимит 5 попыток |
| `auth_codes` | TTL 5 мин, `is_used` |

### Частично (есть, но дорабатываем)

| Объект | Проблема |
|--------|----------|
| 5 views | `vw_client_catalog` дубли цен; нет view курьера без состава |
| RLS на 4 таблицах | нет клиента/админа; рекурсия на `order_items`; нет INSERT/UPDATE |
| `auth_codes.phone` → FK `users(phone)` | ломает первый вход |
| Нет constraint одной корзины | |
| Нет триггеров переходов статусов | |
| Пароли | колонка есть, `pgcrypto` не подключён |

---

## Дельта (конкретно дорабатываем)

Файлы в **`supabase/migrations/`** — накатывать **по порядку** в Supabase SQL Editor.

| Файл | Содержание |
|------|------------|
| `20250320000001_initial_schema.sql` | Таблицы, базовые триггеры, `verify_user_code` |
| `20250320000002_integrity_and_rpc.sql` | Корзина, RPC, validate_order, audit |
| `20250320000003_views.sql` | Все views |
| `20250320000004_rls.sql` | RLS |
| `20250320000005_crypto.sql` | pgcrypto (Supabase `extensions`) |
| `supabase/seed.sql` | Демо-данные |
| `supabase/queries/coursework_08.sql` | 8 запросов |
| `scripts/backup.sh` | `pg_dump` для пояснительной |

Папка `sql/` — устаревшие копии, см. `sql/README.md`.

### Не входит в SQL (фронт / Supabase Dashboard)

- Реальная SMS — заглушка + описание в отчёте
- Оплата — заглушка → `paid`
- JWT claims для сотрудников (`employee_id`, `role`) — настраивается в Auth / Edge Function
- Карта ПВЗ — позже; в БД уже есть `latitude` / `longitude`
- `favorites` (лайк) — после MVP

---

## Роли и доступ (целевая модель)

| Роль | Идентификация | Заказы | Состав заказа | Товары / аудит |
|------|----------------|--------|---------------|----------------|
| Гость / anon | — | — | — | каталог (view) |
| Клиент | `auth.uid() = users.id` | свои | свои | — |
| Сборщик | JWT email = `employees.username` | назначенные + очередь `paid` | да | — |
| Курьер | то же | назначенные | **нет** (view) | — |
| Админ | `employees.role = 'admin'` | все | все | products + audit |

---

## Классификация для КП

- **Основные сущности:** `users`, `orders`, `products` (+ связанные `order_items`, `product_details`)
- **Справочники (≤3 в отчёте):** `cities`, `categories`, `manufacturers` (`dosage_form` — атрибут товара)

---

## Чеклист внедрения

- [ ] Сохранить дамп текущей БД перед миграциями
- [ ] `01_migration_integrity.sql`
- [ ] `02_views.sql`
- [ ] `03_rls.sql` + настроить JWT для staff
- [ ] `04_crypto.sql`
- [ ] Прогнать тесты из комментариев в `05_queries_coursework.sql`
- [ ] `scripts/backup.sh` — скрин/лог для отчёта
