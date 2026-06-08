import { api } from './client';
import type { OrderResponse } from '../types/api';

export const recordCompletedOrder = (userId: number, totalAmount: number) =>
  api
    .post<OrderResponse>('/internal/orders/completed', { userId, totalAmount })
    .then(r => r.data);
