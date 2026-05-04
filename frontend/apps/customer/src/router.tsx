import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { CatalogPage } from '@/pages/CatalogPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage'
import { OrderTrackingPage } from '@/pages/OrderTrackingPage'

// Placeholders (will be replaced by real components later)
const HomePage = () => (
  <div className="container-custom py-24 text-center space-y-8">
    <h1 className="text-5xl font-display font-bold tracking-tight">Добро пожаловать в florify</h1>
    <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
      Лучший сервис доставки цветов в вашем городе. Выбирайте из сотен авторских букетов.
    </p>
    <div className="flex justify-center gap-4">
      <Navigate to="/catalog" /> {/* Redirect for now until Home is ready */}
    </div>
  </div>
)
const ProductPage = () => <div>Product Page</div>
import { AccountLayout } from '@/layouts/AccountLayout'
import { AccountOrdersPage } from '@/pages/AccountOrdersPage'
import { AccountLoyaltyPage } from '@/pages/AccountLoyaltyPage'
import { AccountProfilePage } from '@/pages/AccountProfilePage'
import { AccountFavoritesPage } from '@/pages/AccountFavoritesPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'catalog/:id', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/success', element: <CheckoutSuccessPage /> },
      { path: 'order/:id', element: <OrderTrackingPage /> },
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="orders" replace /> },
          { path: 'orders', element: <AccountOrdersPage /> },
          { path: 'favorites', element: <AccountFavoritesPage /> },
          { path: 'loyalty', element: <AccountLoyaltyPage /> },
          { path: 'profile', element: <AccountProfilePage /> },
        ],
      },
    ],
  },
])
