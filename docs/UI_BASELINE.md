# UI baseline — Green Pharmacy Web

Зафиксированный результат вёрстки для следующих чатов. **Не дублировать компоненты** — расширять перечисленные ниже.

**Figma:** https://www.figma.com/design/rzkHWJsXsgN36q3P8mrkAA/Green?node-id=2-2  
**Экраны:** [screens.md](./screens.md)  
**Код:** `green-pharmacy-web/`

---

## Токены и типографика

| Что | Где |
|-----|-----|
| Цвета, радиусы, тени | `green-pharmacy-web/app/globals.css` |
| Body | Inter — `font-sans` |
| Заголовки, CTA | Evolventa Bold — `font-display`, `public/fonts/evolventa/` |

**Правило:** новые экраны — только токены из `globals.css`; размеры **целые px** (сетка 4/8px).

---

## Каталог `/` (Main / Search / Sort)

| Блок | Компонент / файл |
|------|------------------|
| Layout + header | `client-layout-shell.tsx`, `client-header.tsx` |
| Логотип | `evergreen-logo.tsx` |
| Поиск в хедере | `client-header-search.tsx` |
| Фильтры (dropdown) | `catalog-filters.tsx` — популярное, цена ↑↓, категории |
| Сетка товаров | `catalog-grid.tsx` + `product-card.tsx` |
| Состояния | `catalog-states.tsx` |
| UI-контролы | `filter-pill.tsx`, `filter-checkbox.tsx`, `menu-button.tsx`, `cart-button.tsx` |

**Карточка в сетке:** ~200×252, фото + название + текущая цена + зачёркнутая старая. Без «Подробнее», без бейджа −%, без категории на плитке.

**Навигация хедера (гость и клиент):** профиль, заказы, корзина (текст «Корзина» + иконка); бейджи на корзине/заказах для авторизованного. Без пункта «Каталог» / «Выйти» в хедере (выход — в профиле).

---

## Карточка товара `/products/[productId]` (Card 01)

### Маршрут и композиция

- `app/(client)/products/[productId]/page.tsx`
- Max width контента: `1053px`
- Grid: `346px` (галерея, `row-span-2`) | `ProductInfoColumn` + плашка цены в `pricePanel`

### UI-компоненты

| Блок | Файл | Figma (ref) |
|------|------|-------------|
| Галерея + миниатюры 72×60, hover-стрелки | `product-gallery.tsx` | 628:1353 |
| Chevron 32×32 | `icons/carousel-chevron.tsx` | |
| Заголовок, чипы, описание, отступ 28px | `product-info-column.tsx` | `mt-7` между чипами и описанием |
| Лекарственная форма / состав / … | `product-details-section.tsx` | 317:629 |
| Чипы категорий (≤2, не кликабельны) | `category-chips.tsx` | |
| Рекомендации по 1-й категории | `product-recommended-section.tsx` + `CatalogGrid` | заголовок = имя категории |
| Лайк (заглушка) | `icons/like-icon.tsx`, `public/icons/like.svg` | |

### Вёрстка (итог)

- Описание на всю ширину колонки; плашка цены не раздувает grid (`pricePanel` в колонке).
- Карусель: подложка миниатюр 28×60, стрелки при hover.
- Кнопка «В корзину» — **disabled** до E3.

### Данные (Supabase)

| Функция | Назначение |
|---------|------------|
| `fetchProductDetails` | composition, usage, dosage, manufacturer |
| `fetchProductImages` | галерея |
| `fetchProductCategoryChips` | чипы (≤2 в UI) |
| `fetchRecommendedForCategory` | блок снизу, исключая текущий товар |
| `buildGalleryImages` | `lib/catalog/gallery-images.ts` |

**Важно:** в `fetchProductDetails` не select-ить несуществующие колонки (раньше падало на `main_image_url`).

**Демо:** `docs/seed-card-demo.sql`, `green-pharmacy-web/scripts/seed-demo-data.mjs`

---

## Auth

| Экран | Компоненты |
|-------|------------|
| Registration 01–04 | `registration-flow.tsx`, `phone-mask-input.tsx`, `code-segment-input.tsx` |
| Валидация телефона | `lib/validations/registration.ts` — 10 цифр, «Некорректный ввод» при не-цифрах |

---

## Заглушки (до E3)

| Маршрут | Поведение |
|---------|-----------|
| `/cart` | Функционально для auth; гостю — login card |
| `/orders`, `/profile` | Заглушка + «Войти» для гостя |

---

## Следующий этап — E3

Корзина (`vw_cart_items`), checkout (`vw_pickup_points`), orders, активная «В корзину», оплата-заглушка → `paid`.

**Промпт для нового чата:**

```
@docs/HANDOFF.md @docs/UI_BASELINE.md @docs/screens.md
@.cursor/rules/green-ui-baseline.mdc @.cursor/rules/frontend-principles.mdc
@green-pharmacy-web

UI baseline зафиксирован. Переиспользуй компоненты из UI_BASELINE.md, не дублируй.
Только E3: корзина, checkout, orders. Коммит без просьбы.
```

---

## Иконки (`components/icons/`)

`arrow-down`, `arrow-right`, `box`, `carousel-chevron`, `cart`, `check`, `check-16`, `cross`, `cross-20`, `double-arrow`, `filter`, `like-icon`, `search`, `sort`, `user` — переиспользовать перед добавлением новых.
