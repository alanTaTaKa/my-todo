import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Tag, TagColorKey } from '../types'
import { TAG_PALETTE, getTagPalette } from '../lib/tags'

interface TagManagerProps {
  tags: Tag[]
  onAdd: (name: string, color: TagColorKey) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function TagManager({ tags, onAdd, onRename, onDelete }: TagManagerProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState<TagColorKey>('gold')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId) renameRef.current?.focus()
  }, [editingId])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onAdd(name, color)
    setName('')
  }

  const startRename = (tag: Tag) => {
    setEditingId(tag.id)
    setEditingName(tag.name)
  }

  const commitRename = () => {
    if (editingId) onRename(editingId, editingName)
    setEditingId(null)
  }

  const cancelRename = () => setEditingId(null)

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commitRename()
    if (event.key === 'Escape') cancelRename()
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-soft p-3">
      <p className="mb-2 text-xs font-medium tracking-wide text-ink-soft">
        管理标签
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="新标签名称"
            aria-label="新标签名称"
            maxLength={12}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface-strong px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-gold-soft focus:bg-surface-solid"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="shrink-0 rounded-xl bg-gold px-4 py-2 text-sm font-medium text-on-accent transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            添加
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TAG_PALETTE.map((item) => {
            const active = color === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setColor(item.key)}
                aria-label={item.label}
                aria-pressed={active}
                title={item.label}
                className={`size-6 rounded-full border-2 transition ${
                  active ? 'scale-110 border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: item.strong }}
              />
            )
          })}
        </div>
      </form>

      {tags.length > 0 && (
        <ul className="mt-3 space-y-1">
          {tags.map((tag) => {
            const palette = getTagPalette(tag.color)
            const editing = editingId === tag.id

            return (
              <li
                key={tag.id}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 transition hover:bg-surface-2"
              >
                {editing ? (
                  <>
                    <input
                      ref={renameRef}
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={handleRenameKeyDown}
                      aria-label="重命名标签"
                      maxLength={12}
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
                        className="rounded-lg px-2.5 py-1 text-xs text-ink-soft transition hover:bg-surface-strong"
                      >
                        取消
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      className="inline-flex min-w-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
                      style={{ backgroundColor: palette.soft, color: palette.strong }}
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: palette.strong }}
                      />
                      <span className="truncate">{tag.name}</span>
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startRename(tag)}
                        aria-label={`重命名标签 ${tag.name}`}
                        className="grid size-7 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
                      >
                        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tag.id)}
                        aria-label={`删除标签 ${tag.name}`}
                        className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-red-500/10 hover:text-red-500"
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
      )}
    </div>
  )
}
