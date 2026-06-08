import { api } from './client';
import type { SubscriptionResponse } from '../types/api';

export const subscribe = (
  userId: number,
  planId: number,
  tierId: number,
  idempotencyKey?: string,
) =>
  api
    .post<SubscriptionResponse>(
      `/users/${userId}/subscriptions`,
      { planId, tierId },
      idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined,
    )
    .then(r => r.data);

export const confirmUpgrade = (subscriptionId: number) =>
  api.post<SubscriptionResponse>(`/subscriptions/${subscriptionId}/confirm-upgrade`).then(r => r.data);

export const downgrade = (subscriptionId: number, tierId: number) =>
  api.post<SubscriptionResponse>(`/subscriptions/${subscriptionId}/downgrade/${tierId}`).then(r => r.data);

export const cancel = (subscriptionId: number) =>
  api.post<SubscriptionResponse>(`/subscriptions/${subscriptionId}/cancel`).then(r => r.data);
