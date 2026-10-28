import { api } from "./apiClient";

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    key: string;
    paymentId: string;
    booking: {
      _id: string;
      clothId: {
        _id: string;
        brand: string;
        category: string;
        images?: string[];
      };
      startDate: string;
      endDate: string;
      totalAmount: number;
      securityDeposit: number;
    };
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  payment: {
    _id: string;
    amount: number;
    status: string;
    razorpayPaymentId: string;
    paidAt: string;
  };
}

export const paymentService = {
  createOrder: (bookingId: string) =>
    api.post<CreateOrderResponse>("/api/payments/create-order", { bookingId }),

  confirmPayment: (paymentId: string, data: { razorpayPaymentId: string; razorpaySignature?: string }) =>
    api.post<ConfirmPaymentResponse>(`/api/payments/${paymentId}/confirm`, data),
};
