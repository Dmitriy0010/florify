# Florify Admin Panel — Детальный план интеграции Frontend ↔ Backend

> **Версия:** 1.0 · **Автор:** LLM-анализ кодовой базы  
> **Стек:** React (admin app) · Spring Boot Microservices · Hexagonal Architecture · Kafka · JWT  
> **Главная задача:** последовательно подключить каждый раздел админки к реальным бэкенд-сервисам, верифицируя сквозные цепочки на каждом этапе.

---

## 🗺️ Карта сервисов и эндпоинтов

| Сервис | Base URL | Ключевые ресурсы |
|---|---|---|
| `auth-service` | `/api/v1/auth` | `/login`, `/register`, `/refresh`, `/logout` |
| `product-catalog-service` | `/api/v1/products`, `/api/v1/categories` | CRUD продуктов и категорий |
| `inventory-service` | `/api/v1/inventory` | `/balance/all`, `/balance/{productId}`, `/receive`, `/write-off` |
| `supplier-service` | `/api/v1/suppliers`, `/api/v1/invoices` | CRUD поставщиков, жизненный цикл накладных |
| `order-service` | `/api/v1/orders` | CRUD, смена статуса заказов |
| `customer-service` | `/api/v1/customers` | CRUD клиентов |
| `employee-service` | `/api/v1/employees`, `/api/v1/salary`, `/api/v1/timesheet` | Сотрудники, табели, зарплата |
| `finance-service` | `/api/v1/finance` | `/pnl`, `/transactions` |
| `analytics-service` | `/api/v1/analytics` | `/dashboard`, `/sales`, `/products/top`, `/inventory/stats`, `/employees/performance`, `/customers`, `/export` |
| `delivery-service` | `/api/v1/delivery` | Управление доставками |
| `store-service` | `/api/v1/stores` | CRUD магазинов |
| `media-service` | `/api/v1/media` | Загрузка изображений |

## 🔐 Роли в системе

```
OWNER           — полный доступ ко всему
ADMIN           — управление магазином, аналитика, сотрудники
SUPPLIER_MANAGER— поставщики, закупки, склад (приём)
FLORIST         — склад (просмотр + списание), заказы
CASHIER         — заказы, склад (только просмотр)
CUSTOMER        — (не должна появляться в admin-панели)
```

## ⚡ Kafka-цепочки (критично для понимания сквозных сценариев)

```
1. Накладная получена (supplier-service)
   → invoice.received →
        inventory-service: ReceiveStock (увеличивает StockBalance)
        finance-service:   InvoiceReceivedEventConsumer (записывает EXPENSE транзакцию)
        analytics-service: RecordPurchaseFact (PurchaseFact в аналитику)

2. Заказ подтверждён (order-service)
   → order.confirmed →
        inventory-service: InventoryOrderConfirmedConsumer (резервирует товар)

3. Заказ завершён (order-service)
   → order.completed →
        inventory-service: OrderCompletedEventConsumer (списывает резерв со склада)
        → stock.written-off →
              analytics-service: RecordWriteoffFact (WriteoffFact)
              finance-service:   StockWrittenOffEventConsumer
        analytics-service: RecordOrderFact + ApplyCogs (OrderFact с выручкой и себестоимостью)
        finance-service:   FinanceOrderCompletedConsumer (записывает INCOME транзакцию)

4. Зарплата выплачена (employee-service)
   → salary.paid →
        finance-service:   SalaryPaidEventConsumer (записывает SALARY транзакцию)
        analytics-service: RecordSalaryFact (SalaryFact в аналитику)

5. Товар просрочен (scheduler inventory-service, ExpiryCheckScheduler)
   → stock.expired →
        analytics-service: RecordWriteoffFact (WriteoffReason.EXPIRED)
```

---

## ФАЗА 0 — Фундамент: API-клиент, авторизация, layout, роутинг

> **Цель:** У всех последующих фаз есть надёжная основа для HTTP-запросов, токены живут и обновляются корректно, навигация защищена ролями.

### 0.1 Настройка HTTP-клиента (`src/lib/api/`)

**Что делать:**
- Создать базовый Axios-инстанс (или `fetch`-обёртку) с `baseURL` из env-переменной (`VITE_API_URL`)
- Настроить request-interceptor: прикрепляет `Authorization: Bearer <accessToken>` из store/localStorage к каждому запросу
- Настроить response-interceptor:
  - При `401 Unauthorized` → запускает silent refresh (`POST /api/v1/auth/refresh` с `refreshToken`)
  - При успешном обновлении → повторяет исходный запрос с новым `accessToken`
  - При неудачном refresh (`401` снова) → разлогинивает пользователя, редиректит на `/login`
- Настроить глобальный обработчик `403 Forbidden` → toast «Недостаточно прав»
- Настроить глобальный обработчик `500` → toast «Ошибка сервера»
- Настроить централизованный тип `ApiError` совместимый с форматом Spring Boot `ProblemDetail`

**Файлы:** `src/lib/api/client.ts`, `src/lib/api/interceptors.ts`, `src/lib/api/types.ts`

**Схема токенов (из кода `auth-service`):**
```
POST /api/v1/auth/login        → { accessToken, refreshToken, expiresAt, userId, roles }
POST /api/v1/auth/refresh      → { accessToken, refreshToken, expiresAt, userId, roles }
POST /api/v1/auth/logout       → 204 No Content
  body: { accessToken, refreshToken }
  (бэкенд блэклистит accessToken в Redis, ревокует refreshToken в БД)
```

**Хранение токенов:**
- `accessToken` → Zustand store (in-memory, НЕ localStorage — короткоживущий)
- `refreshToken` → httpOnly cookie или localStorage (обсудить с командой)
- `roles[]`, `userId` → Zustand store (authStore)

