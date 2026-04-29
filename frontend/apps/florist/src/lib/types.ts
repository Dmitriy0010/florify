export type UserRole = 'FLORIST' | 'CASHIER' | 'ADMIN' | 'OWNER' | 'MANAGER' | string;

export type OrderStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | string;
export type WriteOffReason = 'SPOILAGE' | 'DAMAGE' | 'INVENTORY_LOSS';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  roles: UserRole[];
}

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: UserRole[];
}

export interface OrderKanbanItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName?: string;
  assignedFloristId?: string | null;
  type?: 'DELIVERY' | 'PICKUP' | string;
  deliverySlot?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  finalAmount?: number;
  createdAt?: string;
  items?: Array<{
    productId?: string;
    productName?: string;
    quantity?: number;
    sku?: string;
  }>;
}

export interface OrderDetail extends OrderKanbanItem {
  comment?: string;
  customerId?: string | null;
  guestPhone?: string;
  deliveryComment?: string;
}

export interface EnhancedStockBalanceResponse {
  productId: string;
  productName: string;
  quantity: number;
  averageCost: number;
  unit?: string;
  batches?: StockBatchDto[];
}

export interface StockBatchDto {
  id: string;
  quantity: number;
  expiresAt?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | string;
}

export interface StockTransaction {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'WRITE_OFF' | 'ADJUSTMENT' | string;
  quantity: number;
  totalValue: number;
  writeOffReason?: string;
  comment?: string;
  createdAt: string;
}

export interface WriteOffPayload {
  productId: string;
  quantity: number;
  reason: WriteOffReason;
  comment?: string;
  sourceDocumentId?: string;
  storeId?: string;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  checkInAt?: string;
  checkOutAt?: string;
  date?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  unit: string;
  currentPrice: number;
  imageUrl?: string;
  active: boolean;
}

export interface CreateOrderRequest {
  storeId: string;
  customerId?: string;
  bonusPointsUsed?: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    notes?: string;
  }>;
  type?: string;
  source?: string;
  paymentMethod?: string;
  deliverySlot?: string;
  deliveryAddress?: string;
  comment?: string;
}

export type OfflineMutationType =
  | 'write-off'
  | 'status-change'
  | 'clock-in'
  | 'clock-out'
  | 'inventory-audit';

export interface OfflineMutation<TPayload = unknown> {
  id?: number;
  type: OfflineMutationType;
  payload: TPayload;
  createdAt: number;
  attempts: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  loyaltyTier?: string;
  active: boolean;
}

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  activePoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  tier: string;
}

export interface LoyaltyTransaction {
  id: string;
  accountId: string;
  points: number;
  type: 'EARNED' | 'SPENT' | 'EXPIRED' | 'ADJUSTMENT';
  description: string;
  createdAt: string;
}
