export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
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
    throw new Error('无法连接服务器，请稍后重试')
  }

  if (!response.ok) {
    let message = '请求失败，请稍后重试'
    try {
      const data = (await response.json()) as { error?: unknown }
      if (typeof data.error === 'string' && data.error) message = data.error
    } catch {
      // 响应不是 JSON，使用兜底文案
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}