### 0.2 Auth Store (`src/store/authStore.ts`)

```typescript
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  roles: Role[]
  isAuthenticated: boolean
  login(credentials): Promise<void>
  logout(): Promise<void>
  refresh(): Promise<void>
  hasRole(role: Role): boolean
  hasAnyRole(roles: Role[]): boolean
}
```

### 0.3 Страница логина (`src/pages/auth/LoginPage`)

**Что делать:**
- Форма: email + password → `POST /api/v1/auth/login`
- При успехе → сохранить токены в store → redirect на `/dashboard`
- При `401` → показать «Неверный email или пароль»
- При `403` → показать «Аккаунт заблокирован»

**Проверить:**
- [ ] Успешный логин с ролью `ADMIN` → попадаем в дэшборд
- [ ] Неверный пароль → ошибка
- [ ] Через 15 мин (после истечения access token) → silent refresh отрабатывает, пользователь остаётся в системе
- [ ] `POST /api/v1/auth/logout` → оба токена аннулированы, редирект на `/login`

### 0.4 Защищённые маршруты (`ProtectedRoute`)

```typescript
// Компонент-обёртка
<ProtectedRoute requiredRoles={['OWNER', 'ADMIN']}>
  <AnalyticsPage />
</ProtectedRoute>
```

- Если не аутентифицирован → redirect `/login`
- Если нет нужной роли → redirect `/forbidden` (403-страница)

### 0.5 Layout (`src/components/layout/`)

**Что делать:**
- Sidebar с навигацией (скрывать пункты которые недоступны по роли)
- Header с именем пользователя (подгружается из `userId` через `/api/v1/employees/{id}` или из JWT-claims)
- `StoreSelector` — если у пользователя доступ к нескольким магазинам → выбор активного `storeId` (хранится в `appStore`, прокидывается в запросы где нужен `?storeId=`)

**Пункты sidebar по ролям:**

| Пункт | Роли |
|---|---|
| 📊 Дэшборд | OWNER, ADMIN |
| 📦 Каталог | OWNER, ADMIN |
| 🏭 Склад | OWNER, ADMIN, FLORIST, SUPPLIER_MANAGER, CASHIER |
| 🚚 Поставщики | OWNER, ADMIN, SUPPLIER_MANAGER |
| 🛒 Заказы | OWNER, ADMIN, FLORIST, CASHIER |
| 👥 Клиенты | OWNER, ADMIN |
| 👨‍💼 Сотрудники | OWNER, ADMIN |
| 🏪 Магазины | OWNER |
| 💰 Финансы | OWNER, ADMIN |
| 📈 Аналитика | OWNER, ADMIN |
| 🚴 Доставка | OWNER, ADMIN |

**Проверить по завершении фазы:**
- [ ] Логин работает корректно
- [ ] Refresh token работает (DevTools → Network → захватить истечение)
- [ ] Logout аннулирует сессию
- [ ] Sidebar скрывает/показывает пункты корректно по роли
- [ ] Компонент `ProtectedRoute` работает

---

## ФАЗА 1 — Каталог товаров (product-catalog-service)

> **Цель:** Полноценный CRUD товаров и категорий в UI. Это основа всего — без товаров нет склада, поставок, заказов.

### 1.1 API-слой

```typescript
// src/lib/api/catalog.ts
export const catalogApi = {
  getCategories():                    GET  /api/v1/categories
  createCategory(data):               POST /api/v1/categories
  getProducts(params):                GET  /api/v1/products?page&size&categoryId&search&active
  getProduct(id):                     GET  /api/v1/products/{id}
  createProduct(data):                POST /api/v1/products
  updateProduct(id, data):            PUT  /api/v1/products/{id}
  deactivateProduct(id):              POST /api/v1/products/{id}/deactivate
  uploadProductImage(productId, file): POST /api/v1/media/upload (multipart)
}
```

### 1.2 Страница списка товаров (`src/pages/catalog` или компонент `src/components/catalog/`)

**Функционал:**
- Таблица/грид с пагинацией (page, size)
- Поиск по названию (`?search=`)
- Фильтр по категории (`?categoryId=`)
- Фильтр активные/неактивные (`?active=`)
- Колонки: фото, название, категория, цена, единица измерения, статус (активен/нет), действия
- Кнопка «Добавить товар» → открывает модалку/форму

**Форма создания/редактирования товара:**
- Поля из `ProductController`: name, description, price, unit, categoryId, active
- Загрузка изображения → `POST /api/v1/media/upload` → получить URL → сохранить в продукт
- Валидация на фронте + показ backend-ошибок (409 Conflict — «Товар с таким именем уже есть»)

### 1.3 Страница категорий

- Список категорий (дерево или плоский список)
- CRUD категорий
- Нельзя удалить категорию с привязанными товарами (бэкенд вернёт 409)

### 1.4 Верификация фазы

- [ ] Создать категорию «Розы»
- [ ] Создать товар «Роза красная» в категории «Розы», загрузить фото
- [ ] Обновить цену → изменения видны в списке
- [ ] Деактивировать товар → он не появляется при `?active=true`
- [ ] Проверить что деактивированный товар не принимается складом (бэкенд вернёт `InactiveProductException`)

---

## ФАЗА 2 — Поставщики + Закупочные накладные (supplier-service)

> **Цель:** Полный цикл работы с поставщиками. После RECEIVED-накладной — остатки на складе должны вырасти автоматически через Kafka.

### 2.1 API-слой поставщиков

