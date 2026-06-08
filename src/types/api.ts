// Mirrors the backend DTOs in com.firstclub.membership.api.dto

export type PlanType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type TierName = 'SILVER' | 'GOLD' | 'PLATINUM';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
export type NotificationType = 'UPGRADE_ELIGIBLE' | 'AUTO_DOWNGRADED';
export type BenefitType =
  | 'FREE_DELIVERY'
  | 'DISCOUNT_PERCENTAGE'
  | 'EARLY_ACCESS'
  | 'PRIORITY_SUPPORT';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface PlanResponse {
  id: number;
  planType: PlanType;
  price: number;
  durationDays: number;
}

export interface TierResponse {
  id: number;
  tierName: TierName;
  level: number;
  description: string;
}

export interface SubscriptionResponse {
  id: number;
  userId: number;
  planId: number;
  planType: PlanType;
  tierId: number;
  tierName: TierName;
  startsAt: string;
  expiresAt: string;
  status: SubscriptionStatus;
  pendingUpgradeTierId: number | null;
}

export interface AppliedBenefit {
  type: BenefitType;
  description: string;
  config: Record<string, unknown>;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  type: NotificationType;
  fromTierId: number | null;
  toTierId: number;
  reason: string;
  createdAt: string;
  acknowledgedAt: string | null;
}

export interface OrderResponse {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  completedAt: string | null;
}

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  cohort: string | null;
}

// Matches the seed data in V2__seed.sql
export const DEMO_USERS: DemoUser[] = [
  { id: 1, name: 'Aarav Sharma',  email: 'aarav@example.com',  cohort: null },
  { id: 2, name: 'Diya Patel',    email: 'diya@example.com',   cohort: 'GOLD_INVITEE' },
  { id: 3, name: 'Rohan Mehta',   email: 'rohan@example.com',  cohort: 'VIP' },
  { id: 4, name: 'Ishita Verma',  email: 'ishita@example.com', cohort: 'EMPLOYEE' },
];
