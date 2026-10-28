import { api } from "./apiClient";

export interface AdminMetrics {
  totalUsers: number;
  totalLenders: number;
  totalRenters: number;
  totalClothes: number;
  availableClothes: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalReports: number;
  pendingReports: number;
  totalRevenue: number;
  platformCommission: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "lender" | "tenant" | "renter";
  number?: string;
  address?: string;
  isBlock: boolean;
  createdAt: string;
}

export interface AdminCloth {
  _id: string;
  brand: string;
  category: string;
  gender: string;
  size: string;
  color: string;
  rentalPricePerDay: number;
  securityDeposit: number;
  isAvailable: boolean;
  images: string[];
  city: string;
  lenderId?: {
    _id: string;
    name: string;
    email: string;
    number?: string;
  };
  createdAt: string;
}

export interface AdminBooking {
  _id: string;
  clothId: {
    _id: string;
    brand: string;
    category: string;
    images?: string[];
    rentalPricePerDay?: number;
  } | null;
  tenantId: {
    _id: string;
    name: string;
    email: string;
    number?: string;
  } | null;
  lenderId: {
    _id: string;
    name: string;
    email: string;
    number?: string;
  } | null;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  totalAmount: number;
  securityDeposit: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  paymentStatus: string;
  createdAt: string;
}

export interface AdminReport {
  _id: string;
  reporterId?: {
    _id: string;
    name: string;
    email: string;
  };
  reportedUserId?: {
    _id: string;
    name: string;
    email: string;
  };
  clothId?: {
    _id: string;
    brand: string;
    category: string;
    images?: string[];
  };
  reason: string;
  details?: string;
  status: "PENDING" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
  adminNote?: string;
  createdAt: string;
}

export interface OverviewResponse {
  success: boolean;
  metrics: AdminMetrics;
  recentBookings: AdminBooking[];
  recentReports: AdminReport[];
}

export const adminService = {
  getOverview: () => api.get<OverviewResponse>("/api/admin/overview"),
  getUsers: () => api.get<{ success: boolean; users: AdminUser[] }>("/api/admin/users"),
  toggleUserBlock: (id: string) => api.post<{ success: boolean; message: string }>(`/api/admin/users/${id}/toggle-block`),
  updateUserRole: (id: string, role: string) => api.put<{ success: boolean; message: string }>(`/api/admin/users/${id}/role`, { role }),

  getClothes: () => api.get<{ success: boolean; clothes: AdminCloth[] }>("/api/admin/clothes"),
  toggleClothAvailability: (id: string) => api.post<{ success: boolean; message: string }>(`/api/admin/clothes/${id}/toggle-availability`),
  deleteCloth: (id: string) => api.delete<{ success: boolean; message: string }>(`/api/admin/clothes/${id}`),

  getBookings: () => api.get<{ success: boolean; bookings: AdminBooking[] }>("/api/admin/bookings"),
  updateBookingStatus: (id: string, status: string) => api.put<{ success: boolean; message: string }>(`/api/admin/bookings/${id}/status`, { status }),

  getReports: () => api.get<{ success: boolean; reports: AdminReport[] }>("/api/admin/reports"),
  updateReport: (id: string, data: { status?: string; adminNote?: string }) => api.put<{ success: boolean; message: string }>(`/api/admin/reports/${id}`, data),
};
