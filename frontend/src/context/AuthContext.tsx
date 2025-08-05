import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Validate token với backend
  const validateToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:5000/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔐 AuthContext - Token validation successful:', data);
        return true;
      } else {
        console.log('❌ AuthContext - Token validation failed');
        return false;
      }
    } catch (error) {
      console.error('❌ AuthContext - Token validation error:', error);
      return false;
    }
  };

  // Kiểm tra token khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 AuthContext - Checking authentication on mount...');
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('🔐 AuthContext - Token from localStorage:', token);
      console.log('🔐 AuthContext - User data from localStorage:', userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('🔐 AuthContext - Parsed user data:', parsedUser);
          
          // Validate token với backend
          const isValid = await validateToken();
          
          if (isValid) {
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log('🔐 AuthContext - Authentication restored successfully');
          } else {
            console.log('❌ AuthContext - Token invalid, clearing data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('❌ Lỗi khi parse user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('🔐 AuthContext - No token or user data found');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    console.log('🔐 AuthContext - Login called with:', { token, userData });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    console.log('🔐 AuthContext - Login completed, user set to:', userData);
  };

  const logout = () => {
    // Xóa tất cả data trong localStorage
    localStorage.clear();
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch custom event để clear cart
    window.dispatchEvent(new CustomEvent('logout', { detail: { clearCart: true } }));
    
    // Reload trang để reset hoàn toàn
    window.location.reload();
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    validateToken
  };

  // Hiển thị loading spinner nếu đang kiểm tra auth
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 