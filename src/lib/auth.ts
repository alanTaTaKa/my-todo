import { apiRequest } from './api'

export interface AuthUser {
  id: string
  email: string
  createdAt: string
}

interface AuthResponse {
  user: AuthUser
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const data = await apiRequest<AuthResponse>('/api/auth/me')
    return data.user
  } catch {
    return null
  }
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data.user
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data.user
}

export async function logout(): Promise<void> {
  await apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
}

export async function deleteAccount(): Promise<void> {
  await apiRequest<{ ok: boolean }>('/api/auth/account', { method: 'DELETE' })
}
