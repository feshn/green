# HANDOFF — Green Pharmacy

Документ для следующего чата / разработчика фронта. **Не поднимать Next.js scaffold** до явной просьбы — сначала читать этот файл.

---

## Продукт

**Green** — веб-аптека с самовывозом из пунктов выдачи. Клиент: каталог, корзина, 2FA по телефону, оформление и история заказов. Персонал: админ (заказы, аудит, товары), сборщик и курьер с ограниченными правами. Курсовой проект по **информационной безопасности**: RLS, триггеры, представления, шифрование паролей, резервное копирование, 8 SQL-запросов.

**Figma:** [https://www.figma.com/design/rzkHWJsXsgN36q3P8mrkAA/Green?node-id=2-2](https://www.figma.com/design/rzkHWJsXsgN36q3P8mrkAA/Green?node-id=2-2)  
**Экраны (29):** [screens.md](./screens.md)  
Репозиторий: `green` (GitHub) / локально `~/Documents/green`

---

## Стек (фиксированный)


| Слой          | Технология                                                            |
| ------------- | --------------------------------------------------------------------- |
| Frontend      | Next.js App Router + TypeScript                                       |
| UI            | Tailwind CSS + shadcn/ui                                              |
| Иконки        | Majesticons / Iconify                                                 |
| Шрифты        | Evolventa + Inter                                                     |
| Data          | @supabase/supabase-js + @supabase/ssr                                 |
| Таблицы staff | TanStack Table                                                        |
| Forms         | React Hook Form + Zod                                                 |
| Backend       | **Только Supabase** (Auth + Postgres + RPC) — без Prisma, без Express |
| Deploy        | Vercel + Supabase Cloud                                               |


**Репозиторий БД (этот):** `green-db`  
**Фронт (создать):** `green-web` — sibling или отдельный repo

---

## Структура репозитория

```
green-pharmacy-db/
├── supabase/
│   ├── migrations/     # 000001 … 000005 — источник истины DDL
│   ├── seed.sql
│   ├── queries/coursework_08.sql
│   └── tests/verify_setup.sql
├── docs/
│   ├── HANDOFF.md      # этот файл
│   ├── screens.md
│   ├── BASELINE_AND_DELTA.md
│   └── BACKUP_AND_VERIFY.md
├── scripts/backup.sh
├── schema.sql          # указатель на migrations (не полный дамп)
└── .cursor/rules/
├── sql/              # legacy; актуально supabase/migrations/
├── README.md
└── supabase/config.toml
```

**Накат SQL:** см. [README.md](../README.md). Если БД уже в Supabase с ранними шагами — повторно **не** гонять `000001`; применять `000002`–`000005` и сверить `tests/verify_setup.sql`.

---

## Чеклист: готово / дальше

### База данных

- Схема 16 таблиц + `order_status`
- Триггеры: total, audit, verification_code, auth_codes, validate_order, hash password
- RPC: `verify_user_code`, `request_auth_code`, `get_or_create_cart`, `complete_order_with_code`
- Views: каталог, корзина, admin, picker, courier (без состава), similar, pickup_points
- RLS: customer / picker / courier / admin
- pgcrypto (Supabase `extensions` schema)
- 8 запросов для отчёта
- Seed + verify scripts
- Supabase Auth: пользователи staff (`email` = `employees.username`)
- Клиент: `users.id` = `auth.uid()` после 2FA
- Скрин backup для пояснительной

### Фронтенд (следующий этап)

- `create-next-app` + shadcn + Supabase SSR
- Middleware: роли `/admin`, `/picker`, `/courier`
- Registration 01–04
- Main / Sort / Card / Checkout / Profile / Orders
- Staff login + Admin + Sortet + Delivery
- Заглушки: оплата → `paid`, лайк
- Фаза 2: карта ПВЗ

---

## Решения по БД

### Auth (два контура)


| Роль   | Механизм                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------ |
| Клиент | `request_auth_code` → `verify_user_code` → профиль `users` + Supabase Auth (`users.id` = `auth.uid()`) |
| Staff  | Supabase Auth, JWT `email` = `employees.username`, роль в `employees.role`                             |


`auth_codes` **без FK** на `users.phone`. Запись кодов только через `request_auth_code` (SECURITY DEFINER).

### RLS (кратко)

- **Клиент:** свои `orders` / `order_items` (`user_id = auth.uid()`), корзина только `in_cart`
- **Сборщик:** заказы `paid`/`assembling` + назначенные; видит **состав**
- **Курьер:** `packed`/`in_transit`/`ready` + назначенные; **состав не видит** — `vw_courier_orders`
- **Админ:** `is_admin()` — полный доступ
- **Каталог:** `anon` + `authenticated` read на products/prices/views

Хелперы: `current_employee_id()`, `current_employee_role()`, `is_admin()`, `is_staff()`.

### Основные таблицы

`users`, `employees`, `orders`, `order_items`, `order_history`, `products`, `product_prices`, `product_categories`, `pharmacies`, `cities`, `auth_codes`, …

### Бизнес-правила (триггер `validate_order_update`)

- Одна корзина: `uq_orders_one_cart_per_user`
- Самоназначение `picker_id` / `courier_id` только если `NULL`
- Курьер: `packed` → `in_transit` → `ready`
- Сборщик: `paid` → `assembling` → `packed`
- `ready` → `completed` по коду или админ
- `cancelled` — только admin

### Справочники для КП

В отчёте считать **≤3 справочника:** `cities`, `categories`, `manufacturers` (`dosage_form` — атрибут товара).

### pharmacies

Колонки: `address`, `latitude`, `longitude` — **нет `name`**. UI: `pickup_label` = `address` (`vw_pickup_points`).

---

## RPC для фронта

```ts
// примеры вызовов
supabase.rpc('request_auth_code', { p_phone: '+7...' })
supabase.rpc('verify_user_code', { user_phone, input_code })
supabase.rpc('get_or_create_cart', { p_user_id: userId })
supabase.rpc('complete_order_with_code', { p_order_id, p_code })
```

Views: `vw_client_catalog`, `vw_cart_items`, `vw_pickup_points`, `vw_admin_orders`, `vw_picker_*`, `vw_courier_orders`, …

---

## Открытые вопросы

1. **Supabase Auth для клиента** после verify — OTP, magic link или custom session?
2. **Main / Search 01 vs 02** — точное отличие в UI?
3. **Save на всех админ-экранах** или только Products?
4. **Карта ПВЗ** — Leaflet vs Yandex (фаза 2)?
5. **order_items RLS** — на проде должен быть **включён** (не оставлять выключенным после отладки).

---

## Env для фронта (шаблон)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Service role — только server-side, никогда в клиенте.

---

## Следующий чат — одна строка

```
@green-pharmacy-db/docs/HANDOFF.md @green-pharmacy-db/docs/screens.md @green-pharmacy-db/supabase/migrations — собери Next.js green-pharmacy-web по стеку из HANDOFF
```

