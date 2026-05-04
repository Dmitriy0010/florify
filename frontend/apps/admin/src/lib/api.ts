import { components } from './api/types.generated';
import { apiClient as api } from './api/client';

// ============================================================
// SHARED TYPES
// ============================================================

/** Пагинация — большинство сервисов (data + page + size + totalElements) */
export interface PagedResult<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
}

/** Пагинация — customer-service использует content вместо data */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ============================================================
// AUTH TYPES (соответствие: auth-service)
// ============================================================

export type TokenResponse = components['schemas']['TokenResponse'];
export type RegisterRequest = components['schemas']['RegisterRequest'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type UserResponse = components['schemas']['UserResponse'];

// ============================================================
// STORE TYPES (соответствие: store-service)
// ============================================================

export type Store = components['schemas']['StoreResponse'];

// ============================================================
// ANALYTICS TYPES (соответствие: analytics-service DashboardResult)
// ============================================================

/** Точное соответствие DashboardResult из бэкенда */
export type DashboardStats = components['schemas']['DashboardResult'];
export type SalesDataPoint = components['schemas']['SalesDataPoint'];
export type SalesReportResult = components['schemas']['SalesReportResult'];
export type TopProductItem = components['schemas']['TopProductItem'];
export type TopProductsResult = components['schemas']['TopProductsResult'];
export type EmployeePerformanceItem = components['schemas']['EmployeePerformanceItem'];
export type EmployeePerformanceResult = components['schemas']['EmployeePerformanceResult'];
export type CustomerStatsResult = components['schemas']['CustomerStatsResult'];
export type InventoryStatsResult = components['schemas']['InventoryStatsResult'];

// ============================================================
// PRODUCT / CATALOG TYPES (соответствие: product-catalog-service)
// ============================================================

export type ProductCategory = components['schemas']['CategoryResponse'];

/** Точное соответствие ProductResponse */
export type Product = components['schemas']['ProductResponse'];
export type CreateProductRequest = components['schemas']['CreateProductRequest'];
export type UpdateProductRequest = components['schemas']['UpdateProductRequest'];

// ============================================================
// ORDER TYPES (соответствие: order-service)
// ============================================================

/** Все 8 статусов заказа из бэкенда */
export type OrderStatus = components['schemas']['OrderResponse']['status'];
export type OrderItemDto = components['schemas']['OrderItemDto'];
export type CreateOrderRequest = components['schemas']['CreateOrderRequest'];
export type OrderResponse = components['schemas']['OrderResponse'];

/** Точное соответствие OrderKanbanResponse — только эти поля! */
export type OrderKanbanResponse = components['schemas']['OrderKanbanResponse'];

// ============================================================
// CUSTOMER TYPES (соответствие: customer-service)
// ============================================================

export type CustomerSummary = components['schemas']['CustomerSummaryResponse'];
export type CustomerResponse = components['schemas']['CustomerResponse'];
export type CreateCustomerRequest = components['schemas']['CreateCustomerRequest'];
export type UpdateCustomerRequest = components['schemas']['UpdateCustomerRequest'];

// ============================================================
// LOYALTY TYPES (соответствие: customer-service LoyaltyController)
// ============================================================

export type LoyaltyAccount = components['schemas']['LoyaltyAccountResponse'];
export type LoyaltyTransaction = components['schemas']['LoyaltyTransactionResponse'];

/** Точное соответствие LoyaltyTierInfoResponse */
export type LoyaltyTierInfo = components['schemas']['LoyaltyTierInfoResponse'];

// ============================================================
// INVENTORY TYPES (соответствие: inventory-service)
// ============================================================

/** Точное соответствие EnhancedStockBalanceResponse */
export type InventoryItem = components['schemas']['EnhancedStockBalanceResponse'] & {
  id?: string;
  productId?: string;
  name?: string;
  categoryName?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  averageCost?: number;
  minThreshold?: number;
  imageUrl?: string;
  batches?: any[];
};

export interface StockTransaction {
  id: string;
  productId: string;
  storeId: string;
  type: 'INBOUND' | 'OUTBOUND' | 'WRITE_OFF' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  costBasis: number;
  totalValue: number;
  writeOffReason?: string;
  comment?: string;
  sourceDocumentId?: string;
  createdAt: string;
}

// ============================================================
// EMPLOYEE TYPES (соответствие: employee-service)
// ============================================================

export type EmployeeRole = components['schemas']['EmployeeResponse']['role'];

/** Точное соответствие EmployeeResponse */
export interface Employee {
  id: string;
  userId: string;
  storeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'FLORIST' | 'CASHIER' | 'COURIER' | 'MANAGER' | 'ADMIN' | 'OWNER';
  hireDate: string;
  dismissDate?: string;
  active: boolean;
  avatarUrl?: string;
}

export interface CreateEmployeeRequest {
  userId: string;
  storeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  hireDate: string;
}

export interface UpdateEmployeeRequest {
  storeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  active: boolean;
  avatarUrl?: string;
}

// ============================================================
// TIMESHEET TYPES (соответствие: employee-service TimesheetController)
// ============================================================

export type TimesheetEntry = components['schemas']['TimesheetEntryResponse'];

// ============================================================
// SALARY TYPES (соответствие: employee-service SalaryController)
// ============================================================

export type SalaryType = components['schemas']['SalaryConfigResponse']['type'];
export type SalaryStatus = components['schemas']['SalaryStatementResponse']['status'];

/** Точное соответствие SalaryStatementResponse */
export type SalaryStatement = components['schemas']['SalaryStatementResponse'];
export type SalaryConfig = components['schemas']['SalaryConfigResponse'];

// ============================================================
// SUPPLIER TYPES (соответствие: supplier-service)
// ============================================================

export type PaymentTerms = components['schemas']['SupplierResponse']['paymentTerms'];

/** Точное соответствие SupplierSummaryResponse (список) */
export type SupplierSummary = components['schemas']['SupplierSummaryResponse'];

/** Точное соответствие SupplierResponse (детали) */
export type Supplier = components['schemas']['SupplierResponse'];
export type CreateSupplierRequest = components['schemas']['CreateSupplierRequest'];

// ============================================================
// INVOICE TYPES (соответствие: supplier-service InvoiceController)
// ============================================================

export type InvoiceStatus = components['schemas']['InvoiceResponse']['status'];

/** Точное соответствие InvoiceItemResponse */
export type InvoiceItem = components['schemas']['InvoiceItemResponse'];

/** Точное соответствие InvoiceResponse */
export type Invoice = components['schemas']['InvoiceResponse'] & {
  storeId?: string;
};

/** Точное соответствие CreateInvoiceItemRequest */
export type CreateInvoiceItemRequest = components['schemas']['CreateInvoiceItemRequest'];
export type CreateInvoiceRequest = components['schemas']['CreateInvoiceRequest'];

/** Точное соответствие ReceiveInvoiceItemRequest */
export type ReceiveInvoiceItemRequest = components['schemas']['ReceiveInvoiceItemRequest'];

// ============================================================
// DELIVERY TYPES (соответствие: delivery-service)
// ============================================================

export type DeliveryTaskStatus = components['schemas']['DeliveryTaskResponse']['status'];

/** Точное соответствие DeliveryTaskResponse */
export type DeliveryTask = components['schemas']['DeliveryTaskResponse'];

/** Точное соответствие DeliverySlotResponse */
export type DeliverySlot = components['schemas']['DeliverySlotResponse'];

/** Точное соответствие DeliveryZoneResponse */
export type DeliveryZone = components['schemas']['DeliveryZoneResponse'];

// ============================================================
// FINANCE TYPES (соответствие: finance-service)
// ============================================================

/** Точное соответствие PnlReportResponse */
export type PnlReportResponse = components['schemas']['PnlReportResponse'];

// ============================================================
// MEDIA TYPES (соответствие: media-service)
// ============================================================

export type MediaUploadResponse = components['schemas']['MediaUploadResponse'];

// ============================================================
// NOTIFICATION TYPES (соответствие: notification-service)
// ============================================================

export type NotificationTemplate = components['schemas']['NotificationTemplateResponse'];
export type NotificationLog = components['schemas']['NotificationLogResponse'];

// ============================================================
// API SERVICES
// ============================================================

export const AuthService = {
  login: (data: LoginRequest) => api.post<TokenResponse>('/v1/auth/login', data),
  register: (data: RegisterRequest) => api.post<TokenResponse>('/v1/auth/register', data),
  logout: (refreshToken: string) => api.post('/v1/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => api.post<TokenResponse>('/v1/auth/refresh', { refreshToken }),
  me: () => api.get<UserResponse>('/v1/auth/me'),
  assignRole: (userId: string, role: string) => api.put(`/v1/auth/users/${userId}/role`, { role }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/v1/auth/password', { currentPassword, newPassword }),
  getUser: (id: string) => api.get<UserResponse>(`/v1/auth/users/${id}`),
};

export const StoreService = {
  getAll: (params?: { includeInactive?: boolean }) => api.get<Store[]>('/v1/stores', { params }),
  getById: (id: string) => api.get<Store>(`/v1/stores/${id}`),
  create: (data: Partial<Store>) => api.post<Store>('/v1/stores', data),
  update: (id: string, data: Partial<Store>) => api.put<Store>(`/v1/stores/${id}`, data),
  delete: (id: string) => api.delete(`/v1/stores/${id}`),
};

export const CatalogService = {
  getProducts: (params?: { categoryId?: string; searchTerm?: string; active?: boolean; page?: number; size?: number }) =>
    api.get<PagedResult<Product>>('/v1/catalog/products', { params }),
  getProduct: (id: string) => api.get<Product>(`/v1/catalog/products/${id}`),
  createProduct: (data: CreateProductRequest) => api.post<Product>('/v1/catalog/products', data),
  updateProduct: (id: string, data: UpdateProductRequest) => api.put<Product>(`/v1/catalog/products/${id}`, data),
  updatePrice: (id: string, newPrice: number, reason?: string) =>
    api.patch<Product>(`/v1/catalog/products/${id}/price`, { newPrice, reason }),
  deactivateProduct: (id: string) => api.delete(`/v1/catalog/products/${id}`),
  activateProduct: (id: string) => api.post<Product>(`/v1/catalog/products/${id}/activate`),
  deleteProduct: (id: string) => api.delete(`/v1/catalog/products/${id}`),
  getCategories: () => api.get<ProductCategory[]>('/v1/catalog/categories'),
  createCategory: (data: { name: string; description?: string }) => api.post<ProductCategory>('/v1/catalog/categories', data),
  updateCategory: (id: string, data: { name: string; description?: string }) => api.put<ProductCategory>(`/v1/catalog/categories/${id}`, data),
  bulkPriceUpdate: (categoryId: string, markupPercent: number) =>
    api.post('/v1/catalog/products/bulk-price-update', { categoryId, markupPercent }),
};

export const CustomerService = {
  /** Возвращает PagedResponse с полем 'content' (не 'data'!) */
  list: (params?: { page?: number; size?: number; phone?: string }) =>
    api.get<PagedResponse<CustomerSummary>>('/v1/customers', { params }),
  search: (phone: string) =>
    api.get<PagedResponse<CustomerSummary>>('/v1/customers', { params: { phone } }),
  getById: (id: string) => api.get<CustomerResponse>(`/v1/customers/${id}`),
  create: (data: CreateCustomerRequest) => api.post<CustomerResponse>('/v1/customers', data),
  update: (id: string, data: UpdateCustomerRequest) => api.put<CustomerResponse>(`/v1/customers/${id}`, data),
  deactivate: (id: string) => api.delete(`/v1/customers/${id}`),
};

export interface LoyaltyStats {
  totalEarnedPoints: number;
  totalSpentPoints: number;
  activePoints: number;
  recentTransactions: LoyaltyTransaction[];
}

export const LoyaltyService = {
  getTiers: () => api.get<LoyaltyTierInfo[]>('/v1/loyalty/tiers'),
  getStats: () => api.get<LoyaltyStats>('/v1/loyalty/stats'),
  getGlobalTransactions: () => api.get<LoyaltyTransaction[]>('/v1/loyalty/transactions/global'),
  getAccount: (customerId: string) => api.get<LoyaltyAccount>(`/v1/loyalty/accounts/${customerId}`),
  getTransactions: (customerId: string) => api.get<LoyaltyTransaction[]>(`/v1/loyalty/accounts/${customerId}/transactions`),
  getMyAccount: () => api.get<LoyaltyAccount>('/v1/loyalty/accounts/me'),
  adjustPoints: (customerId: string, data: { points: number; type: 'EARN' | 'WITHDRAW'; description?: string }) =>
    api.post(`/v1/loyalty/accounts/${customerId}/adjust`, data),
};

export interface WriteOffLogResponse {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  totalValue: number;
  reason: string;
  comment: string;
  createdAt: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  storeId: string;
  type: 'INBOUND' | 'WRITE_OFF' | 'SALE';
  quantity: number;
  costBasis: number;
  totalValue: number;
  writeOffReason?: string;
  comment?: string;
  sourceDocumentId: string;
  performerId: string;
  createdAt: string;
}

export interface StockBatchDto {
  id: string;
  supplierId?: string;
  supplierName?: string;
  quantityReceived: number;
  quantityRemaining: number;
  unitCost: number;
  receivedAt: string;
  expiresAt?: string;
  status: 'AVAILABLE' | 'DEPLETED' | 'EXPIRED' | 'CANCELLED';
  sourceDocumentId: string;
}

export const InventoryService = {
  getStocks: (storeId?: string, includeArchived = false) => {
    const params: any = {};
    if (storeId) params.storeId = storeId;
    if (includeArchived) params.includeArchived = true;
    return api.get<InventoryItem[]>('/v1/inventory/balance/all', { params });
  },
  getBalance: (productId: string, storeId?: string) =>
    api.get(`/v1/inventory/balance/${productId}`, { params: storeId ? { storeId } : {} }),
  receive: (data: { productId: string; storeId: string; quantity: number; purchasePrice: number; sourceDocumentId: string }) =>
    api.post('/v1/inventory/receive', data),
  writeOff: (data: { productId: string; storeId: string; quantity: number; reason?: 'SPOILAGE' | 'DAMAGE' | 'INVENTORY_LOSS'; comment?: string; sourceDocumentId: string }) =>
    api.post('/v1/inventory/write-off', data),
  getWriteOffLogs: () => api.get<WriteOffLogResponse[]>('/v1/inventory/write-offs'),
  getHistory: (productId: string, params?: { page?: number; size?: number }) =>
    api.get<PagedResult<StockTransaction>>(`/v1/inventory/transactions/${productId}`, { params }),
  getBatches: (productId: string) =>
    api.get<StockBatchDto[]>(`/v1/inventory/batches/${productId}`),
  getTransaction: (id: string) =>
    api.get<StockTransaction>(`/v1/inventory/transaction/${id}`),
};

export const EmployeeService = {
  getAll: (search?: string, active?: boolean, page = 0, size = 20) => {
    const params: any = { page, size };
    if (search) params.search = search;
    if (active !== undefined) params.active = active;
    return api.get<PagedResult<Employee>>('/v1/employees', { params });
  },
  getById: (id: string) => api.get<Employee>(`/v1/employees/${id}`),
  create: (data: CreateEmployeeRequest) => api.post<Employee>('/v1/employees', data),
  update: (id: string, data: UpdateEmployeeRequest) => api.put<Employee>(`/v1/employees/${id}`, data),
  dismiss: (employee: Employee) => api.put<Employee>(`/v1/employees/${employee.id}`, {
    storeId: employee.storeId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    phone: employee.phone,
    role: employee.role,
    active: false,
    avatarUrl: employee.avatarUrl,
  } as UpdateEmployeeRequest),
  getSalaryConfig: (id: string) => api.get<SalaryConfig>(`/v1/employees/${id}/salary-config`),
  upsertSalaryConfig: (id: string, data: {
    type: SalaryType;
    baseAmount: number;
    salesPercent: number;
    bonusPerOrder: number;
    validFrom: string;
  }) => api.put<SalaryConfig>(`/v1/employees/${id}/salary-config`, data),
};

export const TimesheetService = {
  list: (params: { employeeId?: string; month: string }) =>
    api.get<TimesheetEntry[]>('/v1/timesheet', { params }),
  checkin: (employeeId: string) => api.post<TimesheetEntry>('/v1/timesheet/checkin', { employeeId }),
  checkout: (employeeId: string) => api.post<TimesheetEntry>('/v1/timesheet/checkout', { employeeId }),
};

export const SalaryService = {
  getStatements: (params?: { employeeId?: string; period?: string; page?: number; size?: number }) =>
    api.get<PagedResult<SalaryStatement>>('/v1/salary/statements', { params }),
  calculate: (data: { employeeId: string; period: string }) =>
    api.post<SalaryStatement>('/v1/salary/statements/calculate', data),
  approve: (id: string) => api.put<SalaryStatement>(`/v1/salary/statements/${id}/approve`),
  paid(id: string) {
    return api.put<SalaryStatement>(`/v1/salary/statements/${id}/paid`)
  },
  adjust(id: string, adjustment: { manualBonus?: number; deductions?: number }) {
    return api.put<SalaryStatement>(`/v1/salary/statements/${id}/adjust`, adjustment)
  }
};

export const OrderService = {
  createOrder: (data: CreateOrderRequest) => api.post<OrderResponse>('/v1/orders', data),
  getOrders: (params?: { customerId?: string; floristId?: string }) => api.get<OrderResponse[]>('/v1/orders', { params }),
  getMyOrders: () => api.get<OrderResponse[]>('/v1/orders/my'),
  getById: (id: string) => api.get<OrderResponse>(`/v1/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus, floristId?: string) =>
    api.put<OrderResponse>(`/v1/orders/${id}/status`, { status, floristId }),
};

export const AnalyticsService = {
  getDashboard: (params?: { storeId?: string; from?: string; to?: string }) => {
    const p = { ...params };
    if (p.from) p.from = new Date(p.from).toISOString();
    if (p.to) p.to = new Date(p.to).toISOString();
    return api.get<DashboardStats>('/v1/analytics/dashboard', { params: p });
  },
  getSales: (from: string, to: string, groupBy: 'DAY' | 'WEEK' | 'MONTH' = 'DAY') =>
    api.get<SalesReportResult>('/v1/analytics/sales', { params: { from, to, groupBy } }),
  getTopProducts: (from: string, to: string, limit = 10) =>
    api.get<TopProductsResult>('/v1/analytics/products/top', { params: { from, to, limit } }),
  getEmployeePerformance: (from: string, to: string) =>
    api.get<EmployeePerformanceResult>('/v1/analytics/employees/performance', { params: { from, to } }),
  getCustomerStats: () => api.get<CustomerStatsResult>('/v1/analytics/customers/stats'),
  getInventoryStats: () => api.get<InventoryStatsResult>('/v1/analytics/inventory/stats'),
  export: (report: 'PNL' | 'SALES' | 'INVENTORY', from: string, to: string, format: 'PDF' | 'EXCEL' = 'PDF') =>
    api.get<Blob>('/v1/analytics/export', { params: { report, from, to, format }, responseType: 'blob' }),
};

export const SupplierService = {
  getAll: (params?: { search?: string; active?: boolean; page?: number; size?: number }) =>
    api.get<PagedResult<SupplierSummary>>('/v1/suppliers', { params }),
  getById: (id: string) => api.get<Supplier>(`/v1/suppliers/${id}`),
  create: (data: CreateSupplierRequest) => api.post<Supplier>('/v1/suppliers', data),
  update: (id: string, data: Partial<CreateSupplierRequest>) => api.put<Supplier>(`/v1/suppliers/${id}`, data),
  deactivate: (id: string) => api.post(`/v1/suppliers/${id}/deactivate`),
};

export const InvoiceService = {
  getAll: (params?: { supplierId?: string; status?: InvoiceStatus; from?: string; to?: string; page?: number; size?: number }) => {
    const p = { ...params };
    if (p.from) p.from = new Date(p.from).toISOString();
    if (p.to) p.to = new Date(p.to).toISOString();
    return api.get<PagedResult<Invoice>>('/v1/invoices', { params: p });
  },
  getById: (id: string) => api.get<Invoice>(`/v1/invoices/${id}`),
  create: (data: CreateInvoiceRequest) => api.post<Invoice>('/v1/invoices', data),
  update: (id: string, data: CreateInvoiceRequest) => api.put<Invoice>(`/v1/invoices/${id}`, data),
  submit: (id: string) => api.post(`/v1/invoices/${id}/submit`),
  /** items.itemId — ID строки инвойса (InvoiceItem.id), НЕ productId! */
  receive: (id: string, storeId: string, items: ReceiveInvoiceItemRequest[]) =>
    api.post(`/v1/invoices/${id}/receive`, { storeId, items }),
  cancel: (id: string, reason?: string) =>
    api.post(`/v1/invoices/${id}/cancel`, null, { params: reason ? { reason } : {} }),
};

export const DeliveryService = {
  getTasks: (params?: { courierId?: string; date?: string; status?: DeliveryTaskStatus }) =>
    api.get<DeliveryTask[]>('/v1/delivery/tasks', { params }),
  getMyTasks: () => api.get<DeliveryTask[]>('/v1/delivery/tasks/my'),
  getTaskById: (id: string) => api.get<DeliveryTask>(`/v1/delivery/tasks/${id}`),
  assignCourier: (taskId: string, courierId: string) =>
    api.put<DeliveryTask>(`/v1/delivery/tasks/${taskId}/assign`, { courierId }),
  updateStatus: (taskId: string, newStatus: DeliveryTaskStatus, failureReason?: string) =>
    api.put<DeliveryTask>(`/v1/delivery/tasks/${taskId}/status`, { newStatus, failureReason }),
  createTask: (data: { orderId: string; slotId?: string; zoneId?: string; deliveryAddress: string; latitude?: number; longitude?: number; estimatedArrival?: string }) =>
    api.post<DeliveryTask>('/v1/delivery/tasks', data),
  getSlots: (date?: string) => api.get<DeliverySlot[]>('/v1/delivery/slots', { params: date ? { date } : {} }),
  getSlotById: (id: string) => api.get<DeliverySlot>(`/v1/delivery/slots/${id}`),
  createSlot: (data: { date: string; startTime: string; endTime: string; maxCapacity: number }) =>
    api.post<DeliverySlot>('/v1/delivery/slots', data),
  updateSlot: (id: string, data: any) => api.put<DeliverySlot>(`/v1/delivery/slots/${id}`, data),
  deleteSlot: (id: string) => api.delete(`/v1/delivery/slots/${id}`),
  getZones: () => api.get<DeliveryZone[]>('/v1/delivery/zones'),
  getZoneById: (id: string) => api.get<DeliveryZone>(`/v1/delivery/zones/${id}`),
  createZone: (data: { name: string; polygon?: string; deliveryFee: number; minOrderAmount: number }) =>
    api.post<DeliveryZone>('/v1/delivery/zones', data),
  updateZone: (id: string, data: any) => api.put<DeliveryZone>(`/v1/delivery/zones/${id}`, data),
  deactivateZone: (id: string) => api.delete(`/v1/delivery/zones/${id}`),
};

export interface TransactionResponse {
  id: string;
  type: string;
  amount: number;
  referenceId: string;
  description: string;
  performedBy: string;
  occurredAt: string;
}

export const FinanceService = {
  getPnlReport: (params: { from: string; to: string }) => api.get<PnlReportResponse>('/v1/finance/pnl', { params }),
  getTransactions: (params: { page?: number; size?: number } = {}) => api.get<PagedResponse<TransactionResponse>>('/v1/finance/transactions', { params }),
};

export const MediaService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<MediaUploadResponse>('/v1/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUrl: (id: string) => api.get<string>(`/v1/media/${id}`),
  delete: (id: string) => api.delete(`/v1/media/${id}`),
};

export const NotificationService = {
  getTemplates: () => api.get<NotificationTemplate[]>('/v1/notifications/templates'),
  getTemplate: (id: string) => api.get<NotificationTemplate>(`/v1/notifications/templates/${id}`),
  createTemplate: (data: { code: string; channel: 'EMAIL' | 'TELEGRAM'; subject?: string; bodyTemplate: string; isActive?: boolean }) =>
    api.post<NotificationTemplate>('/v1/notifications/templates', data),
  updateTemplate: (id: string, data: any) => api.put<NotificationTemplate>(`/v1/notifications/templates/${id}`, data),
  activateTemplate: (id: string) => api.post<NotificationTemplate>(`/v1/notifications/templates/${id}/activate`),
  deactivateTemplate: (id: string) => api.post<NotificationTemplate>(`/v1/notifications/templates/${id}/deactivate`),
  getLogs: (params?: { recipientId?: string; templateCode?: string; channel?: string; status?: string; from?: string; to?: string; page?: number; size?: number }) => {
    const p = { ...params };
    if (p.from) p.from = new Date(p.from).toISOString();
    if (p.to) p.to = new Date(p.to).toISOString();
    return api.get<PagedResult<NotificationLog>>('/v1/notifications/logs', { params: p });
  },
  getLogById: (id: string) => api.get<NotificationLog>(`/v1/notifications/logs/${id}`),
  sendBlast: (data: { recipientIds: string[]; channel: 'EMAIL' | 'TELEGRAM'; templateCode?: string; customSubject?: string; customBody?: string; variables?: Record<string, any> }) =>
    api.post('/v1/notifications/blast', data),
};

// ============================================================
// RECIPE / BOM TYPES (Proposed - Mocked on Frontend)
// ============================================================

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  productId: string;
  productName: string;
  items: RecipeItem[];
  active: boolean;
  createdAt: string;
}

export const RecipeService = {
  getRecipes: () => api.get<Recipe[]>('/catalog/recipes'),
  createRecipe: (data: { productId: string; items: { ingredientId: string; quantity: number }[] }) => 
    api.post<Recipe>('/catalog/recipes', data),
  deleteRecipe: (id: string) => api.delete(`/catalog/recipes/${id}`),
}

export const PaymentService = {
  initiateSbp: (orderId: string) => api.post<any>(`/v1/payments/sbp/${orderId}`),
  simulateSuccess: (orderId: string) => api.post(`/v1/payments/webhooks/simulate/${orderId}`),
}
