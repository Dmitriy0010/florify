export interface Category {
  id: string
  name: string
  description: string
  active: boolean
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string
  categoryId: string
  unit: string
  currentPrice: number
  imageUrl: string
  defaultShelfLifeDays: number
  active: boolean
  version: number
}

export interface DeliverySlot {
  id: string
  startTime: string
  endTime: string
  capacity: number
  remainingCapacity: number
  active: boolean
}

export interface PagedResult<T> {
  data: T[]

  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ProductsFilters {
  categoryId?: string
  storeId?: string
  searchTerm?: string
  active?: boolean
  page?: number
  size?: number
}

// --- Order Enums ---
export type OrderStatus = 'NEW' | 'ASSEMBLING' | 'READY' | 'DELIVERY' | 'COMPLETED' | 'CANCELLED'
export type OrderType = 'DELIVERY' | 'PICKUP'
export type OrderSource = 'WEB' | 'MOBILE' | 'POS' | 'PARTNER'
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  type: OrderType
  paymentMethod: PaymentMethod
  isPaid: boolean
  createdAt: string
}

export interface CreateOrderRequest {
  storeId: string
  items: { productId: string; quantity: number }[]
  guestPhone?: string
  guestName?: string
  type: OrderType
  source: OrderSource
  paymentMethod: PaymentMethod
  deliveryAddress?: string
  bonusPointsUsed?: number
}

// --- Auth DTOs ---

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}

export interface User {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
  roles: { id: string; name: string }[]
}

// --- Loyalty DTOs ---

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface LoyaltyAccount {
  id: string
  customerId: string
  tier: LoyaltyTier
  pointsBalance: number
  reservedPoints: number
  availablePoints: number
  totalSpent: number
  updatedAt: string
}

export interface LoyaltyTierInfo {
  tier: LoyaltyTier
  tierRank: number
  minSpend: number
  pointsPerHundred: number
  discountPercent: number
}

export interface LoyaltyTransaction {
  id: string
  orderId?: string
  type: 'EARN' | 'WITHDRAW' | 'RESERVE' | 'CANCEL_RESERVE' | 'EXPIRE'
  points: number
  description: string
  occurredAt: string
}

