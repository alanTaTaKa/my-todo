import { apiRequest } from './api'

export type PlanId = 'free' | 'pro'

export const PRO_FEATURE = 'pro'

export const CUSTOM_THEME_FEATURE = PRO_FEATURE

export interface Entitlements {
  plan: PlanId
  features: string[]
  expiresAt: number | null
}

export const FREE_ENTITLEMENTS: Entitlements = {
  plan: 'free',
  features: [],
  expiresAt: null,
}

export function fetchEntitlements(): Promise<Entitlements> {
  return apiRequest<Entitlements>('/api/me/entitlements')
}

export function redeemCode(code: string): Promise<Entitlements> {
  return apiRequest<Entitlements>('/api/me/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
