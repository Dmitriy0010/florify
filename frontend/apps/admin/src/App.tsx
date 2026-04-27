import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AdminLayout } from './components/layout/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import POSPage from './pages/POSPage'
import OrdersPage from './pages/OrdersPage'
import MarketingPage from './pages/marketing/MarketingPage'
import PointsOfSalePage from './pages/PointsOfSalePage'
import ErrorPage from './pages/ErrorPage'
import StoreInfoPage from './pages/stores/StoreInfoPage'
import CreateStorePage from './pages/stores/CreateStorePage'
import InventoryStockPage from './pages/inventory/InventoryStockPage'
import EmployeeListPage from './pages/employees/EmployeeListPage'
import ShiftsPage from './pages/employees/ShiftsPage'
import SuppliersPage from './pages/suppliers/SuppliersPage'
import InvoicesPage from './pages/inventory/InvoicesPage'
import CouriersPage from './pages/delivery/CouriersPage'
import DeliverySlotsPage from './pages/delivery/DeliverySlotsPage'
import FinancePage from './pages/finance/FinancePage'
import SalariesPage from './pages/employees/SalariesPage'
import TeamSchedulePage from './pages/employees/TeamSchedulePage'
import LoyaltyPage from './pages/customers/LoyaltyPage'
import LoginPage from './pages/auth/LoginPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import CustomersPage from './pages/customers/CustomersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ReportsPage from './pages/ReportsPage'
import InventoryCountPage from './pages/inventory/InventoryCountPage'
import DeliveryZonesPage from './pages/delivery/DeliveryZonesPage'
import WriteOffLogPage from './pages/inventory/WriteOffLogPage'
import { RequireAuth } from './components/layout/RequireAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4 opacity-30">
    <h2 className="text-4xl font-black">{title}</h2>
    <p className="text-sm font-bold uppercase tracking-[0.2em]">Скоро здесь будет функционал</p>
  </div>
)

const BackendNotAvailablePlaceholder = ({ title, message }: { title: string; message: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
    <h2 className="text-4xl font-black text-neutral-900 opacity-30">{title}</h2>
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-2xl flex flex-col items-center gap-2">
      <span className="font-bold text-sm">Временно недоступно</span>
      <span className="text-xs">{message}</span>
    </div>
  </div>
)

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/admin/dashboard" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "pos", element: <POSPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "pos-points", element: <PointsOfSalePage /> },
      { path: "pos-points/info", element: <StoreInfoPage /> },
      { path: "pos-points/create", element: <CreateStorePage /> },
      { path: "marketing", element: <MarketingPage /> },
      { path: "shifts", element: <ShiftsPage /> },
      { path: "inventory/stock", element: <InventoryStockPage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "inventory/count", element: <InventoryCountPage /> },
      { path: "inventory/write-off", element: <WriteOffLogPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "suppliers", element: <SuppliersPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "loyalty", element: <LoyaltyPage /> },
      { path: "employees", element: <EmployeeListPage /> },
      { path: "employees/schedule", element: <TeamSchedulePage /> },
      { path: "salaries", element: <SalariesPage /> },
      { path: "couriers", element: <CouriersPage /> },
      { path: "delivery-slots", element: <DeliverySlotsPage /> },
      { path: "delivery-zones", element: <DeliveryZonesPage /> },
      { path: "finance", element: <FinancePage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
