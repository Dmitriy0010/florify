# 🌸 MASTER PRD — «FlowerOS» | Информационная система цветочного магазина
**Версия:** 1.0 | **Статус:** Draft → Review  
**Автор:** Architecture Team  
**Дата:** 2026-04-08

---

## 📋 Оглавление

1. [Видение продукта](#1-видение-продукта)
2. [Целевая аудитория и роли](#2-целевая-аудитория-и-роли)
3. [Технический стек](#3-технический-стек)
4. [Архитектура системы (High-Level)](#4-архитектура-системы-high-level)
5. [Микросервисы — Обзор](#5-микросервисы--обзор)
6. [Детальный план каждого сервиса](#6-детальный-план-каждого-сервиса)
   - 6.1 auth-service
   - 6.2 product-catalog-service
   - 6.3 inventory-service
   - 6.4 order-service
   - 6.5 customer-service (CRM + Loyalty)
   - 6.6 supplier-service
   - 6.7 employee-service
   - 6.8 finance-service
   - 6.9 notification-service
   - 6.10 analytics-service
   - 6.11 delivery-service
   - 6.12 media-service
7. [Фронтенд — Модули и UX](#7-фронтенд--модули-и-ux)
8. [Kafka — Топики и события](#8-kafka--топики-и-события)
9. [Инфраструктура и DevOps](#9-инфраструктура-и-devops)
10. [Безопасность](#10-безопасность)
11. [Фазы разработки (Roadmap)](#11-фазы-разработки-roadmap)
12. [Метрики успеха (KPI продукта)](#12-метрики-успеха-kpi-продукта)

---

## 1. Видение продукта

**FlowerOS** — это полноценная бизнес-операционная система для цветочного магазина, охватывающая все процессы: от закупки у поставщика до доставки букета покупателю, от расчёта зарплаты флориста до формирования P&L-отчёта для владельца.

### Проблемы, которые решает система

| Боль бизнеса | Решение FlowerOS |
|---|---|
| Учёт в Excel / на бумаге | Единая система с партионным FIFO-учётом |
| Непонятно, что списывать — гниёт незаметно | Автоматический алерт по сроку годности |
| Невозможно понять реальную прибыль | Модуль P&L с разбивкой по категориям |
| Флорист вручную принимает заказы | Канбан-доска с автостатусами |
| Непонятно как считать зарплату | Модуль KPI + автоматическая ведомость |
| Нет базы клиентов, нет лояльности | CRM + программа баллов / кешбэка |
| Курьер не знает куда ехать | Интеграция с Яндекс.Доставкой / картой |

### Целевые метрики (через 6 месяцев после запуска)
- Сокращение % списаний товара на 25–40% (за счёт FIFO + алертов)
- Экономия 3–4 часов в день на ручной работе (приём заказов, учёт)
- Увеличение среднего чека на 15% (за счёт CRM-подсказок и лояльности)

---

## 2. Целевая аудитория и роли

### Роли в системе (RBAC)

| Роль | Кто | Основные права |
|---|---|---|
| `OWNER` | Владелец / управляющий | Полный доступ ко всем модулям, финансам, настройкам |
| `ADMIN` | Старший администратор | Управление сотрудниками, прайсом, поставщиками |
| `FLORIST` | Флорист / сборщик | Сборка заказов, списание, просмотр склада |
| `CASHIER` | Кассир | Оформление продаж, кассовый модуль (POS) |
| `COURIER` | Курьер | Просмотр своих заказов на доставку, изменение статуса |
| `SUPPLIER_MANAGER` | Менеджер по закупкам | Работа с поставщиками, приёмка товара |
| `CUSTOMER` | Клиент (B2C) | Личный кабинет, история заказов, баланс баллов |
| `GUEST` | Неавторизованный | Просмотр каталога, оформление гостевого заказа |

---

## 3. Технический стек

### Backend
| Компонент | Технология |
|---|---|
| Язык | Java 21 |
| Фреймворк | Spring Boot 3.4.x |
| Архитектура | Гексагональная (Ports & Adapters) |
| Структура | Gradle Multi-Module монорепозиторий |
| БД | PostgreSQL 17 (единая схема public для всех доменов) |
| ORM | Spring Data JPA (Hibernate) |
| Миграции | Flyway |
| Брокер | Apache Kafka (внешнее общение) + Spring Events (внутреннее) |
| Кэш | Redis |
| Медиа | MinIO (S3-совместимый) |
| API | REST + SSE (Server-Sent Events) для live-обновлений |
| Документация API | OpenAPI 3.1 / Springdoc |
| Межсервисные контракты | Avro-схемы для Kafka-событий |
| Auth | JWT (Access + Refresh), Spring Security |
| Маппинг | MapStruct |
| Валидация | Jakarta Bean Validation |

### Frontend
| Компонент | Технология |
|---|---|
| Фреймворк | React 18 + TypeScript |
| Роутинг | React Router v6 |
| Стейт | Zustand + React Query (TanStack) |
| UI Kit | Tailwind CSS + shadcn/ui |
| Иконки | Lucide React |
| Графики | Recharts |
| Канбан | @hello-pangea/dnd |
| Уведомления | react-hot-toast |
| PWA | Vite PWA Plugin (offline, push-уведомления, «добавить на рабочий стол») |
| Формы | React Hook Form + Zod |

### Инфраструктура
| Компонент | Технология |
|---|---|
| Контейнеризация | Docker + Docker Compose (dev), Kubernetes (prod) |
| CI/CD | GitHub Actions |
| Мониторинг | Prometheus + Grafana |
| Логи | ELK Stack (Elasticsearch + Logstash + Kibana) |
| Трейсинг | OpenTelemetry + Jaeger |
| Режим развертывания | Modular Monolith (все домены в 1 JVM) |
| Взаимодействие доменов | Apache Kafka (или Spring ApplicationEvents для оптимизации) |

---

## 4. Архитектура системы (High-Level)

Система реализована по паттерну **Модульный Монолит (Modular Monolith)**. Все домены (модули) изолированы друг от друга на уровне кода и собираются через Gradle многомодульный проект. Развертывание происходит в едином процессе (JVM), что значительно упрощает инфраструктуру, но позволяет в будущем легко вынести любой домен в отдельный микросервис.

```
┌─────────────────────────────────────────────────────────────────┐
│                     КЛИЕНТЫ (Браузер / PWA)                      │
│  Admin SPA  │  Cashier POS (Tablet)  │  B2C Client Cabinet       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                   ┌───────▼────────┐
                   │  florify-app   │  ← Главный Spring Boot класс,
                   │  (Port 8080)   │    входная точка (Tomcat)
                   └───────┬────────┘
           ┌───────────────┼────────────────────────────────────┐
           │               │                                    │
    ┌──────▼──────┐ ┌──────▼──────┐                   ┌───────▼──────┐
    │auth-domain  │ │catalog-     │  ...остальные...  │analytics-    │
    │(бывший svc) │ │domain       │                   │domain        │
    └──────┬──────┘ └──────┬──────┘                   └───────┬──────┘
           │               │                                   │
           └───────────────┴───────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │ Kafka / AppEvents│  ← Междоменные события (Асинхронные)
                  └──────────────────┘
                           │
          ┌────────────────┼────────────────────┐
   ┌──────▼──────┐  ┌──────▼──────┐   ┌─────────▼──────┐
   │ Postgre (1) │  │    Redis    │   │  MinIO (S3)    │
   │ (Unified    │  │  (Cache)    │   │  (Media Files) │
   │ public      │  └─────────────┘   └────────────────┘
   │ schema)     │
   └─────────────┘
```

### Принцип взаимодействия доменов
- **Синхронное взаимодействие (REST):** Единый API через `florify-app` (префиксы URL вроде `/api/v1/orders`). Без нужды в API Gateway.
- **Асинхронное взаимодействие:** Kafka (или In-memory Spring Events) для передачи DTO-событий между доменами для максимального Decoupling-эффекта.
- Домены ничего не знают о внутренних реализациях друг друга. База одна, схема public общая, но каждый домен управляет строго своими таблицами через независимые `@Entity`.

---

## 5. Домены (Модули) — Обзор

| # | Домен | Схема БД | REST Контекст | Описание |
|---|---|---|---|---|
| 1 | `florify-app` | `public` | `/` | Единая точка входа 8080 (запускает все домены) |
| 2 | `auth-service` | `public` | `/api/v1/auth` | Регистрация, логин, JWT, роли |
| 3 | `product-catalog-service` | `public` | `/api/v1/catalog` | Карточки товаров, категории, цены |
| 4 | `inventory-service` | `public` | `/api/v1/inventory` | Остатки, партии, FIFO, списания |
| 5 | `order-service` | `public` | `/api/v1/orders` | Заказы, статусы, Канбан |
| 6 | `customer-service` | `public` | `/api/v1/customers` | CRM клиентов, программа лояльности |
| 7 | `supplier-service` | `public` | `/api/v1/suppliers` | Поставщики, накладные, закупки |
| 8 | `employee-service` | `public` | `/api/v1/employees` | Сотрудники, расписания, KPI, зарплата |
| 9 | `finance-service` | `public` | `/api/v1/finance` | P&L, расходы, прибыль, отчёты |
| 10 | `notification-service` | `public` | — | Email, Push, SMS-уведомления |
| 11 | `analytics-service` | `public` | `/api/v1/analytics` | Дашборд, графики, экспорт |
| 12 | `delivery-service` | `public` | `/api/v1/delivery` | Зоны доставки, курьеры, интеграция |
| 13 | `media-service` | — | `/api/v1/media` | Загрузка/раздача файлов через MinIO |

---

## 6. Детальный план каждого сервиса

---

---

### 6.1 `auth-service`

**Ответственность:** Аутентификация и авторизация.

#### Domain Models
```
User
  id: UUID
  email: String (unique)
  phone: String (unique, nullable)
  passwordHash: String
  role: Enum Role
  isActive: boolean
  createdAt: Instant

RefreshToken
  id: UUID
  userId: UUID
  tokenHash: String
  expiresAt: Instant
  deviceInfo: String
```

#### Use Cases (Interactors)
- `RegisterUserInteractor` — регистрация, хеширование пароля (bcrypt), публикация `UserRegisteredEvent` в Kafka
- `LoginInteractor` — проверка пароля, генерация Access JWT (15 мин) + Refresh Token (30 дней)
- `RefreshTokenInteractor` — обмен refresh на новую пару токенов
- `LogoutInteractor` — инвалидация refresh-токена
- `ChangePasswordInteractor`
- `AssignRoleInteractor` — только для OWNER/ADMIN

#### REST Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
PUT    /api/v1/auth/password
GET    /api/v1/auth/me
POST   /api/v1/auth/users/{userId}/role  (OWNER only)
```

#### JWT Payload
```json
{
  "sub": "uuid",
  "email": "user@example.com",
  "role": "FLORIST",
  "iat": 1700000000,
  "exp": 1700000900
}
```

#### Kafka Events (Publish)
- `user.registered` → `customer-service` (создать профиль клиента если role=CUSTOMER)
- `user.role-changed` → `employee-service`

#### Redis
- Blacklist инвалидированных access-токенов (TTL = оставшееся время жизни токена)

---

### 6.2 `product-catalog-service`

**Ответственность:** Справочник товаров. Не хранит остатки — только описание.

#### Domain Models
```
Product
  id: UUID
  sku: String (unique, генерируется автоматически: FL-0001)
  name: String
  description: String (nullable)
  category: Enum ProductCategory
    FRESH_FLOWER | POTTED_PLANT | PACKAGING | RIBBON | DECOR | CARE_PRODUCT | OTHER
  unit: Enum UnitOfMeasure
    PIECE | BUNCH | GRAM | METER | SET | LITER
  retailPrice: BigDecimal (текущая цена продажи)
  costPrice: BigDecimal (последняя закупочная цена — для быстрого расчёта)
  imageUrl: String (ссылка на MinIO)
  isActive: boolean
  defaultShelfLifeDays: Integer (срок годности по умолчанию в днях — для живых цветов)
  createdAt, updatedAt: Instant

ProductCategory (справочник)
  id: UUID
  name: String
  slug: String
  parentId: UUID (для иерархии)

PriceHistory
  id: UUID
  productId: UUID
  oldPrice: BigDecimal
  newPrice: BigDecimal
  changedBy: UUID (userId)
  changedAt: Instant
  reason: String
```

#### Use Cases
- `CreateProductInteractor` — создание товара, публикация `ProductCreatedEvent`
- `UpdatePriceInteractor` — изменение цены с сохранением истории, публикация `ProductPriceChangedEvent`
- `BulkPriceUpdateInteractor` — массовая наценка на категорию (например, +10% на все розы)
- `DeactivateProductInteractor` — soft delete (не удаляет историю транзакций)
- `GetCatalogInteractor` — листинг с фильтрацией, пагинацией, поиском

#### REST Endpoints
```
GET    /api/v1/catalog/products          ?category=&search=&page=&size=
GET    /api/v1/catalog/products/{id}
POST   /api/v1/catalog/products          (ADMIN, OWNER)
PUT    /api/v1/catalog/products/{id}     (ADMIN, OWNER)
DELETE /api/v1/catalog/products/{id}     (OWNER)
PUT    /api/v1/catalog/products/{id}/price
POST   /api/v1/catalog/products/bulk-price
GET    /api/v1/catalog/products/{id}/price-history
GET    /api/v1/catalog/categories
POST   /api/v1/catalog/categories       (ADMIN, OWNER)
```

#### Redis Cache
- `catalog:product:{id}` — TTL 10 мин (сбрасывается при изменении)
- `catalog:product-list:{hash-of-filters}` — TTL 5 мин

#### Kafka Events (Publish)
- `product.created`
- `product.price-changed` → `finance-service`, `order-service`
- `product.deactivated` → `inventory-service`

---

### 6.3 `inventory-service`

**Ответственность:** Партионный учёт остатков, FIFO, списания, инвентаризация.

> ⚠️ Этот сервис — сердце системы. Максимальная надёжность и защита от Race Conditions.

#### Domain Models

```
StockBatch (Партия товара — основа FIFO)
  id: UUID
  productId: UUID
  supplierId: UUID
  purchaseInvoiceId: UUID
  quantity: BigDecimal           ← текущий остаток в партии
  initialQuantity: BigDecimal    ← начальный остаток (для аналитики)
  purchasePrice: BigDecimal      ← цена закупки этой партии
  receivedAt: Instant            ← дата приёмки (порядок FIFO определяется здесь)
  expiresAt: Instant (nullable)  ← срок годности
  status: Enum BatchStatus       ACTIVE | DEPLETED | EXPIRED | WRITTEN_OFF
  version: Integer               ← Optimistic Locking

ProductStock (Агрегированный остаток — денормализация для скорости)
  productId: UUID (PK)
  totalQuantity: BigDecimal      ← сумма по всем активным партиям
  averageCost: BigDecimal        ← WAC (Weighted Average Cost)
  version: Integer

StockTransaction (Audit Log — append-only)
  id: UUID
  batchId: UUID (nullable — для приёмки null, для списания — конкретная партия)
  productId: UUID
  type: Enum TransactionType
    INBOUND | OUTBOUND | WRITE_OFF | INVENTORY_ADJUSTMENT | EXPIRY_WRITE_OFF
  quantityChanged: BigDecimal
  financialValue: BigDecimal     ← в закупочных ценах
  writeOffReason: Enum WriteOffReason
    SPOILAGE | DAMAGE | THEFT | INVENTORY_LOSS | NONE
  sourceDocumentId: String       ← Idempotency Key
  performerId: UUID
  createdAt: Instant

ExpiryAlert (Алерты срока годности)
  id: UUID
  batchId: UUID
  productId: UUID
  expiresAt: Instant
  alertSentAt: Instant (nullable)
  status: Enum AlertStatus       PENDING | SENT | ACKNOWLEDGED
```

#### Use Cases

**ReceiveStockInteractor (Приёмка)**
1. Проверить идемпотентность по `sourceDocumentId`
2. Создать `StockBatch` с конкретной ценой и сроком годности
3. Пересчитать WAC в `ProductStock`: `newWAC = (oldQty * oldWAC + newQty * newPrice) / (oldQty + newQty)`
4. Атомарно обновить `ProductStock` (с проверкой `@Version`)
5. Сохранить `StockTransaction` типа `INBOUND`
6. Создать `ExpiryAlert` если `expiresAt` задан
7. Публиковать `StockReceivedEvent` в Kafka

**WriteOffStockInteractor (Списание — FIFO)**
1. Получить активные партии для `productId`, отсортированные по `receivedAt` ASC
2. Проверить, что суммарный остаток >= запрошенного количества
3. Итерировать по партиям: уменьшать `quantity` пока нужное количество не списано
4. Для каждой затронутой партии сохранить `StockTransaction` типа `WRITE_OFF`
5. Обновить `ProductStock.totalQuantity`
6. Публиковать `StockWrittenOffEvent`

**SellStockInteractor (Продажа — вызывается через Kafka от order-service)**
- Аналогично WriteOff, но type = `OUTBOUND`

**InventoryAdjustmentInteractor (Ручная инвентаризация)**
- Принимает фактический остаток, вычисляет дельту, создаёт `INVENTORY_ADJUSTMENT`-транзакцию

**ExpiryCheckScheduler (Планировщик)**
- Запускается раз в час
- Ищет партии с `expiresAt < now() + 3 days`
- Публикует `ExpiryAlertEvent` → `notification-service`
- Автоматически помечает `BatchStatus.EXPIRED` для истёкших партий

#### REST Endpoints
```
GET    /api/v1/inventory/products/{productId}/stock
GET    /api/v1/inventory/products/{productId}/batches
POST   /api/v1/inventory/receive              (SUPPLIER_MANAGER, ADMIN)
POST   /api/v1/inventory/write-off            (FLORIST, ADMIN)
POST   /api/v1/inventory/adjustment           (ADMIN, OWNER)
GET    /api/v1/inventory/transactions         ?productId=&type=&from=&to=
GET    /api/v1/inventory/expiry-alerts        (список ближайших к истечению)
GET    /api/v1/inventory/low-stock            (остатки ниже порогового значения)
```

#### Kafka Events
**Consume:**
- `order.confirmed` → списать товар из остатков (FIFO)
- `order.cancelled` → вернуть товар (если заказ был подтверждён)
- `supplier.invoice-received` → инициировать приёмку

**Publish:**
- `stock.received`
- `stock.written-off`
- `stock.low` → `notification-service`
- `stock.expiry-alert` → `notification-service`

#### OptimisticLock Strategy
При `OptimisticLockException` → retry до 3 раз с экспоненциальной задержкой → если не удалось → `409 Conflict`

---

### 6.4 `order-service`

**Ответственность:** Жизненный цикл заказа от создания до завершения.

#### Domain Models

```
Order
  id: UUID
  orderNumber: String            ← читаемый номер: ORD-2024-001234
  customerId: UUID (nullable)    ← null если гостевой заказ
  guestPhone: String (nullable)
  guestName: String (nullable)
  type: Enum OrderType           PICKUP | DELIVERY
  status: Enum OrderStatus       (см. ниже)
  items: List<OrderItem>
  totalAmount: BigDecimal        ← сумма до скидок
  discountAmount: BigDecimal
  bonusPointsUsed: BigDecimal
  finalAmount: BigDecimal
  assignedFloristId: UUID (nullable)
  assignedCourierId: UUID (nullable)
  deliveryAddressId: UUID (nullable)
  deliverySlotStart: Instant (nullable)
  deliverySlotEnd: Instant (nullable)
  comment: String
  giftCard: String (сообщение на открытке)
  source: Enum OrderSource       POS | WEB | PHONE
  isPaid: boolean
  paymentMethod: Enum PaymentMethod  CASH | CARD | ONLINE | BONUS_POINTS
  createdAt, updatedAt: Instant
  version: Integer

OrderItem
  id: UUID
  orderId: UUID
  productId: UUID
  productName: String            ← снимок имени на момент заказа
  quantity: BigDecimal
  unitPrice: BigDecimal          ← снимок цены на момент заказа
  lineTotal: BigDecimal

OrderStatus (конечный автомат):
  NEW → CONFIRMED → IN_PROGRESS → READY → OUT_FOR_DELIVERY → DELIVERED → COMPLETED
                ↘ CANCELLED (из любого статуса до OUT_FOR_DELIVERY)
```

#### Конечный автомат статусов

```
NEW
 ├─ [confirm] → CONFIRMED       (автоматически через 1 мин после создания или вручную)
 └─ [cancel]  → CANCELLED

CONFIRMED
 ├─ [assign florist] → IN_PROGRESS
 └─ [cancel]         → CANCELLED

IN_PROGRESS
 ├─ [mark ready] → READY
 └─ [cancel]     → CANCELLED (возврат товара на склад)

READY
 ├─ [dispatch courier] → OUT_FOR_DELIVERY (если DELIVERY)
 ├─ [customer pickup]  → COMPLETED        (если PICKUP)
 └─ [cancel]           → CANCELLED

OUT_FOR_DELIVERY
 └─ [delivered] → COMPLETED

COMPLETED — финальный статус
CANCELLED  — финальный статус
```

#### Use Cases
- `CreateOrderInteractor` — валидация, резервирование товара (soft lock через Redis), публикация `OrderCreatedEvent`
- `ConfirmOrderInteractor` — подтверждение, публикация `OrderConfirmedEvent` → `inventory-service` списывает реально
- `AssignFloristInteractor` — назначение флориста
- `MarkReadyInteractor`
- `DispatchDeliveryInteractor` — отправка курьеру + создание задачи в `delivery-service`
- `CompleteOrderInteractor` — начисление баллов через `customer-service`
- `CancelOrderInteractor` — возврат товара на склад, возврат баллов
- `GetKanbanBoardInteractor` — данные для Канбан-доски (сгруппировано по статусам)

#### REST Endpoints
```
GET    /api/v1/orders                  ?status=&date=&floristId=&page=
GET    /api/v1/orders/kanban           (для Канбан-доски)
GET    /api/v1/orders/{id}
POST   /api/v1/orders                  (создание — все авторизованные + гость)
POST   /api/v1/orders/guest            (гостевой заказ без токена)
PUT    /api/v1/orders/{id}/status      (изменение статуса)
PUT    /api/v1/orders/{id}/assign-florist
PUT    /api/v1/orders/{id}/assign-courier
DELETE /api/v1/orders/{id}             → CANCELLED
GET    /api/v1/orders/{id}/receipt     (PDF чека)

SSE:
GET    /api/v1/orders/stream           (Server-Sent Events — live обновления для Канбан)
```

#### Redis
- `order:lock:{productId}` — soft reservation товара на 10 мин при создании заказа
- `kanban:board:{shopId}` — кэш Канбан-доски, TTL 30 сек (обновляется через SSE)

#### Kafka Events
**Publish:**
- `order.created`
- `order.confirmed` → `inventory-service` (списание)
- `order.status-changed` → `notification-service` (SMS/Push клиенту)
- `order.completed` → `customer-service` (начисление баллов), `finance-service` (запись выручки)
- `order.cancelled` → `inventory-service` (возврат), `customer-service` (возврат баллов)

---

### 6.5 `customer-service` (CRM + Loyalty)

**Ответственность:** База клиентов, история взаимодействий, программа лояльности.

#### Domain Models

```
Customer
  id: UUID
  userId: UUID (nullable — если зарегистрирован)
  firstName, lastName: String
  phone: String (unique)
  email: String (nullable)
  birthDate: LocalDate (nullable)
  gender: Enum Gender  MALE | FEMALE | UNSPECIFIED
  tags: List<String>   ← метки: "VIP", "корпоратив", "оптовик"
  source: Enum CustomerSource  WEB | POS | IMPORT | PHONE
  notes: String        ← заметки менеджера
  assignedManagerId: UUID (nullable)
  isActive: boolean
  createdAt: Instant

LoyaltyAccount
  customerId: UUID (PK)
  tier: Enum LoyaltyTier  BRONZE | SILVER | GOLD | PLATINUM
  pointsBalance: BigDecimal
  totalSpent: BigDecimal         ← для определения уровня
  cashbackPercent: BigDecimal    ← % кешбэка текущего уровня
  nextTierThreshold: BigDecimal

LoyaltyTransaction
  id: UUID
  customerId: UUID
  type: Enum LoyaltyTxType  EARN | REDEEM | EXPIRE | MANUAL_ADJUST
  points: BigDecimal
  orderId: UUID (nullable)
  description: String
  createdAt: Instant

LoyaltyTierConfig (настройки владельца)
  tier: Enum LoyaltyTier
  minSpend: BigDecimal           ← порог суммарных покупок для перехода
  cashbackPercent: BigDecimal
  pointsExpireDays: Integer

CustomerEvent (история взаимодействий — CRM-лента)
  id: UUID
  customerId: UUID
  type: Enum EventType  ORDER | CALL | VISIT | EMAIL | NOTE | BIRTHDAY_ALERT
  description: String
  createdBy: UUID
  createdAt: Instant

Notification Preferences
  customerId: UUID
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  birthdayPromoEnabled: boolean
```

#### Уровни лояльности (настраиваются владельцем)

| Уровень | Порог (₽) | Кешбэк | Бонус ко ДР |
|---|---|---|---|
| Bronze | 0 | 3% | — |
| Silver | 15 000 | 5% | +50 баллов |
| Gold | 50 000 | 7% | +200 баллов |
| Platinum | 150 000 | 10% | +500 баллов |

#### Use Cases
- `CreateCustomerInteractor` — создание профиля из POS или при регистрации
- `MergeCustomerInteractor` — объединение дублей (по телефону)
- `EarnPointsInteractor` — начисление баллов после заказа: `points = finalAmount * cashbackPercent / 100`
- `RedeemPointsInteractor` — списание баллов при оплате заказа (1 балл = 1 рубль)
- `ExpirePointsInteractor` — планировщик, сжигает устаревшие баллы
- `BirthdayAlertScheduler` — каждое утро ищет ДР через 1–3 дня → публикует в `notification-service`
- `GetCustomerHistoryInteractor` — вся CRM-лента клиента

#### REST Endpoints
```
GET    /api/v1/customers                ?search=&tag=&tier=&page=
GET    /api/v1/customers/{id}
POST   /api/v1/customers
PUT    /api/v1/customers/{id}
GET    /api/v1/customers/{id}/orders
GET    /api/v1/customers/{id}/loyalty
GET    /api/v1/customers/{id}/events    (CRM-лента)
POST   /api/v1/customers/{id}/events    (добавить заметку)
POST   /api/v1/customers/{id}/loyalty/redeem
PUT    /api/v1/loyalty/tiers/config     (OWNER — настройка уровней)
```

#### Kafka Events
**Consume:**
- `order.completed` → начислить баллы
- `order.cancelled` → вернуть баллы
- `user.registered` → создать профиль клиента

**Publish:**
- `customer.birthday-alert` → `notification-service`
- `customer.tier-upgraded` → `notification-service`

---

### 6.6 `supplier-service`

**Ответственность:** Управление поставщиками, закупки, накладные.

#### Domain Models

```
Supplier
  id: UUID
  name: String
  contactPerson: String
  phone: String
  email: String
  address: String
  taxId: String (ИНН)
  paymentTerms: Enum PaymentTerms  PREPAY | POSTPAY_7 | POSTPAY_14 | POSTPAY_30
  rating: Integer (1–5, ставит менеджер)
  notes: String
  isActive: boolean

PurchaseInvoice (Накладная закупки)
  id: UUID
  invoiceNumber: String          ← внешний номер от поставщика
  supplierId: UUID
  status: Enum InvoiceStatus     DRAFT | SUBMITTED | RECEIVED | PARTIALLY_RECEIVED | CANCELLED
  items: List<PurchaseInvoiceItem>
  totalAmount: BigDecimal
  currency: String               ← RUB (расширяемость)
  plannedDeliveryAt: Instant
  receivedAt: Instant (nullable)
  comment: String
  createdBy: UUID
  createdAt: Instant

PurchaseInvoiceItem
  id: UUID
  invoiceId: UUID
  productId: UUID
  productName: String            ← снимок
  orderedQuantity: BigDecimal
  receivedQuantity: BigDecimal   ← заполняется при приёмке
  unitPrice: BigDecimal
  expiresAt: LocalDate (nullable) ← дата истечения для партии
```

#### Use Cases
- `CreateInvoiceInteractor` — создать черновик накладной
- `SubmitInvoiceInteractor` — отправить на склад (статус → SUBMITTED)
- `ReceiveInvoiceInteractor` — приёмка: по каждой позиции публикует `StockReceiveCommand` → `inventory-service` через Kafka
- `PartialReceiptInteractor` — если получено меньше заказанного
- `CancelInvoiceInteractor`

#### REST Endpoints
```
GET    /api/v1/suppliers
POST   /api/v1/suppliers
GET    /api/v1/suppliers/{id}
PUT    /api/v1/suppliers/{id}
GET    /api/v1/suppliers/{id}/invoices

GET    /api/v1/invoices              ?supplierId=&status=&from=&to=
POST   /api/v1/invoices
GET    /api/v1/invoices/{id}
PUT    /api/v1/invoices/{id}
POST   /api/v1/invoices/{id}/receive
POST   /api/v1/invoices/{id}/cancel
```

#### Kafka Events (Publish)
- `supplier.invoice-received` → `inventory-service`, `finance-service`

---

### 6.7 `employee-service`

**Ответственность:** Справочник сотрудников, расписания, KPI, расчёт зарплаты.

#### Domain Models

```
Employee
  id: UUID
  userId: UUID                   ← ссылка на auth-service
  firstName, lastName: String
  phone: String
  role: Enum EmployeeRole        FLORIST | CASHIER | COURIER | MANAGER | OWNER
  hireDate: LocalDate
  dismissDate: LocalDate (nullable)
  isActive: boolean
  avatarUrl: String

SalaryConfig (Схема оплаты — настраивается владельцем)
  id: UUID
  employeeId: UUID
  type: Enum SalaryType          FIXED | FIXED_PLUS_PERCENT | PERCENT_ONLY
  baseAmount: BigDecimal          ← оклад
  salesPercent: BigDecimal        ← % от суммы продаж
  bonusPerOrder: BigDecimal       ← фиксированный бонус за каждый заказ
  validFrom: LocalDate

Timesheet (Табель рабочего времени)
  id: UUID
  employeeId: UUID
  date: LocalDate
  checkinAt: Instant
  checkoutAt: Instant (nullable)
  hoursWorked: BigDecimal

SalaryStatement (Расчётный лист)
  id: UUID
  employeeId: UUID
  period: YearMonth
  baseSalary: BigDecimal
  salesBonus: BigDecimal         ← % от продаж за период
  orderBonus: BigDecimal         ← бонус за заказы
  manualBonus: BigDecimal        ← ручные доп. выплаты
  deductions: BigDecimal         ← штрафы, авансы
  totalPayout: BigDecimal
  status: Enum PaymentStatus     DRAFT | APPROVED | PAID
  approvedBy: UUID (nullable)
  paidAt: Instant (nullable)
```

#### Use Cases
- `CalculateSalaryInteractor` — вызывается вручную (OWNER) или по расписанию в конце месяца:
  1. Берёт `SalaryConfig` сотрудника
  2. Суммирует продажи за период (через Kafka-события от `order-service`)
  3. Считает `baseSalary + salesBonus + orderBonus`
  4. Создаёт `SalaryStatement` со статусом `DRAFT`
- `ApproveSalaryInteractor` — OWNER подтверждает ведомость → статус `APPROVED`
- `MarkSalaryPaidInteractor` → публикует `SalaryPaidEvent` → `finance-service` (запись расхода)

#### REST Endpoints
```
GET    /api/v1/employees
POST   /api/v1/employees
GET    /api/v1/employees/{id}
PUT    /api/v1/employees/{id}
GET    /api/v1/employees/{id}/salary-config
PUT    /api/v1/employees/{id}/salary-config

GET    /api/v1/salary/statements     ?employeeId=&period=
POST   /api/v1/salary/statements/calculate  (запустить расчёт за период)
PUT    /api/v1/salary/statements/{id}/approve
PUT    /api/v1/salary/statements/{id}/paid

GET    /api/v1/timesheet             ?employeeId=&month=
POST   /api/v1/timesheet/checkin
POST   /api/v1/timesheet/checkout
```

#### Kafka Events
**Consume:**
- `order.completed` → записать в буфер продаж сотрудника для расчёта KPI

**Publish:**
- `salary.paid` → `finance-service`

---

### 6.8 `finance-service`

**Ответственность:** P&L (Прибыли и убытки), сводные финансовые отчёты.

> Этот сервис ничего не инициирует — только слушает Kafka и агрегирует данные.

#### Domain Models

```
FinancialTransaction
  id: UUID
  type: Enum FinancialType
    REVENUE_SALE       ← выручка с продажи
    COGS               ← себестоимость проданного товара
    PURCHASE_EXPENSE   ← оплата накладной поставщику
    SALARY_EXPENSE     ← выплата зарплаты
    BONUS_EXPENSE      ← премия
    WRITE_OFF_EXPENSE  ← убыток от списания
    RENT_EXPENSE       ← аренда (вводится вручную)
    OTHER_EXPENSE      ← прочие расходы
    MANUAL_INCOME      ← прочие доходы
  amount: BigDecimal
  referenceId: String    ← orderId / invoiceId / statementId
  description: String
  performedBy: UUID
  occurredAt: Instant

ManualExpense (ручной ввод расходов)
  id: UUID
  category: Enum ExpenseCategory  RENT | UTILITY | MARKETING | EQUIPMENT | OTHER
  amount: BigDecimal
  description: String
  date: LocalDate
  attachmentUrl: String (чек/документ)
  createdBy: UUID

PnlReport (кэшированный отчёт P&L)
  period: YearMonth
  revenue: BigDecimal
  cogs: BigDecimal
  grossProfit: BigDecimal         = revenue - cogs
  operatingExpenses: BigDecimal   = salary + rent + utility + ...
  writeOffLosses: BigDecimal
  netProfit: BigDecimal           = grossProfit - operatingExpenses - writeOffLosses
  updatedAt: Instant
```

#### Use Cases
- `RecordRevenueInteractor` — слушает `order.completed`, записывает REVENUE + COGS
- `RecordPurchaseExpenseInteractor` — слушает `supplier.invoice-received`
- `RecordSalaryExpenseInteractor` — слушает `salary.paid`
- `RecordWriteOffLossInteractor` — слушает `stock.written-off`
- `AddManualExpenseInteractor` — ручной ввод расходов (аренда, коммуналка)
- `GeneratePnlReportInteractor` — агрегация за период

#### REST Endpoints
```
GET    /api/v1/finance/pnl             ?from=&to=   (P&L отчёт)
GET    /api/v1/finance/transactions    ?type=&from=&to=&page=
POST   /api/v1/finance/expenses        (ручной расход)
GET    /api/v1/finance/expenses        ?category=&month=
GET    /api/v1/finance/dashboard       (виджеты: выручка сегодня/неделя/месяц)
GET    /api/v1/finance/export          ?format=xlsx&from=&to=
```

#### Kafka Events (Consume)
- `order.completed`
- `supplier.invoice-received`
- `salary.paid`
- `stock.written-off`

---

### 6.9 `notification-service`

**Ответственность:** Отправка уведомлений по всем каналам.

#### Каналы отправки
- Email (SMTP / SendGrid)
- Push (Firebase Cloud Messaging — для PWA)
- SMS (Twilio / SMSC.ru)

#### Domain Models

```
NotificationTemplate
  id: UUID
  code: String (unique)          ← ORDER_STATUS_CHANGED, BIRTHDAY_PROMO, LOW_STOCK
  channel: Enum Channel
  subject: String (для email)
  bodyTemplate: String           ← Mustache/Thymeleaf шаблон
  isActive: boolean

NotificationLog
  id: UUID
  recipientId: UUID
  recipientContact: String       ← email или телефон
  channel: Enum Channel
  templateCode: String
  status: Enum SendStatus        PENDING | SENT | FAILED | BOUNCED
  sentAt: Instant
  errorMessage: String
```

#### Kafka Events (Consume — все превращаются в уведомления)
- `order.status-changed` → SMS/Push клиенту: «Ваш заказ #ORD-001 готов!»
- `order.created` → Email клиенту: подтверждение заказа
- `stock.low` → Push менеджеру: «Осталось 3 шт. Красной розы»
- `stock.expiry-alert` → Push менеджеру: «Партия роз истекает через 2 дня»
- `customer.birthday-alert` → Push/Email менеджеру: «Завтра ДР у Ивана Иванова»
- `customer.tier-upgraded` → Email клиенту: «Поздравляем! Вы достигли уровня Gold»
- `salary.approved` → Push сотруднику: «Ваша зарплата за октябрь утверждена»

---

### 6.10 `analytics-service`

**Ответственность:** Агрегация метрик, дашборды, отчёты.

> Читает из своей DB, которая наполняется Kafka-событиями. Не обращается к чужим DB.

#### Метрики и виджеты

**Операционный дашборд (в реальном времени)**
- Заказов сегодня / за неделю / за месяц
- Выручка сегодня / за неделю / за месяц
- Средний чек
- Топ-5 продаваемых товаров
- Активные заказы по статусам (пончиковая диаграмма)

**Складская аналитика**
- Товары с низким остатком
- Товары с истекающим сроком годности
- Объём списаний за период с разбивкой по причинам
- Оборачиваемость товара (как быстро уходит каждая категория)

**Финансовая аналитика**
- P&L график по месяцам (выручка / расходы / прибыль)
- Структура расходов (круговая диаграмма)
- Валовая маржа по категориям товаров

**CRM аналитика**
- Новые клиенты за период
- Повторные покупки (retention)
- LTV (Lifetime Value) по уровням лояльности
- Источники заказов (POS / WEB / PHONE)

**HR аналитика**
- Продажи по флористам (кто сколько собрал заказов)
- Эффективность курьеров (среднее время доставки)

#### REST Endpoints
```
GET    /api/v1/analytics/dashboard        (операционный дашборд)
GET    /api/v1/analytics/sales            ?groupBy=day|week|month&from=&to=
GET    /api/v1/analytics/products/top     ?limit=10&from=&to=
GET    /api/v1/analytics/customers/stats
GET    /api/v1/analytics/inventory/stats
GET    /api/v1/analytics/employees/performance
GET    /api/v1/analytics/export           ?report=pnl|sales|inventory&format=xlsx
```

---

### 6.11 `delivery-service`

**Ответственность:** Зоны доставки, слоты, назначение курьеров.

#### Domain Models

```
DeliveryZone
  id: UUID
  name: String
  polygon: String               ← GeoJSON-полигон зоны
  deliveryFee: BigDecimal
  minOrderAmount: BigDecimal
  isActive: boolean

DeliverySlot
  id: UUID
  date: LocalDate
  startTime: LocalTime
  endTime: LocalTime
  maxCapacity: Integer          ← макс. заказов в слот
  currentLoad: Integer

DeliveryTask
  id: UUID
  orderId: UUID
  courierId: UUID (nullable)
  address: String
  latitude, longitude: Double
  status: Enum TaskStatus
    CREATED | ASSIGNED | PICKED_UP | DELIVERED | FAILED
  estimatedArrival: Instant
  actualDeliveredAt: Instant
  failureReason: String
```

#### Интеграции
- **Яндекс.Доставка API** — передача задачи на аутсорс-курьера
- **Yandex Maps / Google Maps** — геокодирование адресов, построение маршрута
- **2ГИС** — альтернатива для российского рынка

#### REST Endpoints
```
GET    /api/v1/delivery/zones
POST   /api/v1/delivery/zones              (OWNER)
PUT    /api/v1/delivery/zones/{id}

GET    /api/v1/delivery/slots              ?date=
POST   /api/v1/delivery/slots              (OWNER)

GET    /api/v1/delivery/tasks              ?courierId=&date=&status=
GET    /api/v1/delivery/tasks/{id}
PUT    /api/v1/delivery/tasks/{id}/status

POST   /api/v1/delivery/geocode            ?address=
```

---

### 6.12 `media-service`

**Ответственность:** Загрузка и раздача медиафайлов (изображения товаров).

#### Функции
- Upload: принимает файл, сжимает (WebP), сохраняет в MinIO
- Генерация превью (thumbnail 200x200, medium 600x600, original)
- Отдача presigned URL для прямого скачивания из MinIO
- Удаление файлов (при деактивации товара)

#### REST Endpoints
```
POST   /api/v1/media/upload              (multipart/form-data)
GET    /api/v1/media/{filename}          (редирект на presigned URL)
DELETE /api/v1/media/{filename}          (ADMIN, OWNER)
```

---

## 7. Фронтенд — Модули и UX

### Приложения (SPA)

| Приложение | URL | Аудитория |
|---|---|---|
| **Admin Panel** | `/admin` | OWNER, ADMIN, FLORIST, CASHIER |
| **Client Cabinet** | `/account` | CUSTOMER |
| **Public Catalog** | `/` | GUEST + CUSTOMER |

### PWA-возможности
- «Добавить на рабочий стол» — работает как нативное приложение
- Push-уведомления для сотрудников (новый заказ, алерт склада)
- Оффлайн-режим для кассира (кэш каталога в Service Worker)
- Адаптивная вёрстка: мобильный (375px) / планшет (768px) / десктоп (1280px)

### 7.1 Модули Admin Panel

#### 🏠 Главная / Дашборд
- Виджеты: выручка сегодня, заказов в работе, остатки под угрозой, ближайшие ДР клиентов
- Быстрые действия: «Новый заказ», «Принять товар», «Записать расход»

#### 📦 Канбан заказов
- Колонки: Новые | Подтверждённые | В сборке | Готовы | У курьера | Выполнены
- Карточка заказа: номер, клиент, сумма, время слота доставки, состав
- Цветовая индикация: просроченные заказы — красная граница
- Drag & Drop для изменения статуса
- Фильтр по флористу / дате
- Live-обновления через SSE (без перезагрузки страницы)
- Для курьера: скрыт номер телефона клиента (показывается по кнопке)

#### 🌸 POS — Кассовый модуль (оптимизирован для планшета)
- Сетка товаров с фото-кнопками (быстрый выбор)
- Поиск по имени / SKU
- Корзина сбоку
- Поле «клиент» — поиск по телефону, привязка к CRM
- Применение баллов / промокода
- Выбор способа оплаты
- Печать чека (термопринтер через браузерный Print API)
- Оффлайн-режим: заказы сохраняются локально и синхронизируются при восстановлении

#### 📊 Склад
- Список товаров с остатками (карточный вид + табличный вид)
- Фильтр: низкий остаток / истекает срок / без движения 7+ дней
- Форма приёмки товара (накладная от поставщика)
- Форма списания (выбор причины, количества)
- Режим «Инвентаризация»: список для сверки, ввод фактических остатков
- История транзакций по товару

#### 👥 CRM — Клиенты
- Таблица клиентов с поиском по имени / телефону / email
- Карточка клиента: контакты, уровень лояльности, баланс баллов, теги
- Лента событий (звонки, покупки, заметки)
- История заказов клиента
- Кнопка «Позвонить» (ссылка tel:)
- Фильтр: «Завтра день рождения», «Не покупали 30+ дней»

#### 🚚 Поставщики
- Список поставщиков с рейтингом
- История накладных по поставщику
- Создание / редактирование накладной
- Статус: Черновик → Отправлена → Принята

#### 👨‍💼 Сотрудники и Зарплата
- Список сотрудников с ролями
- Табель за месяц
- Настройка схемы оплаты (OWNER)
- Расчётные листы: Черновик → Утверждён → Выплачен
- Журнал выплат

#### 💰 Финансы
- P&L-отчёт (сводная таблица за период)
- График выручки / расходов по месяцам
- Список транзакций с фильтрами
- Ручной ввод расходов (аренда, коммуналка и т.д.)
- Экспорт в Excel

#### ⚙️ Настройки
- Профиль магазина (название, адрес, логотип)
- Управление пользователями и ролями
- Зоны доставки и слоты
- Конфигурация программы лояльности
- Промокоды и скидки
- Шаблоны уведомлений

### 7.2 Client Cabinet (B2C)

- Опциональная регистрация (OAuth Google / Email + OTP)
- Мои заказы (история + отслеживание статуса)
- Баланс баллов и уровень лояльности
- Личные данные (имя, телефон, адреса доставки)
- Промокоды
- Email-подписки (включить / отключить)

### 7.3 Public Catalog

- Каталог с фильтрацией по категории
- Карточка товара
- Кнопка «Заказать» (гостевой заказ через форму с именем и телефоном)
- Информация о доставке и зонах

---

## 8. Kafka — Топики и события

### Соглашение об именовании
`{domain}.{entity}.{action}` — например: `orders.order.completed`

### Полная таблица топиков

| Топик | Publisher | Consumer(s) | Описание |
|---|---|---|---|
| `auth.user.registered` | auth-service | customer-service | Новый пользователь |
| `auth.user.role-changed` | auth-service | employee-service | Изменение роли |
| `catalog.product.created` | product-catalog | inventory-service | Новый товар |
| `catalog.product.price-changed` | product-catalog | finance-service, order-service | Изменение цены |
| `inventory.stock.received` | inventory | finance-service, analytics | Приёмка товара |
| `inventory.stock.written-off` | inventory | finance-service, analytics | Списание |
| `inventory.stock.low` | inventory | notification | Низкий остаток |
| `inventory.stock.expiry-alert` | inventory | notification | Истекает срок |
| `orders.order.created` | order | notification, analytics | Новый заказ |
| `orders.order.confirmed` | order | inventory | → списать товар |
| `orders.order.status-changed` | order | notification | Для клиента |
| `orders.order.completed` | order | customer, finance, analytics | Финальный статус |
| `orders.order.cancelled` | order | inventory, customer, analytics | Отмена |
| `suppliers.invoice.received` | supplier | inventory, finance | Приёмка накладной |
| `customers.customer.birthday-alert` | customer | notification | ДР через 1–3 дня |
| `customers.tier.upgraded` | customer | notification | Повышение уровня |
| `employees.salary.paid` | employee | finance, notification | Выплата зарплаты |
| `delivery.task.status-changed` | delivery | order, notification | Статус доставки |

### Формат события (Avro / JSON)
```json
{
  "eventId": "uuid",
  "eventType": "orders.order.completed",
  "occurredAt": "2024-11-01T12:00:00Z",
  "traceId": "uuid",
  "payload": { ... }
}
```

### Гарантии доставки
- `at-least-once` доставка (идемпотентные consumer'ы через Idempotency Key)
- Retention: 7 дней для всех топиков
- Replication factor: 3 (prod)
- Dead Letter Queue (DLQ) для failed-событий: `{topicName}.dlq`

---

## 9. Инфраструктура и DevOps

### Структура монорепозитория
```
flower-crm/
├── build.gradle                    ← корневой Gradle
├── settings.gradle
├── docker-compose.yml              ← dev-окружение
├── docker-compose.prod.yml
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── services/
│   ├── api-gateway/
│   │   ├── build.gradle
│   │   └── src/
│   ├── auth-service/
│   ├── product-catalog-service/
│   ├── inventory-service/          ← уже начат
│   ├── order-service/
│   ├── customer-service/
│   ├── supplier-service/
│   ├── employee-service/
│   ├── finance-service/
│   ├── notification-service/
│   ├── analytics-service/
│   ├── delivery-service/
│   └── media-service/
├── libs/
│   ├── common-domain/              ← общие Value Objects (Money, Address)
│   ├── common-events/              ← Avro/POJO Kafka-событий
│   └── common-security/            ← JWT-утилиты, Security Config
└── frontend/
    ├── admin-panel/
    ├── client-cabinet/
    └── public-catalog/
```

### Структура каждого микросервиса (гексагональная)
```
{service-name}/src/main/java/com/flowercrm/{service}/
├── domain/
│   ├── model/          ← Pure Java сущности
│   └── event/          ← Domain Events
├── application/
│   ├── port/
│   │   ├── in/         ← Use Case интерфейсы + Commands
│   │   └── out/        ← Repository интерфейсы
│   └── service/        ← Interactors (реализация Use Cases)
└── adapter/
    ├── in/
    │   └── web/        ← REST Controllers
    └── out/
        ├── persistence/ ← R2DBC Repositories + JPA Entities
        ├── messaging/   ← Kafka Producers/Consumers
        └── cache/       ← Redis адаптеры
```

### docker-compose.yml (dev)
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: flowercrm
      POSTGRES_USER: flower
      POSTGRES_PASSWORD: flower123
    volumes:
      - ./infra/init-schemas.sql:/docker-entrypoint-initdb.d/init.sql
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    environment:
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 1
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
    ports: ["9092:9092"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    ports: ["9000:9000", "9001:9001"]

  kafka-ui:
    image: provectuslabs/kafka-ui
    ports: ["8085:8080"]

  jaeger:
    image: jaegertracing/all-in-one
    ports: ["16686:16686"]
```

### CI/CD Pipeline (GitHub Actions)
```
Push to feature/* → CI:
  1. Compile + Unit Tests
  2. Integration Tests (Testcontainers)
  3. SonarQube Analysis
  4. Docker Build

Merge to main → CD:
  1. All CI steps
  2. Docker Push to Registry
  3. Deploy to staging (K8s)
  4. Smoke Tests
  5. Manual approval → Deploy to production
```

---

## 10. Безопасность

### Аутентификация и авторизация
- JWT Access Token: 15 минут, содержит role
- JWT Refresh Token: 30 дней, хранится в HttpOnly cookie
- При логауте: access-токен добавляется в Redis blacklist
- RBAC на уровне каждого контроллера: `@PreAuthorize("hasRole('OWNER')")`

### Защита данных
- HTTPS (TLS 1.3) повсюду — обязательно для прода
- Пароли: bcrypt (cost factor 12)
- Телефоны клиентов: маскируются в ответах для COURIER (показывается только +7 *** *** 99 99)
- Финансовые данные: доступны только OWNER и ADMIN
- Audit log на уровне БД (created_by, updated_by на каждой таблице)

### Валидация
- Все входящие данные валидируются на уровне DTO (Jakarta Bean Validation)
- SQL-инъекции исключены через параметризированные запросы R2DBC
- Rate Limiting на API Gateway

---

## 11. Фазы разработки (Roadmap)

### 🏗️ Фаза 0 — Инфраструктура (1–2 недели)
- [x] Настройка монорепозитория (Gradle multi-module)
- [x] `docker-compose.yml` с PostgreSQL, Kafka, Redis, MinIO
- [x] `libs/common-domain`, `libs/common-events`, `libs/common-security`
- [x] GitHub Actions: базовый CI pipeline

### 🔐 Фаза 1 — Ядро системы (3–4 недели)
- [x] `auth-service`: регистрация, логин, JWT, роли
- [x] `product-catalog-service`: CRUD товаров, категории, цены
- [x] `inventory-service`: партии FIFO, приёмка, списание, WAC
- [x] `media-service`: upload/download через MinIO (Foundation)
- [/] Фронтенд: Auth, базовый каталог, склад

### 🛒 Фаза 2 — Операционный контур (3–4 недели)
- [x] `order-service`: создание заказов, Канбан-доска, SSE
- [x] `supplier-service`: поставщики, накладные
- [x] `notification-service`: email + push

### 👥 Фаза 3 — CRM и Персонал (2–3 недели)
- [x] `customer-service`: CRM, программа лояльности, баллы
- [x] `employee-service`: сотрудники, KPI, расчёт зарплаты
- [ ] `delivery-service`: зоны, слоты, курьеры
- [ ] Клиентский ЛК (B2C)

### 💰 Фаза 4 — Аналитика и Финансы (2–3 недели)
- [ ] `finance-service`: P&L, расходы
- [ ] `analytics-service`: дашборды, отчёты
- [ ] Экспорт данных в Excel
- [ ] Финансовый модуль на фронтенде

### 🚀 Фаза 5 — Продакшен (1–2 недели)
- [ ] Kubernetes-манифесты для прода
- [ ] Мониторинг (Prometheus + Grafana)
- [ ] Логирование (ELK)
- [ ] Трейсинг (Jaeger)
- [ ] Нагрузочное тестирование (k6)
- [ ] Security-аудит

---

## 12. Метрики успеха (KPI продукта)

### Технические метрики
| Метрика | Цель |
|---|---|
| API Response Time (p95) | < 200 мс |
| Uptime | > 99.5% |
| Error Rate | < 0.1% |
| Kafka Lag | < 1 сек |
| DB Query Time (p95) | < 50 мс |

### Бизнес-метрики (через 3 месяца использования)
| Метрика | Цель |
|---|---|
| Сокращение % списаний | -25% |
| Время оформления заказа в POS | < 1 мин |
| Время подготовки зарплатной ведомости | 5 мин (было: 2–3 часа) |
| Процент повторных покупок клиентов | +15% |

---

## 📌 Следующие шаги

> **После утверждения Master PRD** следует создать отдельный детальный PRD для каждого сервиса перед началом его разработки. Порядок:
>
> 1. `auth-service` PRD
> 2. `product-catalog-service` PRD
> 3. `inventory-service` PRD (уже частично готов — см. загруженный файл)
> 4. ...

---

*FlowerOS Master PRD v1.0 — Конфиденциально*
