export type UserRole = 'COURIER' | 'FLORIST' | 'CASHIER' | 'ADMIN' | 'OWNER' | 'MANAGER' | string;

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

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  checkInAt?: string;
  checkOutAt?: string;
  date?: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  guestPhone?: string;
  guestName?: string;
  type?: 'DELIVERY' | 'PICKUP' | string;
  deliverySlot?: string;
  deliveryAddress?: string;
  deliveryComment?: string;
  totalAmount?: number;
  finalAmount?: number;
  createdAt?: string;
  isPaid?: boolean;
  paymentMethod?: string;
  comment?: string;
  items?: Array<{
    productId?: string;
    productName?: string;
    quantity?: number;
    sku?: string;
    unitPrice?: number;
    lineTotal?: number;
  }>;
}
