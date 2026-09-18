import { useState } from 'react'
import { Modal } from './Modal'
import { CURRENT_VERSION, VERSIONS } from '../lib/version'

interface VersionPanelProps {
  onClose: () => void
}

export function VersionPanel({ onClose }: VersionPanelProps) {
  const [selected, setSelected] = useState(CURRENT_VERSION)

  const entry = VERSIONS.find((item) => item.version === selected) ?? VERSIONS[0]

  return (
    <Modal
      label="版本更新"
      onClose={onClose}
      size="lg"
      header={
        <>
          <h2 className="text-base font-semibold text-ink">版本更新</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            当前版本 v{CURRENT_VERSION}
          </p>
        </>
      }
    >
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
    </Modal>
  )
}
