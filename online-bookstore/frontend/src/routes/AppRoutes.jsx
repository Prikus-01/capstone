import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/auth.store';

// Layout
import Navbar from '../components/layout/Navbar';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CataloguePage from '../pages/CataloguePage';
import CategoryPage from '../pages/CategoryPage';
import BrandPage from '../pages/BrandPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CartPage from '../pages/CartPage';
import CheckoutPaymentPage from '../pages/CheckoutPaymentPage';
import PaymentResultPage from '../pages/PaymentResultPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import ProfilePage from '../pages/ProfilePage';
import WishlistPage from '../pages/WishlistPage';
import NotFoundPage from '../pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#1a1a1a]"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/brands/:slug" element={<BrandPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout/payment" element={<ProtectedRoute><CheckoutPaymentPage /></ProtectedRoute>} />
        <Route path="/payment/result" element={<ProtectedRoute><PaymentResultPage /></ProtectedRoute>} />
        <Route path="/orders/:id/confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
