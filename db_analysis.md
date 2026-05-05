# Анализ базы данных проекта Florify

> **Вывод**: В схеме 32 таблицы. Все они логически обоснованы и используются. Мёртвых таблиц нет. Единственный вопрос — `recipes`/`recipe_items`.

---

## Полная карта таблиц по модулям

| Модуль | Таблицы |
|--------|---------|
| **Каталог** | `product_categories`, `products` |
| **Аутентификация** | `users`, `user_roles`, `refresh_tokens` |
| **Магазины** | `stores` |
| **Клиенты и лояльность** | `customers`, `loyalty_accounts`, `loyalty_transactions` |
| **Заказы** | `orders`, `order_items` |
| **Инвентарь** | `stock_balances`, `stock_batches`, `stock_transactions` |
| **Поставщики** | `suppliers`, `purchase_invoices`, `purchase_invoice_items` |
| **Сотрудники** | `employees`, `employee_salary_configs`, `employee_timesheet`, `employee_salary_statements` |
| **Доставка** | `delivery_zones`, `delivery_slots`, `delivery_tasks` |
| **Финансы** | `financial_transactions` |
| **Аналитика** | `analytics_order_facts`, `analytics_cost_facts` |
| **Медиа** | `media_files` |
| **Уведомления** | `notification_templates`, `notification_logs` |
| **Рецепты** | `recipes`, `recipe_items` |
| **Платежи** | `payments` |
| **Инфраструктура** | `shedlock` |

---

## Детальный анализ каждой таблицы

### КАТАЛОГ

#### `product_categories`
**Назначение**: Справочник категорий (розы, тюльпаны, букеты и т.д.).
**Статус**: ИСПОЛЬЗУЕТСЯ — `products.category_id` ссылается сюда. Задействована в каталоге и аналитике.
**Поля**: `id`, `name` (уникальное), `description`, `active`, `created_at`, `updated_at`.

#### `products`
**Назначение**: Центральный каталог товаров — каждый цветок, букет, горшечное растение или аксессуар.
**Статус**: ИСПОЛЬЗУЕТСЯ — везде: заказы (`order_items`), инвентарь (`stock_balances`, `stock_batches`), рецепты (`recipe_items.ingredient_id`).
**Поля**: `sku`, `name`, `category_id`, `unit`, `current_price`, `image_url`, `default_shelf_life_days`, `active`, `last_synced_at`.

> **Замечание для диплома**: `last_synced_at` — поле синхронизации цен через Kafka между product-catalog-service и inventory-service. Хороший пример Event-Driven синхронизации.

---

### АУТЕНТИФИКАЦИЯ

#### `users`
**Назначение**: Аккаунты всех пользователей системы — клиентов, флористов, курьеров, администраторов.
**Статус**: ИСПОЛЬЗУЕТСЯ — `user_roles`, `refresh_tokens`, `employees.user_id`, `customers.user_id`.
**Поля**: `email`, `phone`, `password_hash`, `active`.

#### `user_roles`
**Назначение**: Реализация RBAC — один пользователь может иметь несколько ролей (ADMIN, OWNER, FLORIST, COURIER, CASHIER, CUSTOMER).
**Статус**: ИСПОЛЬЗУЕТСЯ — читается в JWT-фильтре при каждом запросе.
**Структура**: Связующая таблица «многие-ко-многим» между `users` и ролями.

#### `refresh_tokens`
**Назначение**: Хранение хэшей refresh-токенов для безопасного обновления JWT.
**Статус**: ИСПОЛЬЗУЕТСЯ — используется в `/api/v1/auth/refresh`.
**Поля**: `token_hash` (уникальный), `expires_at`, `revoked`.

---

### МАГАЗИНЫ

#### `stores`
**Назначение**: Филиалы цветочного магазина. Корневая сущность — почти все операционные таблицы привязаны к конкретному магазину.
**Статус**: ИСПОЛЬЗУЕТСЯ — `orders.store_id`, `employees.store_id`, `stock_balances.store_id`, `purchase_invoices.store_id`, `analytics_order_facts.store_id`.

> Сидовый магазин `00000000-...0001` был корректно убран в миграции V0012 — хорошая эволюция схемы.