```typescript
// src/lib/api/suppliers.ts
export const suppliersApi = {
  list(params):           GET  /api/v1/suppliers?search&active&page&size
  get(id):                GET  /api/v1/suppliers/{id}
  create(data):           POST /api/v1/suppliers        (SUPPLIER_MANAGER, ADMIN, OWNER)
  update(id, data):       PUT  /api/v1/suppliers/{id}   (SUPPLIER_MANAGER, ADMIN, OWNER)
  deactivate(id):         POST /api/v1/suppliers/{id}/deactivate (ADMIN, OWNER)

  // Накладные
  listInvoices(params):          GET  /api/v1/invoices?supplierId&status&page&size
  getInvoice(id):                GET  /api/v1/invoices/{id}
  createInvoice(data):           POST /api/v1/invoices
  submitInvoice(id):             POST /api/v1/invoices/{id}/submit
  receiveInvoice(id, items):     POST /api/v1/invoices/{id}/receive
  partialReceiveInvoice(id):     POST /api/v1/invoices/{id}/partial-receive
  completePartialReceipt(id):    POST /api/v1/invoices/{id}/complete-partial-receipt
  cancelInvoice(id):             POST /api/v1/invoices/{id}/cancel
}
```

### 2.2 Страница поставщиков

**Список поставщиков:**
- Таблица: название, контактное лицо, телефон, email, условия оплаты (`PaymentTerms`: PREPAID/NET_7/NET_14/NET_30), рейтинг ⭐, статус
- Поиск + фильтр active/inactive
- Открыть карточку поставщика

**Форма поставщика:**
- Поля из `Supplier`: name, contactPerson, phone, email, address, taxId, paymentTerms, rating (1-5), notes

### 2.3 Страница накладных (закупки)

**Список накладных:**
- Колонки: номер, поставщик, магазин, статус, сумма, дата плановой поставки, дата получения
- Фильтры по статусу: `DRAFT | SUBMITTED | PARTIALLY_RECEIVED | RECEIVED | CANCELLED`
- Цветовая индикация статуса

**Жизненный цикл накладной (state machine на UI):**

```
DRAFT ──────────────────────► SUBMITTED ──────────────► RECEIVED
  │                              │                         (final)
  │                              ├──────────────────► PARTIALLY_RECEIVED
  │                              │                         │
  └──────► CANCELLED             └──► CANCELLED            └──► RECEIVED (через completePartialReceipt)
           (final)               (final)                   (final)
```

**Форма создания накладной (DRAFT):**
- Выбор поставщика (autocomplete из `/api/v1/suppliers`)
- Выбор магазина (autocomplete из `/api/v1/stores`)
- Дата плановой поставки
- Позиции (items):
  - Выбор товара из каталога (autocomplete из `/api/v1/products`)
  - Заказанное количество (`orderedQuantity`)
  - Цена за единицу (`unitPrice`)
  - Дата срока годности (`expiresAt`) — важно для batch-управления на складе
  - Расчёт `totalAmount` автоматически на фронте
- Комментарий

**Форма получения накладной (RECEIVED / PARTIALLY_RECEIVED):**
- Показываем каждую позицию с `orderedQuantity`
- Для каждой позиции вводим `receivedQuantity` (может быть ≤ orderedQuantity)
- Если все `receivedQuantity >= orderedQuantity` → кнопка «Принять полностью» → `POST /invoices/{id}/receive`
- Если хоть одна позиция не полная → кнопка «Принять частично» → `POST /invoices/{id}/partial-receive`
- При `PARTIALLY_RECEIVED` показываем кнопку «Завершить приёмку» → `POST /invoices/{id}/complete-partial-receipt`

### 2.4 Kafka-верификация (самый важный момент фазы)

После `POST /invoices/{id}/receive`:
1. `supplier-service` публикует событие `invoice.received` в Kafka
2. `inventory-service` слушает → создаёт `StockBatch`, увеличивает `StockBalance`
3. `finance-service` слушает → записывает `FinancialTransaction` типа `PURCHASE`
4. `analytics-service` слушает → сохраняет `PurchaseFact`

**Проверить:**
- [ ] Создать накладную → статус `DRAFT`
- [ ] Нажать «Подтвердить» → статус `SUBMITTED`
- [ ] Нажать «Принять товар», ввести реальные количества → статус `RECEIVED`
- [ ] Перейти на страницу Склада → проверить что остаток по товару вырос (фаза 3)
- [ ] Перейти в Финансы → проверить что появилась транзакция типа `PURCHASE`
- [ ] Частичный приём: одну позицию принять не полностью → `PARTIALLY_RECEIVED` → затем «Завершить»

---

## ФАЗА 3 — Склад: остатки, инвентаризация, списание (inventory-service)

> **Цель:** Полный контроль склада. Проверяем что приходы из фазы 2 видны на складе, списания корректно уменьшают остатки и уходят в аналитику.

### 3.1 API-слой склада

```typescript
// src/lib/api/inventory.ts
export const inventoryApi = {
  // EnhancedStockBalanceResponse — обогащённый: productName, category, quantity, wac, batches
  getAllBalances(storeId?):         GET /api/v1/inventory/balance/all?storeId=
  getBalance(productId, storeId?): GET /api/v1/inventory/balance/{productId}?storeId=

  // ReceiveStockRequest: storeId, productId, quantity, unitCost, expiresAt, invoiceId?
  receiveStock(data):              POST /api/v1/inventory/receive  (OWNER, ADMIN, SUPPLIER_MANAGER)

  // WriteOffRequest: storeId, productId, quantity, reason, comment
  writeOffStock(data):             POST /api/v1/inventory/write-off (OWNER, ADMIN, FLORIST)
}
```

**Причины списания (`WriteOffReason`):**
- `DAMAGE` — повреждение
- `EXPIRY` — истёк срок годности (также происходит автоматически через `ExpiryCheckScheduler`)
- `THEFT` — кража
- `QUALITY` — несоответствие качеству
- `OTHER` — иное

