# green-pharmacy-web

Фронтенд **Green Pharmacy** — Next.js App Router, Supabase SSR, shadcn/ui.

**Путь в репозитории:** `green-pharmacy-web/` (monorepo рядом с DDL в `supabase/`).  
Бэкенд и миграции: корень репозитория `green` → [docs/HANDOFF.md](../docs/HANDOFF.md).

## Стек

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui (`components/ui`)
- `@supabase/supabase-js` + `@supabase/ssr`
- TanStack Table, React Hook Form + Zod (зависимости для E1+, UI таблиц/форм пока нет)

## Env

```bash
cp .env.local.example .env.local
```

Заполните из Supabase Dashboard → **Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLIENT_AUTH_PEPPER` — случайная строка для серверной сессии после 2FA

**Не добавляйте** `service_role` в клиент или `NEXT_PUBLIC_*`.

В Supabase Auth отключите подтверждение email для synthetic `@client.green-pharmacy.local` (или включите auto-confirm).

Для **новых** клиентов один раз в SQL Editor — файл [supabase/scripts/hotfix_users_insert_own.sql](../supabase/scripts/hotfix_users_insert_own.sql) или миграция `20250321000007_users_insert_own.sql`.

## Запуск

```bash
cd green-pharmacy-web
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Маршруты

| Путь | Зона | Guard |
|------|------|--------|
| `/` | Клиент (после входа) | сессия + профиль |
| `/register` | Registration 01–04 | публично |
| `/admin` | Staff | `employees.role = admin` |
| `/picker` | Staff | `picker` |
| `/courier` | Staff | `courier` |

Staff: Supabase Auth JWT `email` = `employees.username`; роль читается из `employees` после `getUser()` (см. `middleware.ts`, `lib/auth/staff-role.ts`).

## Структура

```
green-pharmacy-web/
├── app/
│   ├── (client)/          # публичная зона
│   ├── (staff)/admin|picker|courier/
│   ├── layout.tsx
│   └── globals.css
├── components/ui/         # shadcn
├── lib/
│   ├── supabase/          # client | server | middleware
│   └── auth/staff-role.ts
├── middleware.ts
└── .env.local.example
```

## E1 — отладка 2FA

Если `verify_user_code` в SQL Editor падает с `normalize_phone_ru does not exist` — в Dashboard выполните **целиком** [supabase/scripts/hotfix_normalize_phone_ru.sql](../supabase/scripts/hotfix_normalize_phone_ru.sql), затем запросите **новый** код (старые строки могли быть с другим форматом `phone`).

## E1 — клиентский 2FA

- `/register` — шаги Registration 01–04 (телефон → код → профиль)
- RPC: `request_auth_code`, `verify_user_code`
- После verify: `signIn`/`signUp` + `users.id = auth.uid()`
- `/?staff=admin|picker|courier` — баннер «вход staff в E4»

## Следующий этап

E2 — каталог (`vw_client_catalog`), Main / Search.
