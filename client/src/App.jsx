import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GuestRoute } from './components/GuestRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import AdminLayout from './pages/admin/AdminLayout';
import InventoryPage from './pages/admin/InventoryPage';
import OrdersDeliveryPage from './pages/admin/OrdersDeliveryPage';
import ShippingLayout from './pages/shipping/ShippingLayout';
import ShippingDeliveriesPage from './pages/shipping/ShippingDeliveriesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute role="user">
                <ShopPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute role="user">
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="inventory" replace />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersDeliveryPage />} />
            <Route path="delivery" element={<Navigate to="/admin/orders" replace />} />
          </Route>
          <Route
            path="/shipping"
            element={
              <ProtectedRoute role="shipping">
                <ShippingLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="deliveries" replace />} />
            <Route path="deliveries" element={<ShippingDeliveriesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}