### 3.2 Страница склада — Остатки (`src/pages/inventory/`)

**Таблица остатков:**
- Колонки: товар, категория, текущий остаток (quantity), единица измерения, средневзвешенная стоимость (WAC), партии (batches)
- Выбор магазина через `StoreSelector` (если несколько магазинов)
- Поиск по названию товара
- Цветовая индикация: красный если `quantity = 0`, жёлтый если `quantity < threshold`
- Expandable row → показываем батчи (StockBatch): количество, дата срока годности, статус (`ACTIVE / EXPIRED / DEPLETED`)

**Действия по строке:**
- 📥 «Принять» → открывает форму ручного прихода (ReceiveStock) без накладной — для кейсов вне закупки
- 📤 «Списать» → открывает форму списания

### 3.3 Форма ручного прихода (`ReceiveStockModal`)

```
Товар:           [автовыбор из каталога]
Количество:      [number]
Себестоимость:   [BigDecimal — unitCost]
Срок годности:   [date picker]
Магазин:         [автовыбор из stores]
```

→ `POST /api/v1/inventory/receive`

### 3.4 Форма списания (`WriteOffModal`)

```
Товар:       [автовыбор | предзаполнен если открыт из строки]
Количество:  [number, max = текущий остаток]
Причина:     [select: DAMAGE | EXPIRY | THEFT | QUALITY | OTHER]
Комментарий: [textarea]
Магазин:     [автовыбор]
```

→ `POST /api/v1/inventory/write-off`

После успешного списания бэкенд публикует `stock.written-off` → analytics записывает `WriteoffFact`.

### 3.5 Инвентаризация (комплексная проверка)

> Инвентаризация — это ручная сверка физического остатка с учётным. Реализуется как пакетное сравнение + корректировка.

**Страница инвентаризации (`InventoryAuditPage`):**

1. **Начало инвентаризации** — загрузить текущие остатки (`GET /api/v1/inventory/balance/all`)
2. **Отображение таблицы** — для каждой позиции показать:
   - Учётный остаток (из бэкенда)
   - Поле для ввода фактического остатка
   - Расхождение (вычисляется на фронте: `actual - system`)
3. **Применение корректировок:**
   - Если `actual < system` (недостача) → `POST /api/v1/inventory/write-off` с `reason=OTHER`, quantity = abs(расхождение), comment = «Инвентаризация»
   - Если `actual > system` (излишек) → `POST /api/v1/inventory/receive` с unitCost из WAC, quantity = расхождение
   - Позиции без расхождения → пропускаем
4. **Результат инвентаризации** — показать итоговый отчёт: сколько позиций в норме / с недостачей / с излишком, суммарная стоимость корректировок

**Верификация инвентаризации:**
- [ ] Завести на склад 100 роз через накладную (фаза 2)
- [ ] На странице инвентаризации ввести фактический остаток = 95
- [ ] Применить → система создаёт write-off на 5 штук
- [ ] Проверить что остаток стал 95
- [ ] Перейти в Аналитика → Склад → убедиться что WriteoffFact записан (фаза 6)

### 3.6 Просроченные батчи (автоматика)

- Scheduler `ExpiryCheckScheduler` (бэкенд) автоматически помечает просроченные батчи в статус `EXPIRED` и публикует `stock.expired`
- На фронте: показывать в таблице остатков батчи с `status=EXPIRED` красным цветом
- Кнопка «Списать просроченные» для конкретной позиции

**Верификация:**
- [ ] Создать батч с `expiresAt = вчера` через накладную
- [ ] Проверить что scheduler его пометил `EXPIRED` (можно вручную триггернуть или подождать)
- [ ] Убедиться что `WriteoffFact` попал в аналитику с `reason=EXPIRED`

---

## ФАЗА 4 — Заказы (order-service)

> **Цель:** Менеджер видит все заказы, может менять их статус. При завершении заказа — склад автоматически списывает товар через Kafka.

### 4.1 API-слой заказов

```typescript
// src/lib/api/orders.ts
export const ordersApi = {
  list(params):             GET  /api/v1/orders?status&storeId&from&to&page&size
  get(id):                  GET  /api/v1/orders/{id}
  createOrder(data):        POST /api/v1/orders             (POS-режим, если нужен)
  confirmOrder(id):         POST /api/v1/orders/{id}/confirm
  completeOrder(id):        POST /api/v1/orders/{id}/complete
  cancelOrder(id):          POST /api/v1/orders/{id}/cancel
  assignEmployee(id, emp):  POST /api/v1/orders/{id}/assign
}
```

### 4.2 Страница списка заказов

**Таблица:**
- Колонки: номер, клиент, источник (OrderSource: ONLINE/POS/PHONE), статус, сумма, кол-во позиций, флорист, дата
- Цветовая индикация статуса (NEW / CONFIRMED / IN_PROGRESS / COMPLETED / CANCELLED)
- Фильтры: статус, магазин, диапазон дат, поиск по клиенту

**Быстрые действия прямо в списке:**
- Подтвердить → `POST /confirm` (только для NEW)
- Отменить → `POST /cancel`

### 4.3 Страница детали заказа

**Информация:**
- Данные клиента (имя, телефон, email)
- Позиции заказа: товар, количество, цена, сумма
- Итоговая сумма
- Источник заказа
- Назначенный сотрудник
- История изменений статуса

**Действия:**
- Назначить флориста → `POST /assign` (выбор из списка сотрудников с ролью FLORIST)
- Подтвердить → Confirmed → бэкенд резервирует товар на складе (через Kafka `order.confirmed`)
- Завершить → Completed → бэкенд списывает товар (через Kafka `order.completed` → `stock.written-off`)
- Отменить → Cancelled → бэкенд освобождает резерв

