import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KanbanOrders from './pages/KanbanOrders';
import RequireAuth from './routes/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<RequireAuth allowedRoles={['FLORIST']} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<KanbanOrders />} />
        </Route>

        {/* Запасной путь */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
