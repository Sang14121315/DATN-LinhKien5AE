import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FavoriteItem {
  _id: string;
  name: string;
  price: number;
  img_url: string;
  // Thêm các trường khác nếu cần (ví dụ: brand, sale, etc.)
}

interface FavoriteContextType {
  favorites: FavoriteItem[];
  addToFavorite: (item: FavoriteItem) => void;
  removeFromFavorite: (id: string) => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addToFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      if (!prev.some((f) => f._id === item._id)) {
        return [...prev, item];
      }
      return prev; // Không thêm nếu đã tồn tại
    });
  };

  const removeFromFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <FavoriteContext.Provider value={{ favorites, addToFavorite, removeFromFavorite }}>
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