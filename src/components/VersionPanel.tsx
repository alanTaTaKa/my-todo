import { useEffect, useState } from 'react'
import { CURRENT_VERSION, VERSIONS } from '../lib/version'

interface VersionPanelProps {
  onClose: () => void
}

export function VersionPanel({ onClose }: VersionPanelProps) {
  const [selected, setSelected] = useState(CURRENT_VERSION)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const entry = VERSIONS.find((item) => item.version === selected) ?? VERSIONS[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="版本更新"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-line bg-cream/95 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.6)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">版本更新</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              当前版本 v{CURRENT_VERSION}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭版本更新"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {VERSIONS.map((item) => {
              const active = item.version === selected
              const isCurrent = item.version === CURRENT_VERSION
              return (
                <button
                  key={item.version}
                  type="button"
                  onClick={() => setSelected(item.version)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition ${
                    active
                      ? 'border-gold bg-gold text-on-accent'
                      : 'border-line bg-surface text-ink-soft hover:text-ink'
                  }`}
                >
                  v{item.version}
                  {isCurrent && (
                    <span
                      className={`size-1.5 rounded-full ${
                        active ? 'bg-white' : 'bg-gold'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-ink">
                v{entry.version}
              </span>
              {entry.version === CURRENT_VERSION && (
                <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] text-on-accent">
                  当前版本
                </span>
              )}
              <span className="text-xs text-ink-soft/80">{entry.date}</span>
            </div>

            <ul className="mt-3 space-y-2">
              {entry.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-soft" />
                  <span className="break-words">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-center text-[11px] text-ink-soft/70">
            版本信息维护在本机数据中，可随更新追加
          </p>
        </div>
      </div>
    </div>
  )
}
