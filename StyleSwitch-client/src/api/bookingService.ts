import { api } from "./apiClient";
import type { ClothItem } from "./clothService";

export interface BookingItem {
  _id: string;
  clothId: ClothItem;
  tenantId: {
    _id: string;
    name: string;
    email: string;
  };
  lenderId: {
    _id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  pricePerDay: number;
  totalAmount: number;
  securityDeposit: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED" | "COMPLETED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
}

export interface BookedRange {
  startDate: string;
  endDate: string;
  status: string;
}

export const bookingService = {
  create: async (data: { clothId: string; startDate: string; endDate: string }): Promise<{ message: string; booking: BookingItem }> => {
    return api.post("/api/bookings", data);
  },

  getMyBookings: async (): Promise<{ bookings: BookingItem[]; count: number }> => {
    return api.get("/api/bookings/my");
  },

  getLenderBookings: async (): Promise<{ bookings: BookingItem[]; count: number }> => {
    return api.get("/api/bookings/lender");
  },

  updateStatus: async (id: string, status: string): Promise<{ message: string; booking: BookingItem }> => {
    return api.put(`/api/bookings/${id}`, { status });
  },

  getAvailability: async (clothId: string): Promise<{ bookedRanges: BookedRange[] }> => {
    return api.get(`/api/bookings/availability/${clothId}`);
  },
};
