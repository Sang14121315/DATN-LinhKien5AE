import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface FavoriteItem {
  _id: string;
  name: string;
  price: number;
  img_url: string;
}

interface FavoriteContextType {
  favorites: FavoriteItem[];
  addToFavorite: (item: FavoriteItem) => void;
  removeFromFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Load danh sách yêu thích từ API khi đã đăng nhập
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const res = await axios.get("/api/favorite/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (Array.isArray(res.data)) {
          const favList = res.data.map((fav: any) => ({
            _id: fav.product_id._id,
            name: fav.product_id.name,
            price: fav.product_id.price,
            img_url: fav.product_id.img_url,
          }));
          setFavorites(favList);
        }
      } catch (error) {
        console.error("Lỗi khi tải favorites:", error);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, user]);

  const addToFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      if (!prev.some((f) => f._id === item._id)) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const removeFromFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item._id !== id));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some((item) => item._id === id);
  };

  const value: FavoriteContextType = {
    favorites,
    addToFavorite,
    removeFromFavorite,
    clearFavorites,
    isFavorite,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorite must be used within a FavoriteProvider');
  }
  return context;
};
