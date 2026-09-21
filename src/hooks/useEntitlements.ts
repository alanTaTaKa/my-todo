import { useCallback, useEffect, useState } from 'react'
import type { AuthUser } from '../lib/auth'
import {
  FREE_ENTITLEMENTS,
  fetchEntitlements,
  redeemCode,
  type Entitlements,
} from '../lib/entitlements'
import {
  clearEntitlementsCache,
  loadEntitlementsCache,
  saveEntitlementsCache,
} from '../lib/storage'

function isActive(entitlements: Entitlements): boolean {
  return entitlements.expiresAt === null || entitlements.expiresAt > Date.now()
}

export function useEntitlements(user: AuthUser | null, ready: boolean) {
  const [entitlements, setEntitlements] = useState<Entitlements>(
    () => loadEntitlementsCache() ?? FREE_ENTITLEMENTS,
  )
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    if (!ready) return

    if (!user) {
      clearEntitlementsCache()
      return
    }

    let active = true
    fetchEntitlements()
      .then((next) => {
        if (!active) return
        setEntitlements(next)
        saveEntitlementsCache(next)
        setResolved(true)
      })
      .catch(() => {
        // 拉取失败时保留本地缓存，作为离线宽限
        if (active) setResolved(true)
      })

    return () => {
      active = false
    }
  }, [user, ready])

  const redeem = useCallback(async (code: string) => {
    const next = await redeemCode(code)
    setEntitlements(next)
    saveEntitlementsCache(next)
    setResolved(true)
  }, [])

  const effective = ready && !user ? FREE_ENTITLEMENTS : entitlements
  const isPro = effective.plan === 'pro' && isActive(effective)

  return {
    entitlements: effective,
    isPro,
    resolved: ready && (!user || resolved),
    redeem,
  }
}