### 4.4 POS-режим (Point of Sale) — `src/components/pos/`

> Компонент уже существует в структуре, нужно подключить к API

**Функционал:**
- Поиск товаров из каталога + отображение текущего остатка на складе
- Корзина с позициями
- Выбор клиента (опционально, может быть анонимный)
- Оформление заказа → `POST /api/v1/orders` с `orderSource: POS`

### 4.5 Верификация Kafka-цепочки

- [ ] Создать заказ с 3 розами
- [ ] Подтвердить → проверить остаток на складе (должен быть зарезервирован)
- [ ] Завершить → проверить что остаток уменьшился на 3
- [ ] Перейти в Финансы → убедиться что появилась INCOME транзакция
- [ ] Перейти в Аналитику → убедиться что OrderFact записан с корректной выручкой

---

## ФАЗА 5 — Сотрудники, табели, зарплата (employee-service)

> **Цель:** HR-модуль. При выплате зарплаты — событие уходит в финансы и аналитику автоматически.

### 5.1 API-слой сотрудников

```typescript
// src/lib/api/employees.ts
export const employeesApi = {
  list(params):               GET  /api/v1/employees?page&size&storeId&role
  get(id):                    GET  /api/v1/employees/{id}
  create(data):               POST /api/v1/employees    (OWNER, ADMIN)
  update(id, data):           PUT  /api/v1/employees/{id}

  // Зарплата
  getSalaryConfig(empId):     GET  /api/v1/employees/{id}/salary-config
  upsertSalaryConfig(empId):  PUT  /api/v1/employees/{id}/salary-config
  getSalaryStatement(empId):  GET  /api/v1/employees/{id}/salary-statement?month=
  calculateSalary(empId):     POST /api/v1/employees/{id}/salary/calculate
  paySalary(empId):           POST /api/v1/employees/{id}/salary/pay

  // Табель
  getTimesheet(empId, month):     GET  /api/v1/timesheet/{empId}?month=
  clockIn(empId):                 POST /api/v1/timesheet/{empId}/clock-in
  clockOut(empId):                POST /api/v1/timesheet/{empId}/clock-out
  approveTimesheet(empId, month): POST /api/v1/timesheet/{empId}/approve
}
```

### 5.2 Страница сотрудников

**Список сотрудников:**
- Таблица: фото, ФИО, роль, магазин, телефон, email, статус
- Фильтры: роль, магазин, активные/неактивные

**Форма создания/редактирования сотрудника:**
- Поля из `CreateEmployeeRequest`: firstName, lastName, phone, email, role, storeId, hireDate
- При создании — бэкенд создаёт user account с временным паролем (или отправляет invite через notification-service)

### 5.3 Карточка сотрудника

**Вкладки:**
1. **Профиль** — личные данные, контакты, роль, магазин
2. **Зарплата** — конфигурация (`SalaryConfig`: тип: фиксированная/процент от продаж), текущий месяц
3. **Табель** — календарь с отметками прихода/ухода (`TimesheetEntry`)

### 5.4 Страница зарплаты

**Страница расчёта зарплат за месяц:**
- Выбор месяца
- Таблица: сотрудник, отработанные часы, базовая ставка, продажи, начислено
- Кнопка «Рассчитать» → `POST /salary/calculate` для каждого (или batch)
- Кнопка «Выплатить» → `POST /salary/pay`

**После выплаты:**
- `employee-service` публикует `salary.paid` → Kafka
- `finance-service` записывает `SALARY` транзакцию
- `analytics-service` записывает `SalaryFact`

### 5.5 Верификация

- [ ] Создать сотрудника «Иван Флорист» с ролью FLORIST
- [ ] Внести табель за текущий месяц (clock-in/out за несколько дней)
- [ ] Настроить зарплатную конфигурацию: фиксированная 50 000 руб/мес
- [ ] Рассчитать зарплату → проверить корректность суммы
- [ ] Выплатить → проверить в Финансах транзакцию `SALARY`
- [ ] Проверить в Аналитике раздел «Сотрудники» → данные об эффективности (фаза 6)

---

## ФАЗА 6 — Аналитика и Финансы (analytics-service + finance-service)

> **Цель:** Главный раздел для владельца бизнеса. Все данные должны корректно агрегироваться из фактических событий. Это финальная проверка сквозных Kafka-цепочек.

### 6.1 API-слой аналитики

```typescript
// src/lib/api/analytics.ts
export const analyticsApi = {
  // GET /api/v1/analytics/dashboard?storeId=&from=&to= (ISO 8601)
  getDashboard(storeId?, from, to): DashboardResult

  // GET /api/v1/analytics/sales?from=&to=&groupBy= (DAY|WEEK|MONTH)
  getSalesReport(from, to, groupBy): SalesReportResult

  // GET /api/v1/analytics/products/top?from=&to=&limit=
  getTopProducts(from, to, limit): TopProductsResult

  // GET /api/v1/analytics/inventory/stats
  getInventoryStats(): InventoryStatsResult  // текущий месяц

  // GET /api/v1/analytics/employees/performance?from=&to=
  getEmployeePerformance(from, to): EmployeePerformanceResult

  // GET /api/v1/analytics/customers
  getCustomerStats(): CustomerStatsResult  // текущий месяц

  // GET /api/v1/analytics/export?report=SALES|INVENTORY|SALARY&from=&to=
  // Возвращает blob (Excel .xlsx)
  exportReport(reportType, from, to): Blob
}

// src/lib/api/finance.ts
export const financeApi = {
  // GET /api/v1/finance/pnl?from=&to= (LocalDate)
  getPnlReport(from, to): PnlReportResponse  // revenue, cogs, grossProfit, operatingExpenses, writeOffLosses, netProfit

  // GET /api/v1/finance/transactions?page=&size=
  getTransactions(page, size): Page<TransactionResponse>
}
```

