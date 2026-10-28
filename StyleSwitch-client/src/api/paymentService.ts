import { api } from "./apiClient";

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    key: string;
    paymentId: string;
    testMode: boolean;
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

export type PaymentMethod = "CARD" | "UPI" | "NETBANKING" | "WALLET" | "OTHER";

export const paymentService = {
  createOrder: (bookingId: string, paymentMethod: PaymentMethod) =>
    api.post<CreateOrderResponse>("/api/payments/create-order", { bookingId, paymentMethod }),

  confirmPayment: (paymentId: string, data: { razorpayPaymentId: string; razorpaySignature?: string }) =>
    api.post<ConfirmPaymentResponse>(`/api/payments/${paymentId}/confirm`, data),
};
