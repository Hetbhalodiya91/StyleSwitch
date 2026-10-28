import { api } from "./apiClient";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  referenceType: "Booking" | "Payment" | "Cloth" | "Other";
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: () =>
    api.get<{ success: boolean; count: number; notifications: NotificationItem[] }>("/api/notifications"),

  markRead: (id: string) =>
    api.post<{ success: boolean; notification: NotificationItem }>(`/api/notifications/${id}/read`),

  deleteNotification: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/notifications/${id}`),
};