---

### КЛИЕНТЫ И ЛОЯЛЬНОСТЬ

#### `customers`
**Назначение**: CRM-профили клиентов. Отличается от `users` — клиент может быть гостем (без аккаунта).
**Статус**: ИСПОЛЬЗУЕТСЯ — `loyalty_accounts.customer_id`, `orders.customer_id`.
**Поля**: `user_id` (nullable — для гостей), `source` (WEB/POS), `tags[]` (GIN-индекс для маркетинга), `birth_date`.

> **Ключевой дизайн-паттерн**: разделение `users` (аутентификация) и `customers` (CRM). Правильное решение — стоит акцентировать в дипломе.

#### `loyalty_accounts`
**Назначение**: Счёт лояльности клиента — баллы, уровень (BRONZE/SILVER/GOLD), итоговые траты.
**Статус**: ИСПОЛЬЗУЕТСЯ — начисление/списание при заказах, личный кабинет.
**Поля**: `tier`, `points_balance`, `reserved_points` (заблокированные при активном заказе), `total_spent`.

#### `loyalty_transactions`
**Назначение**: История операций с баллами — начисление, списание, бонус за день рождения.
**Статус**: ИСПОЛЬЗУЕТСЯ — полный аудит-лог программы лояльности.

---

### ЗАКАЗЫ

#### `orders`
**Назначение**: Центральная операционная сущность. Жизненный цикл: PENDING_STOCK → CONFIRMED → IN_PROGRESS → READY → DELIVERING → COMPLETED / CANCELLED.
**Статус**: ИСПОЛЬЗУЕТСЯ — связана с `order_items`, `delivery_tasks`, `payments`, `loyalty_transactions`, `analytics_order_facts`.
**Поля**: `order_number` (через sequence), `idempotency_key` (защита от дублей), `guest_phone/name`, `delivery_slot_id`, `delivery_zone_id` (не FK — микросервисная архитектура), `current_payment_id`.

#### `order_items`
**Назначение**: Позиции заказа (товар + количество + цена на момент заказа).
**Статус**: ИСПОЛЬЗУЕТСЯ.
**Паттерн**: Снимок данных — `product_name` и `unit_price` сохраняются на момент заказа, защищая от будущих изменений каталога.

---

### ИНВЕНТАРЬ

#### `stock_balances`
**Назначение**: Текущий остаток товара на каждом складе. Обновляется при поступлении и списании.
**Статус**: ИСПОЛЬЗУЕТСЯ — проверка доступности при оформлении заказа.
**Поля**: `quantity_in_stock`, `average_cost` (средневзвешенная себестоимость, WAC-метод).

#### `stock_batches`
**Назначение**: Партии товаров — каждое поступление от поставщика. Трекинг сроков годности.
**Статус**: ИСПОЛЬЗУЕТСЯ — автоматическое списание просроченных партий (MarkBatchesAsExpired), аудит.
**Поля**: `expires_at`, `status` (AVAILABLE/EXPIRED/DEPLETED), `source_document_id`, `supplier_id`.

#### `stock_transactions`
**Назначение**: Лог всех движений товара (IN/OUT/WRITEOFF). Основа инвентарного аудита.
**Статус**: ИСПОЛЬЗУЕТСЯ — audit trail для бухгалтерии.
**Поля**: `type`, `quantity`, `cost_basis`, `total_value`, `write_off_reason`, `source_document_id` (идемпотентность, V0009: `performer_id` стал nullable для системных операций).

---

### ПОСТАВЩИКИ

#### `suppliers`
**Назначение**: Справочник поставщиков.
**Статус**: ИСПОЛЬЗУЕТСЯ — `purchase_invoices.supplier_id`, `analytics_cost_facts.supplier_id`, `stock_batches.supplier_id`.
**Поля**: `tax_id` (уникальный ИНН), `payment_terms`, `rating` (1-5).

#### `purchase_invoices`
**Назначение**: Входящие накладные. После приёмки создаются партии в `stock_batches`.
**Статус**: ИСПОЛЬЗУЕТСЯ — полный цикл приёмки товара.
**Поля**: `supplier_name` (денормализация для истории), `status` (DRAFT→RECEIVED).

