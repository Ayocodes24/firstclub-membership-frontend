import { api } from './client';
import type { PlanResponse, TierResponse } from '../types/api';

export const getPlans = () =>
  api.get<PlanResponse[]>('/plans').then(r => r.data);

export const getTiers = () =>
  api.get<TierResponse[]>('/tiers').then(r => r.data);
