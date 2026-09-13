import { useEffect, useState, type FormEvent } from 'react'
import type { AuthUser } from '../lib/auth'

interface AuthPanelProps {
  user: AuthUser | null
  loading: boolean
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string) => Promise<void>
  onLogout: () => Promise<void>
  onClose: () => void
}

type Mode = 'login' | 'register'

export function AuthPanel({
  user,
  loading,
  onLogin,
  onRegister,
  onLogout,
  onClose,
}: AuthPanelProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return

    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'register') {
        await onRegister(email, password)
      } else {
        await onLogin(email, password)
      }
      onClose()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '操作失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onLogout()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="账号"
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl border border-line bg-cream/95 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.6)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">账号</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              登录后即可开启云同步（即将上线）
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭账号"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-soft">正在读取账号信息…</p>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{user.email}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">已登录 · 数据仍保存在本机</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={submitting}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink-soft transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? '退出中…' : '退出登录'}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex rounded-full bg-surface-2 p-0.5">
                {(['login', 'register'] as const).map((item) => {
                  const active = mode === item
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => switchMode(item)}
                      aria-pressed={active}
                      className={`flex-1 rounded-full px-3 py-1.5 text-sm transition ${
                        active
                          ? 'bg-gold text-on-accent'
                          : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {item === 'login' ? '登录' : '注册'}
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-soft">邮箱</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-gold-soft focus:bg-surface-strong"
                  />
                </label>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-1 block text-xs text-ink-soft"
                  >
                    密码
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="至少 8 位"
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      minLength={8}
                      required
                      className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 pr-10 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-gold-soft focus:bg-surface-strong"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? '隐藏密码' : '显示密码'}
                      title={showPassword ? '隐藏密码' : '显示密码'}
                      className="absolute inset-y-0 right-0 grid w-10 place-items-center text-ink-soft transition hover:text-ink"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.1 4.2" />
                          <path d="M6.2 6.2A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.1-.9" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-soft">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-on-accent transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? '处理中…'
                    : mode === 'register'
                      ? '注册并登录'
                      : '登录'}
                </button>
              </form>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-soft/80">
                {mode === 'register'
                  ? '暂不支持密码找回，请牢记本次设置的密码'
                  : '不登录也可正常使用，数据仅保存在本机'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
