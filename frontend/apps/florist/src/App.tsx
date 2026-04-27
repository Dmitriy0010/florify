import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import LoginPage from './pages/LoginPage';
import KanbanPage from './pages/KanbanPage';
import InventoryPage from './pages/InventoryPage';
import ProfilePage from './pages/ProfilePage';
import OrderDetailPage from './pages/OrderDetailPage';
import InventoryDetailPage from './pages/InventoryDetailPage';
import InventoryAuditPage from './pages/InventoryAuditPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute allowedRoles={['FLORIST', 'CASHIER']} />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<KanbanPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/:productId" element={<InventoryDetailPage />} />
            <Route path="/inventory/audit" element={<InventoryAuditPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
