import { useState } from 'react'

interface UpgradePromptProps {
  title: string
  description: string
  canRedeem: boolean
  onRedeem: (code: string) => Promise<void>
}

export function UpgradePrompt({
  title,
  description,
  canRedeem,
  onRedeem,
}: UpgradePromptProps) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const trimmed = code.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError('')
    try {
      await onRedeem(trimmed)
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '兑换失败，请稍后重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="text-center">
      <span className="mx-auto grid size-10 place-items-center rounded-full bg-gold/15 text-gold">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </span>
      <p className="mt-2 text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
        {description}
      </p>

      {canRedeem ? (
        <div className="mt-3 flex gap-1.5">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submit()
            }}
            placeholder="输入兑换码"
            spellCheck={false}
            aria-label="兑换码"
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs uppercase text-ink outline-none focus:border-gold-soft"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || !code.trim()}
            className="shrink-0 rounded-xl bg-gold px-3 py-1.5 text-xs font-medium text-on-accent transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? '解锁中…' : '解锁'}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-ink-soft">
          登录账号后即可输入兑换码解锁
        </p>
      )}

      {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}
