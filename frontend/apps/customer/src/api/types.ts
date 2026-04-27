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

export interface PagedResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ProductsFilters {
  categoryId?: string
  searchTerm?: string
  active?: boolean
  page?: number
  size?: number
}

// --- Order Enums ---
export type OrderStatus = 'NEW' | 'ASSEMBLING' | 'READY' | 'DELIVERY' | 'COMPLETED' | 'CANCELLED'
export type OrderType = 'DELIVERY' | 'PICKUP'
export type OrderSource = 'WEBSITE' | 'MOBILE_APP' | 'POS' | 'TELEGRAM'
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
  items: { productId: string; quantity: number }[]
  guestPhone?: string
  guestName?: string
  type: OrderType
  source: OrderSource
  paymentMethod: PaymentMethod
  deliveryAddress?: string
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
