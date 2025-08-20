import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/admin.layout";
import DashboardPage from "@/pages/admin/Dashboard";
import CategoryTablePage from "@/pages/admin/CategoryTable";
import CategoryFormPage from "@/pages/admin/CategoryForm";
import ChildCategoryTable from "@/pages/admin/ChildCategoryTable";
import ChildCategoryForm from "@/pages/admin/ChildCategoryForm";
import BrandTablePage from "@/pages/admin/BrandTable";
import BrandFormPage from "@/pages/admin/BrandForm";
import Orderfrom from "@/pages/admin/OrderPage";
import AdminOrderDetailPage from "@/pages/admin/AdminOrderDetailPage";
import CouponAdmin from "@/pages/admin/AdminCouponPage";
import ProductTypeTablePage from "@/pages/admin/ProductTypeTable";
import ProductTypeFormPage from "@/pages/admin/ProductTypeForm";

import AdminUserPage from "@/pages/admin/AdminUserPage";
import AdminContactPage from "@/pages/admin/AdminContactPage";
import MessageManagement from "@/pages/admin/MessageManagement";
import ReviewManagement from "@/pages/admin/ReviewManagement";

import CouponForm from "@/pages/admin/CouponForm";

// import user
import AuthLayout from "@/layouts/auth.layout";
import AboutPage from "@/pages/user/about";
import ProductlistPage from "@/pages/user/productList";
import ProductdetailPage from "@/pages/user/productDetail";
import HomePage from "@/pages/user/home";
import LoginPage from "@/pages/user/LoginPage";
import RegisterPage from "@/pages/user/RegisterPage";
import ForgotPasswordPage from "@/pages/user/ForgotPasswordPage";

import FavoritePage from "@/pages/user/FavoritePage";
import CartPage from "@/pages/user/CartPage";
import CheckoutPage from "@/pages/user/CheckoutPage";
import SearchResultPage from "@/pages/user/searchResult";
import OrderTrackingPage from "@/pages/user/OrderTrackingPage";
import ContactPage from "@/pages/user/ContactPage";
import MomoCallbackPage from "@/pages/user/MomoCallbackPage";
import GoogleCallbackPage from "@/pages/user/GoogleCallbackPage";
import ProfilePage from "@/pages/user/ProfilePage";
import PurchasePage from "@/pages/user/PurchasePage";
import UserProfileLayout from "@/layouts/userProfile.layout";
import ProductTablePage from "@/pages/admin/ProductTable";
import ProductFormPage from "@/pages/admin/ProductForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoyaltyPage from "@/pages/user/LoyaltyPage";

const MainRouter = () => {
  return (
    <Routes>
      {/* Admin layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="category" element={<CategoryTablePage />} />
        <Route path="category/create" element={<CategoryFormPage />} />
        <Route path="category/:id/form" element={<CategoryFormPage />} />
        <Route path="child-category" element={<ChildCategoryTable />} />
        <Route path="child-category/create" element={<ChildCategoryForm />} />
        <Route path="child-category/:id/form" element={<ChildCategoryForm />} />
        <Route path="brand" element={<BrandTablePage />} />
        <Route path="brand/create" element={<BrandFormPage />} />
        <Route path="brand/:id/form" element={<BrandFormPage />} />
        <Route path="order" element={<Orderfrom />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="coupons" element={<CouponAdmin />} />
        <Route path="products" element={<ProductTablePage />} />
        <Route path="products/create" element={<ProductFormPage />} />
        <Route path="products/:id/form" element={<ProductFormPage />} />
        <Route path="product-types" element={<ProductTypeTablePage />} />
        <Route path="product-types/create" element={<ProductTypeFormPage />} />
        <Route
          path="product-types/:id/form"
          element={<ProductTypeFormPage />}
        />

        <Route path="users" element={<AdminUserPage />} />
        <Route path="feedback" element={<AdminContactPage />} />
        <Route path="messages" element={<MessageManagement />} />
        <Route path="reviews" element={<ReviewManagement />} />

        <Route path="coupons/create" element={<CouponForm />} />
        <Route path="coupons/:id/edit" element={<CouponForm />} />
      </Route>

      {/* User layout */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="search" element={<SearchResultPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="productlist" element={<ProductlistPage />} />
        <Route path="product-list" element={<ProductlistPage />} />
        <Route path="productdetail" element={<ProductdetailPage />} />
        <Route
          path="login"
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route path="product/:id" element={<ProductdetailPage />} />
        <Route
          path="register"
          element={
            <ProtectedRoute requireAuth={false}>
              <RegisterPage />
            </ProtectedRoute>
          }
        />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route path="contact" element={<ContactPage />} />
        <Route path="momo-callback" element={<MomoCallbackPage />} />
        <Route path="auth/google/callback" element={<GoogleCallbackPage />} />

        {/* User Profile Layout */}
        <Route
          element={
            <ProtectedRoute>
              <UserProfileLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<ProfilePage />} />
          <Route path="purchase" element={<PurchasePage />} />
          <Route path="favorite" element={<FavoritePage />} />
          <Route path="loyalty" element={<LoyaltyPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default MainRouter;