#### `purchase_invoice_items`
**Назначение**: Позиции накладной — заказанное vs фактически полученное количество.
**Статус**: ИСПОЛЬЗУЕТСЯ — обрабатывается при приёмке.

---

### СОТРУДНИКИ

#### `employees`
**Назначение**: HR-профили сотрудников (флористы, курьеры, кассиры).
**Статус**: ИСПОЛЬЗУЕТСЯ — связан с зарплатой, табелем, через `user_id` — с аутентификацией.

#### `employee_salary_configs`
**Назначение**: Конфигурация зарплатной схемы (фикс + % от продаж + бонус за заказ). С историей изменений через `valid_from`.
**Статус**: ИСПОЛЬЗУЕТСЯ — база для расчёта ведомостей.

#### `employee_timesheet`
**Назначение**: Табель учёта рабочего времени — чекины, чекауты, часы.
**Статус**: ИСПОЛЬЗУЕТСЯ — основа для расчёта почасовой части зарплаты.

#### `employee_salary_statements`
**Назначение**: Итоговые зарплатные ведомости по периодам (месяцам). Статусы: DRAFT → APPROVED → PAID.
**Статус**: ИСПОЛЬЗУЕТСЯ — финансовая отчётность.

---

### ДОСТАВКА

#### `delivery_zones`
**Назначение**: Географические зоны доставки с ценой и минимальной суммой заказа.
**Статус**: ИСПОЛЬЗУЕТСЯ — `delivery_tasks.zone_id`.
**Поля**: `polygon` (TEXT — GeoJSON/WKT-полигон), `delivery_fee`, `min_order_amount`.

#### `delivery_slots`
**Назначение**: Временные слоты доставки (например, 10:00-12:00 на конкретную дату).
**Статус**: ИСПОЛЬЗУЕТСЯ — `delivery_tasks.slot_id`. При бронировании `current_load` инкрементируется.
**Поля**: `max_capacity`, `current_load` (управление нагрузкой курьеров).

#### `delivery_tasks`
**Назначение**: Задание на доставку, создаётся Event-Driven из order-service при смене статуса.
**Статус**: ИСПОЛЬЗУЕТСЯ — канбан-доска курьера.
**Статусы**: CREATED → ASSIGNED → PICKED_UP → DELIVERED / FAILED.
**Поля**: `latitude`, `longitude` (для карты), `estimated_arrival`, `failure_reason`.

---

### ФИНАНСЫ

#### `financial_transactions`
**Назначение**: Универсальный финансовый журнал — поступления от заказов, возвраты, закупочные расходы.
**Статус**: ИСПОЛЬЗУЕТСЯ — аналитика прибыли/убытков в admin-панели.
**Поля**: `type`, `amount`, `reference_id` (ссылка на заказ/накладную), `performed_by`.

---

### АНАЛИТИКА

#### `analytics_order_facts`
**Назначение**: Денормализованный факт-лог завершённых заказов для быстрой аналитики (Data Warehouse / Fact Table паттерн).
**Статус**: ИСПОЛЬЗУЕТСЯ — дашборды выручки, COGS, gross profit.
**Поля**: `cogs_amount` (себестоимость), `gross_profit`, `order_source`, `item_count`.

> **Паттерн CQRS**: отдельная read-модель для аналитики. Записывается по событию, читается без JOIN к оперативным таблицам.

#### `analytics_cost_facts`
**Назначение**: Лог затрат трёх типов: PURCHASE (закупки), SALARY (зарплаты), WRITEOFF (списания).
**Статус**: ИСПОЛЬЗУЕТСЯ — аналитика расходной части.
**Поля**: Полностью денормализованы — поля поставщика, сотрудника, продукта сохраняются для исторического анализа.

---

### МЕДИА

#### `media_files`
**Назначение**: Метаданные загруженных файлов. Физически файлы в MinIO (S3-совместимое хранилище).
**Статус**: ИСПОЛЬЗУЕТСЯ — загрузка фото цветов.
**Поля**: `bucket`, `base_path`, `status` (PROCESSING/READY/ERROR/DELETED), `uploaded_by`.

---

