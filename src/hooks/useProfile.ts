import { useCallback, useEffect, useState } from 'react'
import type { UserProfile } from '../types'
import { loadProfile, saveProfile } from '../lib/storage'

export const DEFAULT_PROFILE: UserProfile = {
  title: '今日待办',
  subtitle: '慢慢来，一件一件完成就好',
  updatedAt: 0,
}

export type ProfilePatch = Partial<Pick<UserProfile, 'title' | 'subtitle'>>

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile() ?? DEFAULT_PROFILE)

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  const updateProfile = (patch: ProfilePatch) => {
    setProfile((prev) => {
      const next: UserProfile = {
        title: patch.title ?? prev.title,
        subtitle: patch.subtitle ?? prev.subtitle,
        updatedAt: Date.now(),
      }
      if (next.title === prev.title && next.subtitle === prev.subtitle) {
        return prev
      }
      return next
    })
  }

  const mergeProfile = useCallback((incoming: UserProfile | null) => {
    if (!incoming) return
    setProfile((prev) => {
      if (incoming.updatedAt < prev.updatedAt) return prev
      if (
        incoming.updatedAt === prev.updatedAt &&
        incoming.title === prev.title &&
        incoming.subtitle === prev.subtitle
      ) {
        return prev
      }
      return incoming
    })
  }, [])

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE)
  }, [])

  return {
    title: profile.title,
    subtitle: profile.subtitle,
    profile,
    updateProfile,
    mergeProfile,
    resetProfile,
  }
}
