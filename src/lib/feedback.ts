export async function submitFeedback(input: {
  content: string
  contact?: string
}): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/feedback', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error('无法连接服务器，请稍后重试')
  }

  if (!response.ok) {
    let message = '提交失败，请稍后重试'
    try {
      const data = (await response.json()) as { error?: unknown }
      if (typeof data.error === 'string' && data.error) message = data.error
    } catch {
      // 响应不是 JSON，使用兜底文案
    }
    throw new Error(message)
  }
}