### УВЕДОМЛЕНИЯ

#### `notification_templates`
**Назначение**: Шаблоны уведомлений (SMS, Email).
**Статус**: ИСПОЛЬЗУЕТСЯ — подтверждение заказов, статус доставки.
**Поля**: `code` (уникальный в рамках канала), `body_template`.

#### `notification_logs`
**Назначение**: Аудит-лог всех отправленных уведомлений.
**Статус**: ИСПОЛЬЗУЕТСЯ — история коммуникаций с клиентом.
**Поля**: `status` (SENT/FAILED), `error_message`.

---

### РЕЦЕПТЫ

#### `recipes` / `recipe_items`
**Назначение**: Bill of Materials — состав букета из отдельных цветов. Теоретически позволяет при заказе букета автоматически списать составляющие.
**Статус**: ⚠️ УСЛОВНО ИСПОЛЬЗУЕТСЯ.

**Важное замечание**: Структура таблиц правильная. Но нужно проверить, реализована ли бизнес-логика декомпозиции в inventory-service при списании. Если при обработке заказа система не смотрит в `recipes` — таблица существует, но в production-потоке не задействована.

**Рекомендация для диплома**: укажи либо что это реализованная функция (если логика есть), либо задел на будущее развитие системы.

---

### ПЛАТЕЖИ

#### `payments`
**Назначение**: Платёжные транзакции (интеграция с платёжным шлюзом — ЮKassa/SBP по QR).
**Статус**: ИСПОЛЬЗУЕТСЯ — `orders.current_payment_id`, QR-коды, webhook-подтверждение.
**Поля**: `external_id` (ID в платёжной системе), `confirmation_url`, `qr_code_data`, `status`.

---

### ИНФРАСТРУКТУРА

#### `shedlock`
**Назначение**: Распределённая блокировка для предотвращения параллельного запуска scheduled задач (MarkBatchesAsExpired и др.) на нескольких инстансах.
**Статус**: ИСПОЛЬЗУЕТСЯ — обязательна для production-grade планировщиков.

---

## Итоговая оценка

**Мёртвых таблиц нет.** Все 32 таблицы логически обоснованы.

Единственный вопрос — `recipes`/`recipe_items`. Нужно либо:
- Убедиться, что логика декомпозиции реализована в inventory-service
- Или явно упомянуть в дипломе как «планируемая функциональность»

---

## Архитектурные паттерны (для диплома)

| Паттерн | Где применяется |
|---------|----------------|
| **Hexagonal Architecture** | Каждый сервис: ports & adapters |
| **CQRS / Read Model** | `analytics_order_facts`, `analytics_cost_facts` |
| **Event-Driven Architecture** | Kafka-события между всеми сервисами |
| **Idempotency** | `idempotency_key` в orders, `source_document_id` в stock_transactions |
| **WAC-метод** | `stock_balances.average_cost` — средневзвешенная себестоимость |
| **Audit Trail** | `stock_transactions`, `loyalty_transactions`, `notification_logs`, `financial_transactions` |
| **Soft Delete** | Флаг `active` в `products`, `customers`, `employees`, `stores` |
| **Snapshot / Денормализация** | `product_name` в `order_items`, `supplier_name` в `purchase_invoices` |
| **RBAC** | `user_roles` — роли через связующую таблицу |

---

## Схема связей (высокий уровень)

```
stores
 ├── orders ──── order_items ──── products ──── product_categories
 │    ├── delivery_tasks ──── delivery_slots
 │    │                  └── delivery_zones
 │    ├── payments
 │    └── customers ──── loyalty_accounts ──── loyalty_transactions
 ├── employees ──── employee_salary_configs
 │             ├── employee_timesheet
 │             └── employee_salary_statements
 ├── stock_balances ──── products
 ├── stock_batches  ──── products
 │                  └── suppliers ← purchase_invoices ── purchase_invoice_items
 ├── stock_transactions
 └── analytics_order_facts
     analytics_cost_facts

users ──── user_roles
     ├──── refresh_tokens
     ├──── customers (user_id nullable)
     └──── employees

media_files
notification_templates ──── notification_logs
financial_transactions
shedlock
recipes ──── recipe_items
```
