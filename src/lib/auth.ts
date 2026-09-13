export interface AuthUser {
  id: string
  email: string
  createdAt: string
}

interface AuthResponse {
  user: AuthUser
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown }
    if (typeof data.error === 'string' && data.error) return data.error
  } catch {
    // 响应不是 JSON，使用兜底文案
  }
  return '请求失败，请稍后重试'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      credentials: 'include',
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new Error('无法连接服务器，请确认后端已启动')
  }

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as T
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'include' })
    if (!response.ok) return null
    const data = (await response.json()) as AuthResponse
    return data.user
  } catch {
    return null
  }
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const data = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data.user
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data.user
}

export async function logout(): Promise<void> {
  await request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
}