### 6.2 Страница Dashboard (`src/pages/` → `DashboardPage`, компоненты в `src/components/dashboard/`)

**Шапка с фильтрами:**
- Выбор магазина (если несколько)
- Выбор диапазона дат (date range picker, дефолт: последние 30 дней)
- Кнопка «Обновить» → re-fetch `DashboardResult`

**KPI-карточки (из `DashboardResult`):**

| Карточка | Поле |
|---|---|
| 💰 Выручка | `revenue` |
| 📦 Заказов | `ordersCount` |
| 🛒 Средний чек | `avgOrderValue` |
| 👥 Новых клиентов | `newCustomers` |
| ❌ Отменено | `cancelledOrders` |
| 📉 Списаний | `writeoffLosses` |

**Графики:**
- Линейный/столбчатый: выручка по дням (данные из `SalesReportResult` с `groupBy=DAY`)
- Топ-5 товаров за период (горизонтальный bar chart из `TopProductsResult`)
- Распределение заказов по источникам (pie chart: ONLINE/POS/PHONE)

### 6.3 Страница Отчёт по продажам

- DateRange picker + `groupBy` (день/неделя/месяц)
- Таблица с периодами: период | выручка | количество заказов | средний чек
- График: линия выручки
- Кнопка «Скачать Excel» → `GET /api/v1/analytics/export?report=SALES&from=&to=` → `blob` download

### 6.4 Страница Топ товаров

- Фильтр: период + лимит (10/20/50)
- Таблица: позиция, товар, категория, продано штук, сумма
- Bar chart

### 6.5 Страница Склад (аналитика)

- `GetInventoryStatsUseCase` → данные за текущий месяц
- KPI: общее количество списаний, стоимость списаний, по причинам (DAMAGE/EXPIRY/THEFT и т.д.)
- Таблица: топ товаров по объёму списаний

### 6.6 Страница Аналитика сотрудников

- Date range picker
- `GetEmployeePerformanceUseCase` → таблица: сотрудник, заказов выполнено, выручка от их заказов, зарплата, рентабельность

### 6.7 Страница Аналитика клиентов

- `GetCustomerStatsUseCase` → метрики: новых клиентов за месяц, повторных покупателей, средний LTV и т.д.

### 6.8 Страница Финансы (P&L)

**PnL Report:**
- DateRange picker (from/to как `LocalDate`, т.к. `/api/v1/finance/pnl` принимает `LocalDate`)
- Таблица отчёта о прибылях и убытках:

```
Выручка (Revenue)           +XXX 000 ₽
Себестоимость (COGS)        -YYY 000 ₽
─────────────────────────────────────
Валовая прибыль (GrossProfit)  ZZZ 000 ₽
Операционные расходы           -MMM 000 ₽  (зарплаты)
Убытки от списаний             -NNN 000 ₽  (write-offs)
─────────────────────────────────────
Чистая прибыль (NetProfit)      PPP 000 ₽
```

- Цветовая индикация: зелёный если прибыль > 0, красный если убыток

**История транзакций:**
- Пагинированная таблица из `/api/v1/finance/transactions`
- Колонки: дата, тип (`INCOME/EXPENSE/SALARY/WRITEOFF`), сумма, описание
- Фильтр по типу транзакции

### 6.9 Экспорт отчётов

**Компонент `ExportButton`:**
```typescript
const blob = await analyticsApi.exportReport('SALES', from, to)
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `sales-report-${from}-${to}.xlsx`
a.click()
```

Доступные типы экспорта (`ReportType` из бэкенда):
- `SALES` — отчёт по продажам
- `INVENTORY` — отчёт по складу
- `SALARY` — отчёт по зарплатам

### 6.10 Верификация сквозной цепочки (главный тест всей системы)

**Сценарий: «Полный день магазина»**

- [ ] **Утро:** Поступила накладная → принята → остаток вырос → `PurchaseFact` записан
- [ ] **День:** 5 заказов через POS, 2 онлайн → завершены → склад списан → `OrderFact` × 7 записано
- [ ] **Вечер:** Флорист списал 10 штук повреждённых роз → `WriteoffFact` (DAMAGE) записан
- [ ] **Scheduler:** Просроченный батч → авто-списание → `WriteoffFact` (EXPIRY) записан
- [ ] **Зарплата:** Выплачена флористу → `SalaryFact` записан
- [ ] **Дэшборд:** KPI-карточки отображают корректные значения за сегодня
- [ ] **PnL:** Revenue = сумма выручки по заказам, COGS = себестоимость, writeOffLosses = стоимость списаний, operatingExpenses = выплаченная зарплата
- [ ] **Аналитика склада:** Видны WriteoffFact с разбивкой по причинам
- [ ] **Аналитика сотрудников:** Флорист показан с его заказами и зарплатой
- [ ] **Экспорт:** Скачать Excel по продажам → файл открывается корректно

---

## ФАЗА 7 — Клиенты (customer-service)

> **Цель:** CRM-раздел. Просмотр клиентской базы, история покупок.

### 7.1 API-слой клиентов

```typescript
// src/lib/api/customers.ts
export const customersApi = {
  list(params):       GET  /api/v1/customers?search&page&size&sortBy
  get(id):            GET  /api/v1/customers/{id}
  getOrders(id):      GET  /api/v1/orders?customerId={id}&page&size
  update(id, data):   PUT  /api/v1/customers/{id}
  block(id):          POST /api/v1/customers/{id}/block
  unblock(id):        POST /api/v1/customers/{id}/unblock
}
```

### 7.2 Страница клиентов

