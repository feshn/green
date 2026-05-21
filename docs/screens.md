# Экраны Figma (страница Ready)

Файл: [Green — Ready](https://www.figma.com/design/rzkHWJsXsgN36q3P8mrkAA/Green?node-id=2-2)

**29 top-level фреймов** (1440×1024). Шрифты: Evolventa (заголовки/кнопки), Inter (текст). Иконки: Majesticons.

---

## Клиент

| Фрейм | Назначение | Состояния / блоки | Данные |
|-------|------------|-------------------|--------|
| Registration 01 | Вход по телефону | Поле телефона, кнопка | `request_auth_code` |
| Registration 02 | Ввод SMS-кода | 6 цифр, повтор отправки | `verify_user_code` |
| Registration 03 | Неверный код | Как 02 + ошибка | то же |
| Registration 04 | Имя + ОПД | Имя, чекбокс согласия | `users` |
| Main / Search 01 | Каталог | Поиск, бейджи корзина/заказы, сетка карточек | `vw_client_catalog` |
| Main / Search 02 | Каталог (вариант) | Уточнить отличие от 01 при вёрстке | то же |
| Main / Sort 01 | Фильтр/сортировка | Radio: цена ↑↓; checkboxes: категории | фильтр по `categories` |
| Main / Sort 02 | Фильтр (состояние) | Открытая панель сортировки | то же |
| Card 01 | Карточка товара | Крошки, цена, old_price, лайк (заглушка), в корзину, описание, похожие | `product_details`, `vw_similar_products` |
| Card 02 | Карточка (вариант) | Второе состояние (лайк/раскрытие) | то же |
| Checkout 01 | Корзина, гость | Степпер, удаление, блок «войти и оплатить» | `vw_cart_items`, `in_cart` |
| Checkout 02 | Корзина + доставка | Блок Delivery & purchase | `orders`, `vw_pickup_points` |
| Checkout 03 | Checkout | Dropdown города/ПВЗ **открыт** | то же |
| Checkout 04 | Checkout | Поля города/ПВЗ **заполнены** | то же |
| Succes | Успешная оплата | Текст про SMS при доставке | после `paid` |
| Profile | Профиль | Краткая инфо, поддержка (заглушка), выход | `users` |
| Orders | История заказов | Аккордеоны: статус, дата, адрес; внутри товары | `vw_user_order_history` + items |

---

## Персонал

| Фрейм | Назначение | Состояния / блоки | Данные |
|-------|------------|-------------------|--------|
| Login | Вход сотрудников | login + password | Supabase Auth, `employees` |
| Admin / Orders 01 | Таблица заказов | Фильтры статусов, поиск, chip статуса, назначение сбор/доставка, «Отменен» | `vw_admin_orders` |
| Admin / Orders 02 | Заказ выделен | + боковая панель | order + `order_items` |
| Admin / Orders 03 | Детальная панель | ID, клиент, ПВЗ, код выдачи, история, состав | `order_history`, items |
| Admin / Audit | Журнал | Поиск, таблица действий | `vw_admin_audit_history` |
| Admin / Products | Товары | Таблица, панель: доступность, категории, фото, Save | `products`, `product_prices`, images |
| Sortet 01 | Сборщик | Статусы: оплачен, в сборке, завершен; кнопка «Взять» | `vw_picker_orders` |
| Sortet 02 | Сборщик | «Завершить» + боковая панель с составом | items, `assembling`→`packed` |
| Sortet 03 | Сборщик | Завершённые | `packed` |
| Delivery 01 | Курьер | Собран, в пути, готов; без состава | `vw_courier_orders` |
| Delivery 02 | Курьер | Как Sortet 02 | смена `in_transit`→`ready` |
| Delivery 03 | Курьер | Завершённые / готовые | `ready` |

---

## Flow статусов заказа

`in_cart` → `paid` → `assembling` → `packed` → `in_transit` → `ready` → `completed`  
`cancelled` — только админ. Код выдачи при `ready`, SMS (заглушка). Выдача: `complete_order_with_code`.
