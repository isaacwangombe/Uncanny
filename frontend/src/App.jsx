// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// 🏪 Public pages
import StorePage from "./pages/storePage/StorePage";
import CheckoutPage from "./pages/checkoutPage/CheckoutPage";
import Homepage from "./pages/homepage/Homepage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import AboutPage from "./pages/about/AboutPage";
// 🧩 Admin pages
import AdminLayout from "./Components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsPage from "./pages/admin/products/ProductsPage";
import CategoriesAdminPage from "./pages/admin/CategoriesPage";
import UsersAdminPage from "./pages/admin/UsersPage";
import OrdersPage from "./pages/admin/orders/OrdersPage";
import MessagesAdminPage from "./pages/admin/messages/MessagesAdminPage";
import MailingListPage from "./pages/admin/messages/MailingListPage";
import AdminScannerPage from "./pages/admin/AdminScannerPage";

// 🧭 Layout components
import Navbars from "./Components/navbar/Navbar";
import Footer from "./Components/footer/Footer";
import CartDrawer from "./Components/cartDrawer/CartDrawer";
import AuthCallback from "./pages/auth/AuthCallback";

// 🛒 Cart context
import { CartProvider, useCart } from "./contexts/CartContext";
import ProductDetailPage from "./pages/productDetail/ProductDetailPage";

function App() {
  return (
    <Router>
      {/* ✅ CartProvider wraps the entire app */}
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

// ✅ AppContent handles routes and global UI
function AppContent() {
  const { drawerOpen, closeCart } = useCart();

  return (
    <>
      <Navbars />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminLayoutWrapper />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={1200} />

      <Footer />

      {/* ✅ Global Cart Drawer always available */}
      <CartDrawer show={drawerOpen} onClose={closeCart} />
    </>
  );
}

// ✅ Nested admin pages inside AdminLayout
const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Routes>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="categories" element={<CategoriesAdminPage />} />
      <Route path="users" element={<UsersAdminPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="messages" element={<MessagesAdminPage />} />
      <Route path="mailing-list" element={<MailingListPage />} />
      <Route path="scan" element={<AdminScannerPage />} />
    </Routes>
  </AdminLayout>
);

export default App;