**Список клиентов:**
- Таблица: имя, телефон, email, дата регистрации, кол-во заказов, общая сумма заказов, статус (активен/заблокирован)
- Поиск по имени, телефону, email
- Сортировка по сумме заказов, дате регистрации

**Карточка клиента:**
- Личные данные (из `CustomerResponse`)
- Статистика: количество заказов, общая сумма, последний заказ
- История заказов (таблица с пагинацией)
- Программа лояльности (если реализована)
- Кнопки: «Заблокировать» / «Разблокировать»

**Из `CustomerStatsResult` (аналитика):**
- Раздел «Статистика клиентов» на странице клиентов или в аналитике

### 7.3 Верификация

- [ ] Создать тестового клиента → найти в списке
- [ ] Оформить заказ на клиента (POS) → в карточке клиента появился заказ
- [ ] Заблокировать клиента → попытка нового заказа → бэкенд отклоняет (scheduler в customer-service проверяет статус)

---

## ФАЗА 8 — Доставка (delivery-service)

> **Цель:** Управление доставками заказов.

### 8.1 API-слой доставки

```typescript
// src/lib/api/delivery.ts
export const deliveryApi = {
  list(params):              GET  /api/v1/delivery?status&storeId&date&page&size
  get(id):                   GET  /api/v1/delivery/{id}
  createDelivery(data):      POST /api/v1/delivery
  assignCourier(id, empId):  POST /api/v1/delivery/{id}/assign
  startDelivery(id):         POST /api/v1/delivery/{id}/start
  completeDelivery(id):      POST /api/v1/delivery/{id}/complete
  failDelivery(id, reason):  POST /api/v1/delivery/{id}/fail
}
```

### 8.2 Страница доставок (`src/pages/delivery/`)

**Список доставок:**
- Таблица: заказ, адрес, курьер, статус, время создания, время доставки
- Фильтры: статус (PENDING / ASSIGNED / IN_PROGRESS / DELIVERED / FAILED), дата, магазин

**Карточка доставки:**
- Адрес доставки (из заказа)
- Назначенный курьер (сотрудник с ролью COURIER/FLORIST)
- Временная шкала статусов

**Действия:**
- Назначить курьера → выбор из списка сотрудников
- Начать доставку → `POST /start`
- Завершить → `POST /complete`
- Пометить как провал → `POST /fail` (с причиной)

### 8.3 Верификация

- [ ] Оформить заказ с доставкой → создаётся запись в delivery-service
- [ ] Назначить курьера → проверить уведомление (notification-service)
- [ ] Завершить доставку → статус заказа обновляется

---

## ФАЗА 9 — Магазины (store-service)

> **Цель:** Управление сетью магазинов. Критично для мульти-магазинных отчётов.

### 9.1 API-слой магазинов

```typescript
// src/lib/api/stores.ts
export const storesApi = {
  list():         GET  /api/v1/stores
  get(id):        GET  /api/v1/stores/{id}
  create(data):   POST /api/v1/stores   (OWNER only)
  update(id, d):  PUT  /api/v1/stores/{id}
  deactivate(id): POST /api/v1/stores/{id}/deactivate
}
```

### 9.2 Страница магазинов (`src/pages/stores/`)

**Список магазинов:**
- Карточки магазинов: название, адрес, контактный телефон, статус
- Только для роли `OWNER`

**Карточка магазина:**
- Детали магазина
- Список сотрудников магазина (через `/api/v1/employees?storeId=`)
- Текущие остатки склада (через `/api/v1/inventory/balance/all?storeId=`)

### 9.3 StoreSelector (глобальный компонент)

- Отображается в header если пользователь привязан к нескольким магазинам
- Выбранный `storeId` сохраняется в `appStore` и прокидывается в все API-запросы где нужен `storeId`
- `OWNER` видит все магазины
- `ADMIN`/`FLORIST` и т.д. — только свой магазин

---

## ФАЗА 10 — Уведомления и медиа (notification-service + media-service)

> **Цель:** Полировка опыта. Уведомления о ключевых событиях, корректная работа с изображениями.

### 10.1 Media Upload (`media-service`)

**Компонент `ImageUploader`:**
- Drag & drop или выбор файла
- Preview загруженного изображения
- `POST /api/v1/media/upload` (multipart/form-data)
- Получаем URL → прокидываем в форму товара
- Ограничения: форматы (jpg/png/webp), размер (max 5MB)
- Прогресс-бар загрузки

**Используется:**
- Форма товара (фаза 1)
- Карточка сотрудника (аватар)
- Карточка магазина

### 10.2 Уведомления в UI

- Toast-нотификации (уже должны быть из фазы 0) для всех API-операций
- Подключение real-time уведомлений от `notification-service` (WebSocket или SSE):
  - Новый онлайн-заказ → звуковой сигнал + toast
  - Товар заканчивается (остаток ниже порога) → toast
  - Просроченные батчи обнаружены → badge на разделе «Склад»

### 10.3 Маркетинг (`src/components/marketing/`, `src/pages/marketing/`)

- Управление промо-акциями и скидками (если бэкенд поддерживает)
- Email-рассылки клиентам через notification-service
- Сегментация клиентов по статистике (из CustomerStatsResult)

---

## ФАЗА 11 — Финальная полировка и Production-ready

> **Цель:** Система готова к реальной эксплуатации. Перформанс, UX, обработка крайних случаев.

### 11.1 Обработка ошибок и edge cases

**Что покрыть:**

