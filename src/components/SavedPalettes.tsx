import { useEffect, useRef, useState } from 'react'
import type { CustomPalette, SavedPalette } from '../lib/palettes'

interface SavedPalettesProps {
  palettes: SavedPalette[]
  activeId: string | null
  onSelect: (palette: CustomPalette) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function SavedPalettes({
  palettes,
  activeId,
  onSelect,
  onRename,
  onDelete,
}: SavedPalettesProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId) inputRef.current?.focus()
  }, [editingId])

  const startRename = (palette: CustomPalette) => {
    setEditingId(palette.id)
    setDraft(palette.name)
  }

  const commitRename = () => {
    if (editingId) onRename(editingId, draft)
    setEditingId(null)
  }

  const cancelRename = () => setEditingId(null)

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">我的配色</h3>
        <span className="text-[11px] text-ink-soft">
          共 {palettes.length} 个
        </span>
      </div>
      <ul className="space-y-1.5">
        {palettes.map((palette) => {
          const active = palette.id === activeId
          return (
            <li
              key={palette.id}
              className={`flex items-center gap-2 rounded-2xl border px-2.5 py-2 transition ${
                active
                  ? 'border-gold bg-surface-strong'
                  : 'border-line bg-surface'
              }`}
            >
              {editingId === palette.id ? (
                <>
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitRename()
                      if (event.key === 'Escape') cancelRename()
                    }}
                    maxLength={16}
                    aria-label="重命名配色"
                    className="min-w-0 flex-1 rounded-lg border border-gold-soft/70 bg-surface-solid px-2 py-1 text-sm text-ink outline-none"
                  />
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={commitRename}
                      className="rounded-lg bg-gold px-2.5 py-1 text-xs font-medium text-on-accent transition hover:bg-gold-soft"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="rounded-lg px-2 py-1 text-xs text-ink-soft transition hover:bg-surface-strong"
                    >
                      取消
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelect(palette)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="flex shrink-0 gap-1">
                      {palette.colors.map((color) => (
                        <span
                          key={color}
                          className="size-4 rounded-full border border-line"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    <span className="truncate text-sm text-ink">
                      {palette.name}
                    </span>
                    {active && (
                      <span className="grid size-4 shrink-0 place-items-center rounded-full bg-gold text-on-accent">
                        <svg viewBox="0 0 20 20" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10.5 8 14.5 16 5.5" />
                        </svg>
                      </span>
                    )}
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startRename(palette)}
                      aria-label={`重命名 ${palette.name}`}
                      className="grid size-7 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
                    >
                      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(palette.id)}
                      aria-label={`删除 ${palette.name}`}
                      className="grid size-7 place-items-center rounded-lg text-ink-soft transition hover:bg-red-500/10 hover:text-red-500"
                    >
                      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
