# Проверка БД и резервное копирование

## Проверка (5 минут)

1. Убедись, что накатаны файлы **01 → 02 → 03 → 04** (05 — по желанию).
2. Запусти **`sql/07_verify_setup.sql`** — все секции должны отработать без ERROR.
3. Запусти **`sql/06_seed_demo_data.sql`** — появятся города, товары, тестовые заказы.
4. Снова **`sql/05_queries_coursework.sql`** — запросы 1–8 должны вернуть строки (в п.4 подставь свой `user_id` или оставь тестовый UUID из seed).
5. Проверка RPC вручную:

```sql
SELECT public.request_auth_code('+79990001122');
SELECT public.verify_user_code('+79990001122', '123456'); -- код из таблицы auth_codes после request
```

---

## Резервное копирование — 2 способа

### Способ A (проще всего, для курсовика)

**Supabase Dashboard** → твой проект → **Database** → **Backups**

- На платных планах — автоматические бэкапы (сделай скрин для отчёта).
- Кнопка **Download backup** / Point-in-time — если доступно.

В пояснительной напиши: *«Используется встроенное резервное копирование Supabase (ежедневные снимки, хранение N дней)»*.

Этого обычно достаточно для защиты курсовика.

### Способ B (скрипт `pg_dump` — для отчёта «свой скрипт»)

1. **Dashboard** → **Project Settings** → **Database**
2. Скопируй **Connection string** → URI (режим Session или Direct).
3. В терминале на Mac:

```bash
cd green-pharmacy-db
export DATABASE_URL="postgresql://postgres.XXXX:ПАРОЛЬ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
./scripts/backup.sh
```

4. Файл появится в `green-pharmacy-db/backups/green_pharmacy_YYYYMMDD_HHMMSS.sql`

**Если `pg_dump` не установлен:**

```bash
brew install libpq
brew link --force libpq
```

**Важно:** не коммить `DATABASE_URL` и пароль в git.

---

## Можно ли переходить к разработке?

**Да**, если:

- [x] 01–04 без ошибок
- [x] `07_verify_setup` — views и RLS на месте
- [ ] (желательно) seed + хотя бы 2–3 запроса из 05 с данными
- [ ] (для отчёта) скрин Backups или один успешный `backup.sh`

### На фронте подключить

| Задача | API |
|--------|-----|
| Каталог | `vw_client_catalog`, фильтр категорий |
| Корзина | `get_or_create_cart`, `order_items` |
| 2FA | `request_auth_code`, `verify_user_code` |
| Checkout | `vw_pickup_points`, update `orders` |
| Оплата | заглушка → `status = paid` |
| Staff login | Supabase Auth + `employees` |
| Админ/сборщик/курьер | views + update `orders` под RLS |

### Не блокирует старт фронта

- Реальная SMS и оплата
- Карта ПВЗ (можно dropdown из `vw_pickup_points`)
- Лайки (`favorites` — позже)
- Save-draft на всех админ-экранах

### После старта фронта (когда Auth заработает)

- Создать пользователей Auth для `admin@test.local` и т.д. с тем же email
- Клиент: `users.id = auth.uid()`
- Прогнать сценарий: корзина → paid → сборщик → курьер → ready → код → completed
