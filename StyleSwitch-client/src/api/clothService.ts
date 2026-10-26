import { api } from "./apiClient";

export interface ClothItem {
  _id: string;
  brand: string;
  category: string;
  gender: string;
  size: string;
  color: string;
  description?: string;
  purchaseDate?: string;
  condition: string;
  conditionDescription?: string;
  images: string[];
  rentalPricePerDay: number;
  securityDeposit: number;
  doesBill?: boolean;
  billPhoto?: string;
  pickupAddress: string;
  city: string;
  pincode: string;
  isAvailable: boolean;
  lenderId?: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt?: string;
}

export interface ClothFilterParams {
  category?: string;
  gender?: string;
  size?: string;
  city?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const clothService = {
  // Get all clothes
  getAll: async (): Promise<{ clothes: ClothItem[]; count: number }> => {
    return api.get("/api/cloth");
  },

  // Search / filter clothes
  search: async (params: ClothFilterParams): Promise<{ clothes: ClothItem[]; count: number }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    return api.get(`/api/cloth/search${queryString ? `?${queryString}` : ""}`);
  },

  // Get cloth by ID
  getById: async (id: string): Promise<{ cloth: ClothItem }> => {
    return api.get(`/api/cloth/${id}`);
  },

  // Add new clothing listing
  create: async (data: any): Promise<{ message: string; cloth: ClothItem }> => {
    return api.post("/api/cloth", data);
  },

  // Get user's own clothing listings
  getMyClothes: async (): Promise<{ clothes: ClothItem[]; count: number }> => {
    return api.get("/api/cloth/my");
  },
};
