import { useCallback, useEffect, useState } from 'react'
import {
  deleteAccount as apiDeleteAccount,
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type AuthUser,
} from '../lib/auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchMe().then((me) => {
      if (!active) return
      setUser(me)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const me = await apiRegister(email, password)
    setUser(me)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const me = await apiLogin(email, password)
    setUser(me)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
    }
  }, [])

  const deleteAccount = useCallback(async () => {
    try {
      await apiDeleteAccount()
    } finally {
      setUser(null)
    }
  }, [])

  return { user, loading, register, login, logout, deleteAccount }
}
