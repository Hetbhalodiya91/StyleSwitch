import { api } from "./apiClient";

export interface WishlistItem {
  _id: string;
  clothId: {
    _id: string;
    brand: string;
    category: string;
    size: string;
    color: string;
    rentalPricePerDay: number;
    securityDeposit: number;
    images?: string[];
    isAvailable: boolean;
    lenderId?: {
      name: string;
      email: string;
    };
  };
  createdAt: string;
}

export const wishlistService = {
  getWishlist: () =>
    api.get<{ success: boolean; count: number; list: WishlistItem[] }>("/api/wishlist"),

  addToWishlist: (clothId: string) =>
    api.post<{ success: boolean; message: string }>("/api/wishlist", { clothId }),

  removeFromWishlist: (clothId: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/wishlist/${clothId}`),
};
