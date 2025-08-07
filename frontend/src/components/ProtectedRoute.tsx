import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('🔍 ProtectedRoute - Checking access...');
  console.log('🔍 ProtectedRoute - requireAuth:', requireAuth);
  console.log('🔍 ProtectedRoute - requireAdmin:', requireAdmin);
  console.log('🔍 ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('🔍 ProtectedRoute - user:', user);
  console.log('🔍 ProtectedRoute - user role:', user?.role);
  console.log('🔍 ProtectedRoute - current path:', location.pathname);

  // Kiểm tra token từ localStorage trực tiếp để đảm bảo
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  let isAdmin = false;
  let hasValidAuth = false;
  
  if (token && userData) {
    try {
      const parsedUser = JSON.parse(userData);
      isAdmin = parsedUser.role?.toLowerCase()?.trim() === 'admin';
      hasValidAuth = true;
      console.log('🔍 ProtectedRoute - Direct localStorage check - isAdmin:', isAdmin);
    } catch (error) {
      console.error('❌ ProtectedRoute - Error parsing user data:', error);
    }
  }

  // Nếu yêu cầu admin, kiểm tra cả state và localStorage
  if (requireAdmin) {
    const stateIsAdmin = user?.role?.toLowerCase()?.trim() === 'admin';
    const canAccessAdmin = (isAuthenticated && stateIsAdmin) || (hasValidAuth && isAdmin);
    
    if (!canAccessAdmin) {
      console.log('❌ ProtectedRoute - Admin access denied');
      console.log('❌ ProtectedRoute - State isAuthenticated:', isAuthenticated);
      console.log('❌ ProtectedRoute - State isAdmin:', stateIsAdmin);
      console.log('❌ ProtectedRoute - localStorage hasValidAuth:', hasValidAuth);
      console.log('❌ ProtectedRoute - localStorage isAdmin:', isAdmin);
      return <Navigate to="/login" replace />;
    }
    
    console.log('✅ ProtectedRoute - Admin access granted');
    return <>{children}</>;
  }

  // Nếu yêu cầu auth, kiểm tra cả state và localStorage
  if (requireAuth) {
    const hasAuth = isAuthenticated || hasValidAuth;
    
    if (!hasAuth) {
      console.log('❌ ProtectedRoute - Authentication required');
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    console.log('✅ ProtectedRoute - Authentication access granted');
    return <>{children}</>;
  }

  // Nếu không yêu cầu auth nhưng đã đăng nhập (cho login/register pages)
  if (!requireAuth && (isAuthenticated || hasValidAuth)) {
    console.log('❌ ProtectedRoute - Already authenticated, checking if admin...');
    
    // Nếu là admin và đang ở trang login, cho phép LoginPage xử lý redirect
    if ((isAdmin || user?.role?.toLowerCase()?.trim() === 'admin') && location.pathname === '/login') {
      console.log('✅ ProtectedRoute - Admin on login page, allowing access for redirect');
      return <>{children}</>;
    }
    
    console.log('❌ ProtectedRoute - Already authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute; 