import { api } from './client';
import type {
  SubscriptionResponse,
  AppliedBenefit,
  NotificationResponse,
  TierResponse,
} from '../types/api';

export const getCurrentMembership = (userId: number) =>
  api.get<SubscriptionResponse>(`/users/${userId}/membership`).then(r => r.data);

export const getEligibleTiers = (userId: number) =>
  api.get<TierResponse[]>(`/users/${userId}/eligible-tiers`).then(r => r.data);

export const getBenefits = (userId: number) =>
  api.get<AppliedBenefit[]>(`/users/${userId}/benefits`).then(r => r.data);

export const getNotifications = (userId: number) =>
  api.get<NotificationResponse[]>(`/users/${userId}/notifications`).then(r => r.data);

export const ackNotification = (notificationId: number) =>
  api.post<NotificationResponse>(`/notifications/${notificationId}/ack`).then(r => r.data);
