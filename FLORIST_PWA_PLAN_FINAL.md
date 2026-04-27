# 🌿 Florist PWA — Итоговый план реализации `apps/florist`

**Стек:** React 18 + TypeScript + Tailwind + shadcn/ui + Vite PWA  
**Принцип:** Mobile-first. Офлайн-готовое. Максимум из admin — копируй, не пиши заново.  
**Приоритет диплома:** Шаги 1–6 → MVP и защита. Шаги 7–10 → полная версия.

---

## 📋 Содержание

1. [Ответы на открытые вопросы к бэкенду](#1-ответы-на-открытые-вопросы-к-бэкенду)
2. [Архитектура и стейт-менеджмент](#2-архитектура-и-стейт-менеджмент)
3. [Что копировать из admin](#3-что-копировать-из-admin)
4. [Инициализация проекта](#4-инициализация-проекта)
5. [Дизайн-система и UI](#5-дизайн-система-и-ui)
6. [Аутентификация](#6-аутентификация)
7. [App Shell — каркас приложения](#7-app-shell--каркас-приложения)
8. [Канбан флориста](#8-канбан-флориста)
9. [Детальная карточка заказа](#9-детальная-карточка-заказа)
10. [Real-time обновления](#10-real-time-обновления)
11. [Склад — просмотр остатков](#11-склад--просмотр-остатков)
12. [Списание товара (WriteOff)](#12-списание-товара-writeoff)
13. [Инвентаризация](#13-инвентаризация)
14. [Профиль и табель (Clock In/Out)](#14-профиль-и-табель-clock-inout)
15. [PWA — офлайн, установка](#15-pwa--офлайн-установка)
16. [IndexedDB и офлайн-очередь](#16-indexeddb-и-офлайн-очередь)
17. [Роутинг и защита маршрутов](#17-роутинг-и-защита-маршрутов)
18. [Порядок реализации](#18-порядок-реализации)

---

## 1. Ответы на открытые вопросы к бэкенду

Это самая важная секция — она исправляет ошибочные предположения из черновика плана.

---

### ❓ Вопрос 1: SSE `/api/v1/orders/stream` — как передать Authorization?

**Ответ: Endpoint в спеке есть, но в коде НЕ реализован.**

В `OrderController.java` присутствует только `/kanban`, `/{id}`, `/`, `/my` и `/{id}/status`.  
Endpoint `GET /api/v1/orders/stream` упоминается только в API-документации (`LLM_CONTEXT_PROD.txt`, строка 27123), реализации `SseEmitter` в контроллере нет.

**Что делать во florist PWA:**

Используем **polling через TanStack Query** (`refetchInterval: 30_000`) как основной механизм актуализации данных. Это проще, надёжнее для диплома и не требует изменений бэкенда.

```ts
// useFloristKanban.ts — polling вместо SSE
const confirmed = useQuery({
  queryKey: ['kanban', 'CONFIRMED'],
  queryFn: () => ordersApi.getKanban({ status: 'CONFIRMED', limit: 50 }),
  refetchInterval: 30_000,       // раз в 30 секунд автоматически
  staleTime: 15_000,
})
```

> **На будущее (после диплома):** когда SSE будет реализован на бэкенде, использовать `@microsoft/fetch-event-source` — эта библиотека в отличие от нативного `EventSource` поддерживает заголовок `Authorization: Bearer …`. Бэкенду будет достаточно принять токен через `?token=` query-param или через этот заголовок.

---

### ❓ Вопрос 2: `GET /api/v1/orders/kanban?status=...` — фильтрует ли по `floristId` из токена?

**Ответ: НЕТ. Канбан возвращает ВСЕ заказы по статусу, без фильтра по флористу.**

Контроллер:
```java
@GetMapping("/kanban")
@PreAuthorize("hasAnyRole('CASHIER', 'FLORIST', 'ADMIN', 'OWNER')")
public ResponseEntity<List<OrderKanbanResponse>> getKanban(
        @RequestParam OrderStatus status,
        @RequestParam(defaultValue = "50") int limit
)
```

Никакой фильтрации по токену внутри — все заказы данного статуса видны всем.

**Что это значит для UI:**

Это правильно! Флорист видит всю очередь магазина:
- Колонка «Назначено» (`CONFIRMED`) — все заказы, ждущие флориста
- Колонка «Собираю» (`IN_PROGRESS`) — все заказы в работе
- Колонка «Готово» (`READY`) — все готовые заказы

В поле `assignedFloristId` (поле `OrderKanbanItem`) хранится UUID флориста, взявшего заказ. Используй это для **визуального выделения** своих заказов — например, зелёная полоска слева на карточке.

```ts
// OrderCard.tsx — "мой" заказ подсвечен
const isMyOrder = order.assignedFloristId === authStore.userId
```

---

### ❓ Вопрос 3: `GET /api/v1/employees/me` — есть ли такой endpoint?

**Ответ: НЕТ. Endpoint не существует, и `EmployeeController` не доступен для роли FLORIST.**

`EmployeeController` требует роль `OWNER/ADMIN/MANAGER`:
```java
@GetMapping("/{id}")
@PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
```

**Что использовать вместо:**

Используй `GET /api/v1/auth/me` — доступен любому авторизованному пользователю:

```ts
// GET /api/v1/auth/me → UserResponse
interface UserResponse {
  id: string           // userId из auth-service
  email: string
  phone: string
  firstName: string
  lastName: string
  roles: Role[]
  createdAt: string
}
```

Этого достаточно для отображения имени в TopBar (`firstName + ' ' + lastName`) и проверки ролей.

**Важно:** `storeId` в `UserResponse` отсутствует. Для запросов склада `GET /api/v1/inventory/balance/all?storeId=` параметр `storeId` является необязательным (`required = false`) — бэкенд вернёт данные без него. Для диплома передавать `storeId` необязательно.

```ts
// authApi.ts
export const getCurrentUser = () =>
  client.get<UserResponse>('/api/v1/auth/me').then(r => r.data)

// AppShell.tsx
const { data: me } = useQuery({ queryKey: ['me'], queryFn: getCurrentUser })
```

---

### ❓ Вопрос 4: `POST /api/v1/notifications/subscribe` — нужен для Web Push

**Ответ: Endpoint НЕ реализован. Web Push пропускаем.**

В `notification-service` нет ни `WebPushSender`, ни эндпоинта подписки.

**Решение:** Web Push — полностью исключить из диплома. Polling с `refetchInterval: 30s` обеспечивает достаточный real-time для флориста. Это честная и обоснованная архитектурная граница.

---

### ❓ Вопрос 5: `POST /api/v1/inventory/receive` — принимает ли нулевую цену для инвентаризационных корректировок?

**Ответ: Не важно — FLORIST роль не имеет доступа к этому endpoint вообще.**

```java
@PostMapping("/receive")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SUPPLIER_MANAGER')")
// FLORIST — нет доступа!
```

**Что флорист МОЖЕТ делать со складом:**

| Endpoint | FLORIST |
|---|---|
| `GET /api/v1/inventory/balance/all` | ✅ |
| `GET /api/v1/inventory/balance/{productId}` | ✅ |
| `GET /api/v1/inventory/batches/{productId}` | ✅ |
| `GET /api/v1/inventory/transactions/{productId}` | ✅ |
| `GET /api/v1/inventory/write-offs` | ✅ |
| `POST /api/v1/inventory/write-off` | ✅ |
| `POST /api/v1/inventory/receive` | ❌ |

**Последствие для функционала инвентаризации:**

Инвентаризация для флориста = **только списание недостач**. Если `фактическое < системного` → `write-off` с причиной `INVENTORY_LOSS`. Если `фактическое > системного` — такой излишек флорист не может оформить, это задача ADMIN/OWNER. Просто показать сообщение: «Излишек зафиксирован — обратитесь к администратору».

---

### ❓ Вопрос 6: `MergeCustomerInteractor` + лояльность — видит ли флорист loyalty?

**Ответ: НЕТ. Endpoint лояльности закрыт для роли FLORIST.**

```java
@GetMapping("/accounts/{customerId}")
@PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'CASHIER')")
// FLORIST — нет доступа!
```

**Решение для диплома:**

Блок лояльности клиента в `OrderDetailPage` просто не отображается для флориста. Вместо этого в карточке показываем только имя клиента и телефон из самого заказа (они есть в `OrderResponse`).

> **Если хочется показать лояльность:** добавить `FLORIST` в `@PreAuthorize` на этом endpoint — это минимальное изменение бэкенда (1 строка), которое безопасно и логически обоснованно.

---

### ✅ Бонус-ответ: как работает «Взять в работу»?

Endpoint `PUT /api/v1/orders/{id}/assign-florist` из спецификации **не реализован** в коде. Вместо него используется общий `PUT /api/v1/orders/{id}/status`, который принимает необязательное поле `floristId`:

```java
public record UpdateOrderStatusRequest(
    @NotNull OrderStatus status,
    UUID floristId    // опциональное поле!
)
```

Значит «Взять в работу» = один запрос:

```ts
// ordersApi.ts
export const takeOrder = (orderId: string, myUserId: string) =>
  client.put(`/api/v1/orders/${orderId}/status`, {
    status: 'IN_PROGRESS',
    floristId: myUserId,   // authStore.userId
  })

// «Букет готов»:
export const markReady = (orderId: string) =>
  client.put(`/api/v1/orders/${orderId}/status`, { status: 'READY' })
```

---

## 2. Архитектура и стейт-менеджмент

### Место в монорепо

```
frontend/
├── packages/
│   ├── ui/            ← общие компоненты (Button, Badge, StatusChip)
│   └── shared/        ← типы, API-клиент, утилиты
│       └── api/
│           ├── client.ts        ← axios + JWT interceptor
│           ├── ordersApi.ts
│           ├── inventoryApi.ts
│           ├── authApi.ts
│           └── schema.ts        ← TypeScript-типы всех DTO
│
└── apps/
    ├── admin/     ← готово
    └── florist/   ← СТРОИМ СЕЙЧАС
        └── src/
            ├── features/
            │   ├── orders/       ← канбан + детальная карточка
            │   ├── inventory/    ← склад + списание + инвентаризация
            │   └── profile/      ← профиль + clock in/out
            ├── layouts/
            │   └── AppShell.tsx  ← TopBar + Bottom Tab Bar
            ├── pages/
            │   ├── LoginPage.tsx
            │   ├── KanbanPage.tsx
            │   ├── OrderDetailPage.tsx
            │   ├── InventoryPage.tsx
            │   ├── InventoryDetailPage.tsx
            │   ├── InventoryAuditPage.tsx
            │   └── ProfilePage.tsx
            ├── lib/
            │   ├── db.ts           ← IndexedDB через idb
            │   ├── offlineQueue.ts ← очередь мутаций
            │   └── polling.ts      ← centralized refetchInterval
            ├── store/
            │   ├── authStore.ts    ← копия из admin
            │   └── offlineStore.ts ← статус сети + pending count
            └── router.tsx
```

### Стейт-менеджмент

| Тип данных | Инструмент |
|---|---|
| Серверные данные (заказы, склад) | TanStack Query — кеш, инвалидация |
| Auth (токен, роль, userId, имя) | Zustand `authStore` (из admin) |
| Офлайн-состояние, очередь | Zustand `offlineStore` |
| Формы списания, инвентаризации | React Hook Form + Zod |
| Офлайн-кеш заказов и склада | IndexedDB (`idb`) |

---

## 3. Что копировать из admin

### Копировать 1-в-1

| Что | Куда |
|---|---|
| `src/lib/api/client.ts` — axios + JWT interceptor, авто-refresh 401 | `packages/shared/api/client.ts` |
| `src/store/authStore.ts` — Zustand: accessToken, refreshToken, roles | `src/store/authStore.ts` |
| `src/lib/api/ordersApi.ts` — list, getById, updateStatus, getKanban | `packages/shared/api/ordersApi.ts` |
| `src/lib/api/inventoryApi.ts` — getAllBalances, writeOff, batches, getBalance | `packages/shared/api/inventoryApi.ts` |
| `src/lib/api/authApi.ts` — login, refresh, logout, **getMe** | `packages/shared/api/authApi.ts` |
| `src/lib/api/schema.ts` — TypeScript-типы всех DTO | `packages/shared/types/` |
| `tailwind.config.ts` + `globals.css` | Скопировать, упростить |

### Копировать с адаптацией

| Что | Изменения |
|---|---|
| `WriteOffModal` | Упростить до 3 полей. Причины: только SPOILAGE / DAMAGE / INVENTORY_LOSS. Добавить офлайн-очередь. |
| Канбан-доска | Убрать drag-n-drop. 3 колонки: CONFIRMED / IN_PROGRESS / READY. Крупнее, touch-friendly. |
| `OrderDetailSheet` | Переделать в полноэкранную страницу. Убрать блок loyalty (нет прав). |
| `LoginPage` | Та же структура, заголовок «Florify — Флорист» |

### Не копировать (не нужно во florist)

- Sidebar навигация → заменяется Bottom Tab Bar
- DataTable клиентов, поставщиков, сотрудников
- Финансовые модули, дашборд
- Drag-n-drop (`@hello-pangea/dnd`)
- POS/касса
- Блок лояльности клиента (нет прав у роли FLORIST)

---

## 4. Инициализация проекта

```bash
# В корне frontend/
pnpm create vite apps/florist --template react-ts
cd apps/florist

# Production dependencies
pnpm add axios @tanstack/react-query zustand lucide-react \
         react-hook-form zod date-fns idb react-hot-toast

# Dev dependencies
pnpm add -D vite-plugin-pwa tailwindcss @tailwindcss/vite @types/node

# shadcn/ui (Neutral, CSS variables: Yes)
npx shadcn@latest init
npx shadcn@latest add button input badge card dialog sheet skeleton avatar alert
```

### `vite.config.ts` — PWA

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Florify — Флорист',
        short_name: 'Florify',
        theme_color: '#3D7A5E',
        background_color: '#F8F8F6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/orders',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/orders/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'orders-cache', expiration: { maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: /\/api\/v1\/inventory/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'inventory-cache', expiration: { maxAgeSeconds: 3600 } },
          },
        ],
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
```

---

## 5. Дизайн-система и UI

### CSS-переменные (скопировать из admin)

```css
/* globals.css */
:root {
  --color-brand:           #3D7A5E;
  --color-status-new:      #3B82F6;   /* синий — CONFIRMED */
  --color-status-progress: #F59E0B;   /* жёлтый — IN_PROGRESS */
  --color-status-ready:    #10B981;   /* зелёный — READY */
  --color-status-delivery: #8B5CF6;   /* фиолетовый — OUT_FOR_DELIVERY */

  /* Склад */
  --color-stock-ok:      #10B981;     /* ≥ 5 единиц */
  --color-stock-low:     #F59E0B;     /* 1–4 единицы или срок ≤ 3 дней */
  --color-stock-zero:    #EF4444;     /* 0 единиц */
  --color-stock-expired: #7C3AED;     /* партия истекла */
}
```

### Mobile-first правила

- Touch target минимум **44px** для всех кнопок и строк
- Шрифт основного текста `text-base` (16px)
- Кнопки действий — всегда **full-width** на мобиле
- Bottom Tab Bar: высота 64px, иконка 24px + подпись 12px
- Шрифты: **Golos Text** для всего, **JetBrains Mono** для ID заказов

---

## 6. Аутентификация

### `LoginPage.tsx`

- Центрированная карточка на `--color-bg-canvas`
- Поля: email + password (React Hook Form + Zod)
- `POST /api/v1/auth/login` → `{ accessToken, refreshToken, userId, roles }`
- После логина: проверить что `roles` содержит `FLORIST` или `CASHIER`
- `GET /api/v1/auth/me` → сохранить `firstName + lastName` в authStore для отображения в TopBar
- При 401 — inline-ошибка, не toast

### `authStore.ts` (расширить копию из admin)

```ts
interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  roles: Role[]
  displayName: string | null   // ← добавить: firstName + lastName из /auth/me
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string) => void
  setUser: (userId: string, roles: Role[], name: string) => void
  logout: () => void
}
```

### `ProtectedRoute.tsx`

```tsx
// Нет токена → /login
// Роль не FLORIST и не CASHIER → <AccessDenied />
// Иначе → <Outlet />
```

---

## 7. App Shell — каркас приложения

### TopBar (56px)

```
┌────────────────────────────────────────┐
│ 🌿 Florify  │  Иван П.  │  🟠 Офлайн  │
└────────────────────────────────────────┘
```

- Логотип + название слева
- Имя флориста из `authStore.displayName` (заполняется после `/auth/me` при логине)
- Справа: индикатор онлайн/офлайн + badge «N ожидают» при pending-мутациях
- Если `pendingCount > 0` → жёлтый пульсирующий badge

### Bottom Tab Bar (64px) / Боковая навигация на планшете ≥768px

| Таб | Роут | Иконка lucide |
|---|---|---|
| Заказы | `/orders` | `ClipboardList` |
| Склад | `/inventory` | `Package` |
| Профиль | `/profile` | `User` |

### Offline Banner

```
🔴  Офлайн-режим. Данные на 14:23. Изменения отправятся автоматически.
```

```ts
// offlineStore.ts (Zustand)
interface OfflineState {
  isOnline: boolean
  pendingCount: number
  lastSyncAt: Date | null
}
```

---

## 8. Канбан флориста

### Концепция (уточнённая)

Флорист видит **ВСЕ заказы магазина** по статусам. Свои — визуально выделены полоской. Это даёт полную картину очереди и позволяет подхватить незанятые заказы.

| Колонка | Статус API | Цвет | Действие |
|---|---|---|---|
| Назначено | `CONFIRMED` | синий | «Взять в работу» |
| Собираю | `IN_PROGRESS` | жёлтый | «Букет готов» |
| Готово | `READY` | зелёный | (только просмотр) |

### API — 3 параллельных запроса с polling

```ts
// useFloristKanban.ts
export function useFloristKanban() {
  const opts = { refetchInterval: 30_000, staleTime: 15_000 }
  return {
    confirmed:  useQuery({ queryKey: ['kanban', 'CONFIRMED'],  queryFn: () => ordersApi.getKanban({ status: 'CONFIRMED',  limit: 50 }), ...opts }),
    inProgress: useQuery({ queryKey: ['kanban', 'IN_PROGRESS'], queryFn: () => ordersApi.getKanban({ status: 'IN_PROGRESS', limit: 50 }), ...opts }),
    ready:      useQuery({ queryKey: ['kanban', 'READY'],      queryFn: () => ordersApi.getKanban({ status: 'READY',      limit: 50 }), ...opts }),
  }
}
```

### `KanbanPage.tsx` — структура

На мобиле — горизонтальный scroll (CSS `scroll-snap-type: x mandatory`).  
На планшете ≥768px — flex-row с равными колонками.

```
┌──────────┬──────────┬──────────┐
│Назначено │Собираю   │Готово    │
│  (2)     │  (1)     │  (3)     │
│──────────│──────────│──────────│
│[OrderCard│[OrderCard│[OrderCard│
│ ...]     │ ...]     │ ...]     │
└──────────┴──────────┴──────────┘
```

### `OrderCard.tsx`

```
┌─────────────────────────────────┐
│ ● #aaax23000042    🚚 ДОСТАВКА  │  ← ● зелёный = мой заказ
│ 14:00–16:00                     │
│ Роза красн. × 15, Эустома × 5  │
│ Иван И.                         │
│                      [Взять →]  │
└─────────────────────────────────┘
```

Поля карточки из `OrderKanbanResponse`:
- `orderNumber` (JetBrains Mono)
- Слот доставки / тип (`DELIVERY`/`PICKUP`)
- Первые 2–3 позиции из `items[]`
- Имя клиента (`customerName`)
- Зелёная полоска слева если `assignedFloristId === authStore.userId`
- Кнопка по статусу: CONFIRMED → «Взять», IN_PROGRESS → «Готово», READY → нет кнопки

### Оптимистичное обновление (Мutations)

```ts
// «Взять в работу»
const takeMutation = useMutation({
  mutationFn: ({ orderId }: { orderId: string }) =>
    ordersApi.updateStatus(orderId, { status: 'IN_PROGRESS', floristId: authStore.userId }),
  onMutate: async ({ orderId }) => {
    await queryClient.cancelQueries({ queryKey: ['kanban', 'CONFIRMED'] })
    const prev = queryClient.getQueryData<KanbanItem[]>(['kanban', 'CONFIRMED'])
    // Убрать из CONFIRMED
    queryClient.setQueryData(['kanban', 'CONFIRMED'], (old: KanbanItem[]) =>
      old.filter(o => o.id !== orderId))
    return { prev }
  },
  onError: (_err, _vars, ctx) => {
    queryClient.setQueryData(['kanban', 'CONFIRMED'], ctx?.prev)
    toast.error('Не удалось взять заказ')
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['kanban'] }),
})
```

---

## 9. Детальная карточка заказа

Роут: `/orders/:orderId` — полноэкранная страница (не Sheet).  
API: `GET /api/v1/orders/{id}` — доступен FLORIST.

### Секции страницы

**1. Шапка**
```
← Назад                   #aaax23000042
                           [IN_PROGRESS badge]
```

**2. Состав букета** (из `order.items[]`)
```
Роза красная 60см   × 15   [Артикул: rose-60-red]
Эустома белая       × 5
Упаковка крафт      × 1
```

**3. Данные клиента** (из `order.customerName`, `order.guestPhone`)
```
Иван Иванов  +7 999 000-00-00
```
Блок лояльности (Gold/Silver) — **не отображать** (нет прав у FLORIST).  
Если `customerId == null` — «Гостевой заказ».

**4. Доставка** (только для `type == DELIVERY`)
```
📍 ул. Содружества, 4
   Комментарий: «Позвонить за 30 минут»
```

**5. Комментарий к заказу**

**6. Кнопки действий** (fixed bottom, full-width)
```
[ Взять в работу ]     ← только если CONFIRMED
[ Букет готов ]        ← только если IN_PROGRESS и assignedFloristId == myId
[ Открыть списание ]   ← всегда видна, открывает WriteOffModal
```

---

## 10. Real-time обновления

### Polling (основной механизм)

Все kanban-запросы имеют `refetchInterval: 30_000`. При возвращении вкладки в фокус (`refetchOnWindowFocus: true`) — немедленный перезапрос.

```ts
// В QueryClient (main.tsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 15_000,
    },
  },
})
```

### Индикатор «обновляется»

Показывать spinner в TopBar пока `isFetching` хотя бы одного из kanban-запросов:

```tsx
const isRefreshing = confirmed.isFetching || inProgress.isFetching || ready.isFetching
// → маленький CircleLoader рядом с именем в TopBar
```

### Инвалидация после мутаций

После `takeOrder()` и `markReady()` — принудительно `invalidateQueries({ queryKey: ['kanban'] })`.

---

## 11. Склад — просмотр остатков

### `InventoryPage.tsx`

API: `GET /api/v1/inventory/balance/all` (без `storeId` — бэкенд возвращает всё)  
Доступ: FLORIST ✅

```
Поиск: [🔍 Роза ...]

Роза красная 60см                    ▓▓▓▓░  52 шт
WAC: 89.00 ₽                        [срок: 28.04] 🟡

Эустома белая                        ░░░░░   0 шт
WAC: 45.00 ₽                                      🔴
```

Цветовая индикация количества:
- `quantity >= 5` → зелёный (ok)
- `1 ≤ quantity ≤ 4` → жёлтый (low)
- `quantity == 0` → красный (zero)
- Есть батч с `expiresAt ≤ today + 3` → жёлтый badge «Истекает»

Фильтры:
- Поиск по названию (фронтенд-фильтр по `productName`)
- Переключатель «Только критические» (zero + low + expired)

### `InventoryDetailPage.tsx`

Роут: `/inventory/:productId`  
API:
- `GET /api/v1/inventory/balance/{productId}`
- `GET /api/v1/inventory/batches/{productId}`
- `GET /api/v1/inventory/transactions/{productId}`

Секции страницы:

**Итого по товару:** количество, WAC  
**Партии (батчи):**
```
Партия #1   Количество: 30 шт   Срок: 28.04   ✅ ACTIVE
Партия #2   Количество: 22 шт   Срок: 25.04   🟡 Истекает
```

Поля батча из `StockBatchDto`: `id, quantity, expiresAt, status (ACTIVE/EXPIRED/DEPLETED)`

**Кнопка:** «Списать» → открывает `WriteOffModal` с предзаполненным `productId`

---

## 12. Списание товара (WriteOff)

### `WriteOffModal.tsx` (адаптация из admin)

**3 поля:**

```
Товар:      [Роза красная 60см ▼]   ← productId (предзаполнен если открыт из InventoryDetail)
Количество: [____]
Причина:    [SPOILAGE ▼]            ← enum
```

**Причины списания из `WriteOffReason`:**

| Значение API | Отображение |
|---|---|
| `SPOILAGE` | Увядание / сгнил |
| `DAMAGE` | Поломка / повреждение |
| `INVENTORY_LOSS` | Недостача (инвентаризация) |

> `SALE` — автоматическое списание при заказе, не показывать в ручном форме.

**Валидация (Zod):**
```ts
const schema = z.object({
  productId:  z.string().uuid(),
  quantity:   z.number().positive().max(10000),
  reason:     z.enum(['SPOILAGE', 'DAMAGE', 'INVENTORY_LOSS']),
  comment:    z.string().max(500).optional(),
})
```

**API:** `POST /api/v1/inventory/write-off` — FLORIST ✅

**Офлайн:** если сети нет → `enqueue('write-off', payload)` в offlineQueue, показать toast «Сохранено офлайн».

---

## 13. Инвентаризация

### Концепция (упрощённая для диплома)

FLORIST имеет доступ только к `write-off`. Значит инвентаризация = ввод фактических остатков + автоматический расчёт и **списание недостач**.

```
Товар                Системно   Фактически   Разница
Роза кр. 60см           52        [  50  ]     -2  ← спишем
Эустома бел.            30        [  31  ]     +1  ← «Обратитесь к администратору»
Гипсофила               15        [  15  ]      0
```

### `InventoryAuditPage.tsx`

- Загружает всю таблицу товаров `GET /api/v1/inventory/balance/all`
- Для каждого товара — поле ввода «Фактически»
- Кнопка «Применить корректировки»
  - Для каждого товара где `actual < system` → `POST /api/v1/inventory/write-off` с `reason: INVENTORY_LOSS` и `quantity = system - actual`
  - Для каждого товара где `actual > system` → показать предупреждение «Излишек: сообщите администратору»
  - Для каждого товара где `actual == system` → пропустить

**Офлайн:** все write-off записи уходят в `offlineQueue` и отправляются при восстановлении сети.

---

## 14. Профиль и табель (Clock In/Out)

### `ProfilePage.tsx`

**Секция профиля:**
```
👤  Иван Петров
    ivan@florify.ru
    Роль: Флорист
```

Данные из `authStore.displayName + authStore.userId`.  
Кнопка «Сменить пароль» → `PUT /api/v1/auth/password`.

**Секция табеля:**

```
Сегодня: 09:02 — ...
Статус: Смена открыта ✅

[ Начать смену ]   [ Завершить смену ]
```

API:
- `POST /api/v1/timesheet/checkin`  — body: `{ employeeId: UUID }`
- `POST /api/v1/timesheet/checkout` — body: `{ employeeId: UUID }`
- `GET  /api/v1/timesheet?employeeId=&month=`

> ⚠️ **Важный нюанс:** поле `employeeId` в timesheet-запросах — это ID сущности из `employee-service`, который может отличаться от `userId` из `auth-service`. Для диплома проверить, совпадают ли UUID: если да (единая UUID-стратегия в монорепо) — используй `authStore.userId`. Если нет — потребуется отдельный вызов или хранение `employeeId` при логине.

**Секция PWA:**
```
[ 📲 Установить приложение ]   ← только если beforeinstallprompt сработал
```

**Кнопка выхода:**
- `POST /api/v1/auth/logout`
- Очистить `authStore`, redirect на `/login`

---

## 15. PWA — офлайн, установка

### «Добавить на рабочий стол»

```ts
// usePWAInstall.ts
const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

useEffect(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    setDeferredPrompt(e as BeforeInstallPromptEvent)
  })
}, [])

const install = () => {
  deferredPrompt?.prompt()
  deferredPrompt?.userChoice.then(() => setDeferredPrompt(null))
}
```

Показать кнопку в `ProfilePage` если `deferredPrompt !== null`.

### Service Worker — стратегии кеширования

| Ресурс | Стратегия |
|---|---|
| HTML/JS/CSS (статика) | `CacheFirst` |
| `GET /api/v1/orders/kanban` | `StaleWhileRevalidate` |
| `GET /api/v1/inventory/balance/all` | `StaleWhileRevalidate` |
| `POST /api/v1/inventory/write-off` | NetworkFirst + offline queue |
| `PUT /api/v1/orders/{id}/status` | NetworkFirst + offline queue |

---

## 16. IndexedDB и офлайн-очередь

### `src/lib/db.ts`

```ts
import { openDB, DBSchema } from 'idb'

interface FloristDB extends DBSchema {
  orders: {
    key: string
    value: OrderKanbanResponse & { cachedAt: number }
    indexes: { 'by-status': string }
  }
  inventory: {
    key: string
    value: EnhancedStockBalanceResponse & { cachedAt: number }
  }
  offlineQueue: {
    key: number
    value: {
      id?: number
      type: 'write-off' | 'status-change' | 'clock-in' | 'clock-out' | 'audit'
      payload: unknown
      createdAt: number
      attempts: number
    }
  }
}

export const db = await openDB<FloristDB>('florify-v1', 1, {
  upgrade(db) {
    const orders = db.createObjectStore('orders', { keyPath: 'id' })
    orders.createIndex('by-status', 'status')
    db.createObjectStore('inventory', { keyPath: 'productId' })
    db.createObjectStore('offlineQueue', { autoIncrement: true, keyPath: 'id' })
  },
})
```

### `src/lib/offlineQueue.ts`

```ts
export async function enqueue(type: string, payload: unknown) {
  await db.add('offlineQueue', { type, payload, createdAt: Date.now(), attempts: 0 })
  offlineStore.getState().incrementPending()
}

export async function flushQueue() {
  const all = await db.getAll('offlineQueue')
  for (const item of all) {
    try {
      await sendMutation(item)         // диспетчер по type
      await db.delete('offlineQueue', item.id!)
      offlineStore.getState().decrementPending()
    } catch {
      await db.put('offlineQueue', { ...item, attempts: item.attempts + 1 })
    }
  }
}

window.addEventListener('online', () => flushQueue())
```

---

## 17. Роутинг и защита маршрутов

```tsx
// router.tsx
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute allowedRoles={['FLORIST', 'CASHIER']} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/',                      element: <Navigate to="/orders" replace /> },
          { path: '/orders',                element: <KanbanPage /> },
          { path: '/orders/:id',            element: <OrderDetailPage /> },
          { path: '/inventory',             element: <InventoryPage /> },
          { path: '/inventory/:productId',  element: <InventoryDetailPage /> },
          { path: '/inventory/audit',       element: <InventoryAuditPage /> },
          { path: '/profile',               element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/orders" replace /> },
])
```

---

## 18. Порядок реализации

### Шаг 1 — Фундамент (база проекта)

- Создать `apps/florist` через Vite (react-ts)
- Настроить Tailwind + CSS переменные (скопировать из admin `globals.css`)
- Подключить VitePWA plugin с базовым `manifest.json`
- Вынести или симлинковать `packages/shared/api/` — скопировать из admin: `client.ts`, `ordersApi.ts`, `inventoryApi.ts`, `authApi.ts`, `schema.ts`
- Скопировать `authStore.ts` из admin, расширить полем `displayName`
- Создать `offlineStore.ts` с `isOnline + pendingCount`

### Шаг 2 — Аутентификация

- `LoginPage.tsx` — центрированная форма, `POST /api/v1/auth/login`
- После логина: `GET /api/v1/auth/me` для получения имени флориста → сохранить в `authStore.displayName`
- `ProtectedRoute.tsx` — проверка ролей FLORIST/CASHIER
- `router.tsx` — базовый роутинг

### Шаг 3 — App Shell

- `AppShell.tsx` — TopBar + Bottom Tab Bar + Offline Banner
- TopBar: имя из `authStore.displayName`, индикатор онлайн/офлайн
- Bottom Tabs: /orders, /inventory, /profile
- Offline Banner: банер при `!isOnline`

### Шаг 4 — Канбан (главный экран, MVP)

- `useFloristKanban.ts` — 3 параллельных `useQuery` с `refetchInterval: 30s`
- `KanbanPage.tsx` — 3 колонки, горизонтальный scroll на мобиле
- `OrderCard.tsx` — touch-friendly карточка, зелёный индикатор «мой заказ»
- Оптимистичное обновление: «Взять в работу» → `PUT /status { status: IN_PROGRESS, floristId: userId }`
- Оптимистичное обновление: «Букет готов» → `PUT /status { status: READY }`

### Шаг 5 — Детальная карточка заказа

- `OrderDetailPage.tsx` — полноэкранная, `GET /api/v1/orders/{id}`
- Состав букета, данные клиента (без лояльности), адрес доставки, комментарий
- Кнопки «Взять в работу» / «Букет готов» / «Открыть списание»
- Кнопка «Назад» в шапке

### Шаг 6 — Polling как real-time

- Убедиться что `refetchOnWindowFocus: true` работает
- Добавить индикатор «обновляется» (spinner в TopBar при `isFetching`)
- Инвалидация `['kanban']` после каждой мутации статуса

> ✅ **Шаги 1–6 = MVP для защиты диплома**

---

### Шаг 7 — Склад

- `InventoryPage.tsx` — список с цветовыми индикаторами, поиск, фильтр «критические»
- `InventoryDetailPage.tsx` — детали товара: батчи + история транзакций
- `WriteOffModal.tsx` — 3 поля (товар, количество, причина из SPOILAGE/DAMAGE/INVENTORY_LOSS)

### Шаг 8 — IndexedDB + офлайн-очередь

- `src/lib/db.ts` — схема IndexedDB
- Кеширование заказов и склада при успешных fetch
- `offlineQueue.ts` — `enqueue()` + `flushQueue()`
- WriteOff при офлайне — enqueue вместо HTTP-запроса
- `window.addEventListener('online', flushQueue)`

### Шаг 9 — Инвентаризация

- `InventoryAuditPage.tsx` — таблица с вводом фактических остатков
- Логика: `actual < system` → write-off с `INVENTORY_LOSS`
- Предупреждение при излишке: «Обратитесь к администратору»
- Офлайн-режим: write-off корректировки попадают в offlineQueue

### Шаг 10 — Профиль, табель, PWA

- `ProfilePage.tsx` — данные из authStore, кнопка выхода
- Часы (Clock In/Out): `POST /api/v1/timesheet/checkin|checkout`
  - Проверить совпадение `userId == employeeId` на реальном бэкенде
- `usePWAInstall.ts` — кнопка «Установить» при `beforeinstallprompt`
- PWA иконки: 192×192 и 512×512 в `/public/icons/`
- Финальное тестирование офлайн-режима (DevTools → Network → Offline)

---

## Итоговая таблица API-эндпоинтов для florist

| Endpoint | Метод | Роль FLORIST | Используется |
|---|---|---|---|
| `/api/v1/auth/login` | POST | ✅ | Логин |
| `/api/v1/auth/me` | GET | ✅ | Имя в TopBar |
| `/api/v1/auth/logout` | POST | ✅ | Выход |
| `/api/v1/auth/password` | PUT | ✅ | Смена пароля |
| `/api/v1/orders/kanban?status=&limit=` | GET | ✅ | Канбан (3 запроса) |
| `/api/v1/orders/{id}` | GET | ✅ | Детальная карточка |
| `/api/v1/orders/{id}/status` | PUT | ✅ | Взять/Готово (с floristId в теле) |
| `/api/v1/inventory/balance/all` | GET | ✅ | Список склада |
| `/api/v1/inventory/balance/{productId}` | GET | ✅ | Детали товара |
| `/api/v1/inventory/batches/{productId}` | GET | ✅ | Партии товара |
| `/api/v1/inventory/transactions/{productId}` | GET | ✅ | История товара |
| `/api/v1/inventory/write-off` | POST | ✅ | Списание |
| `/api/v1/inventory/write-offs` | GET | ✅ | История списаний |
| `/api/v1/inventory/receive` | POST | ❌ | Недоступно FLORIST |
| `/api/v1/loyalty/accounts/{customerId}` | GET | ❌ | Недоступно FLORIST |
| `/api/v1/timesheet/checkin` | POST | ✅ | Clock In |
| `/api/v1/timesheet/checkout` | POST | ✅ | Clock Out |
| `/api/v1/timesheet?employeeId=&month=` | GET | ✅ | История табеля |
| `/api/v1/orders/stream` | GET | — | Не реализован → polling |
| `/api/v1/notifications/subscribe` | POST | — | Не реализован → пропустить |

---

*Florist PWA Plan v2.0 — FlowerOS*  
*Актуализировано по production-коду бэкенда*