| Сценарий | Обработка |
|---|---|
| Попытка принять накладную не в статусе SUBMITTED | Показать сообщение из `InvalidInvoiceStatusException` |
| Списание количества больше остатка | Валидация на фронте + обработка 400 с бэкенда |
| Попытка продать неактивный товар | Показать `InactiveProductException` как user-friendly сообщение |
| Timeout запроса | Retry с exponential backoff (3 попытки) |
| Kafka задержка (refresh кнопка) | Кнопка «Обновить» + optimistic polling после критических операций |
| Конкурентные изменения (Optimistic Locking) | Перехватить `409 Conflict`, предложить перезагрузить страницу |
| Сеть упала | Показать offline-индикатор, блокировать отправку форм |

### 11.2 Перформанс

- **React Query / TanStack Query** — кэширование, stale-while-revalidate, background refetch
- **Оптимистичные обновления** — для часто используемых операций (смена статуса заказа)
- **Infinite scroll или виртуализация** — для длинных списков (таблица склада, история транзакций)
- **Debounce** — для поиска (300ms задержка перед отправкой запроса)
- **Pagination** — везде использовать серверную пагинацию (параметры `page`, `size`)
- **Code splitting** — каждая страница-раздел как lazy chunk

### 11.3 Безопасность на фронте

- Никогда не хранить `accessToken` в localStorage (только in-memory + Zustand)
- `refreshToken` — только в httpOnly cookie (договориться с бэкендом)
- Не показывать чувствительные данные пользователям без нужной роли (двойная проверка: бэкенд `@PreAuthorize` + фронт `hasAnyRole`)
- XSS protection: не использовать `dangerouslySetInnerHTML`, санировать пользовательский ввод

### 11.4 Типизация

- Все API-ответы покрыты TypeScript-интерфейсами (из `src/lib/api/schema/`)
- Zod-схемы для валидации форм и API-ответов
- Строгие типы для `storeId`, `productId`, `employeeId` (branded types или UUID-string)

### 11.5 Финальный acceptance-тест

> Полный сквозной сценарий с нуля:

1. Войти как `OWNER`
2. Создать магазин «Цветочный рай»
3. Создать категорию «Тюльпаны», добавить товар «Тюльпан красный» с ценой 150₽
4. Создать поставщика «ОПТ-Цветы»
5. Создать накладную на 200 тюльпанов по 80₽ → подтвердить → принять
6. Проверить: склад показывает 200 тюльпанов, WAC = 80₽
7. Создать сотрудника «Мария Флорист», настроить зарплату 40 000₽/мес
8. Оформить 5 заказов по 10 тюльпанов через POS → завершить
9. Проверить: склад = 150 тюльпанов, в аналитике 5 OrderFact
10. Провести инвентаризацию: фактически 148 тюльпанов → списать 2 (DAMAGE)
11. Выплатить зарплату Марии
12. Открыть Дэшборд: Revenue = 5 × 10 × 150 = 7 500₽ ✓
13. Открыть PnL: Revenue = 7 500, COGS = 5 × 10 × 80 = 4 000, Salary = 40 000, WriteOff = 2 × 80 = 160
14. Скачать Excel-отчёт по продажам → проверить данные

---

## 📋 Сводная таблица фаз

| Фаза | Раздел | Сервисы | Приоритет | Оценка |
|---|---|---|---|---|
| **0** | Фундамент: auth, layout, routing | auth-service | 🔴 Критичный | 3–4 дня |
| **1** | Каталог товаров | product-catalog-service, media-service | 🔴 Критичный | 2–3 дня |
| **2** | Поставщики + Накладные | supplier-service | 🔴 Критичный | 3–4 дня |
| **3** | Склад + Инвентаризация | inventory-service | 🔴 Критичный | 3–4 дня |
| **4** | Заказы + POS | order-service | 🔴 Критичный | 3–4 дня |
| **5** | Сотрудники + Зарплата | employee-service | 🟡 Важный | 3–4 дня |
| **6** | Аналитика + Финансы | analytics-service, finance-service | 🟡 Важный | 4–5 дней |
| **7** | Клиенты | customer-service | 🟡 Важный | 2 дня |
| **8** | Доставка | delivery-service | 🟢 Желательный | 2 дня |
| **9** | Магазины | store-service | 🟢 Желательный | 1–2 дня |
| **10** | Уведомления, Медиа, Маркетинг | notification-service, media-service | 🟢 Желательный | 2–3 дня |
| **11** | Полировка, перформанс, безопасность | все | 🟢 Желательный | 3–5 дней |

**Итого:** ~35–45 рабочих дней (7–9 недель) при одном разработчике на фронтенде.

---

## 🔧 Рекомендуемая файловая структура API-слоя

```
frontend/apps/admin/src/lib/api/
├── client.ts           # Axios instance + interceptors
├── types.ts            # Базовые типы (ApiError, PagedResult, etc.)
├── auth.ts             # Auth API
├── catalog.ts          # Product catalog API
├── inventory.ts        # Inventory API
├── suppliers.ts        # Suppliers + Invoices API
├── orders.ts           # Orders API
├── customers.ts        # Customers API
├── employees.ts        # Employees + Salary + Timesheet API
├── finance.ts          # Finance API
├── analytics.ts        # Analytics API
├── delivery.ts         # Delivery API
├── stores.ts           # Stores API
├── media.ts            # Media upload API
└── schema/             # (уже существует) TypeScript типы из OpenAPI
```

## 🔧 Рекомендуемая файловая структура Store

```
frontend/apps/admin/src/store/
├── authStore.ts        # JWT токены, роли, userId
├── appStore.ts         # Выбранный storeId, глобальные настройки UI
└── notificationStore.ts # Real-time уведомления (тосты, badges)
```

---

> **Совет по порядку работы:** Всегда начинай фазу с написания API-функций (`src/lib/api/*.ts`), затем подключай их в хуки (`useQuery/useMutation`), затем интегрируй в существующие компоненты. Так легче изолировать проблемы и проводить верификацию по чек-листу в конце каждой фазы.
