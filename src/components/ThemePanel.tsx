import { useEffect, useState } from 'react'
import { THEMES, type ThemeId } from '../lib/themes'
import {
  DUAL_PALETTES,
  TRI_PALETTES,
  type CustomPalette,
} from '../lib/palettes'
import { normalizeHex } from '../lib/color'
import { useDraggable } from '../hooks/useDraggable'
import { SavedPalettes } from './SavedPalettes'

const USER_PALETTE_ID = 'user-custom'

interface ThemePanelProps {
  themeId: ThemeId
  customPalette: CustomPalette | null
  savedPalettes: CustomPalette[]
  onSelect: (id: ThemeId) => void
  onSelectCustom: (palette: CustomPalette) => void
  onAddSavedPalette: (input: {
    mode: 'dual' | 'tri'
    colors: string[]
  }) => CustomPalette
  onRenameSavedPalette: (id: string, name: string) => void
  onDeleteSavedPalette: (id: string) => void
  onClose: () => void
}

export function ThemePanel({
  themeId,
  customPalette,
  savedPalettes,
  onSelect,
  onSelectCustom,
  onAddSavedPalette,
  onRenameSavedPalette,
  onDeleteSavedPalette,
  onClose,
}: ThemePanelProps) {
  const [view, setView] = useState<'presets' | 'custom'>('presets')
  const { offset, dragging, handleProps } = useDraggable()

  const isUserPalette = customPalette?.id === USER_PALETTE_ID
  const [userMode, setUserMode] = useState<'dual' | 'tri'>(
    isUserPalette && customPalette?.mode === 'tri' ? 'tri' : 'dual',
  )
  const [bgColor, setBgColor] = useState(
    isUserPalette && customPalette ? customPalette.colors[0] : '#f7f3eb',
  )
  const [assistColor, setAssistColor] = useState(
    isUserPalette && customPalette && customPalette.mode === 'tri'
      ? customPalette.colors[1]
      : '#a2cfd5',
  )
  const [accentColor, setAccentColor] = useState(
    isUserPalette && customPalette
      ? customPalette.mode === 'tri'
        ? customPalette.colors[2]
        : customPalette.colors[1]
      : '#5ba5b2',
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const customActive = themeId === 'custom'

  const applyUserPalette = (next: {
    bg: string
    assist: string
    accent: string
    mode: 'dual' | 'tri'
  }) => {
    const colors =
      next.mode === 'tri'
        ? [next.bg, next.assist, next.accent]
        : [next.bg, next.accent]
    onSelectCustom({
      id: USER_PALETTE_ID,
      name: '自选配色',
      mode: next.mode,
      colors,
    })
  }

  const updateMode = (mode: 'dual' | 'tri') => {
    setUserMode(mode)
    applyUserPalette({ bg: bgColor, assist: assistColor, accent: accentColor, mode })
  }

  const updateBg = (bg: string) => {
    setBgColor(bg)
    applyUserPalette({ bg, assist: assistColor, accent: accentColor, mode: userMode })
  }

  const updateAssist = (assist: string) => {
    setAssistColor(assist)
    applyUserPalette({ bg: bgColor, assist, accent: accentColor, mode: userMode })
  }

  const updateAccent = (accent: string) => {
    setAccentColor(accent)
    applyUserPalette({ bg: bgColor, assist: assistColor, accent, mode: userMode })
  }

  const handleAddPalette = () => {
    const colors =
      userMode === 'tri'
        ? [bgColor, assistColor, accentColor]
        : [bgColor, accentColor]
    const saved = onAddSavedPalette({ mode: userMode, colors })
    onSelectCustom(saved)
  }

  const handleSelectSaved = (palette: CustomPalette) => {
    setBgColor(palette.colors[0])
    if (palette.mode === 'tri') {
      setUserMode('tri')
      setAssistColor(palette.colors[1])
      setAccentColor(palette.colors[2])
    } else {
      setUserMode('dual')
      setAccentColor(palette.colors[1])
    }
    onSelectCustom(palette)
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
        aria-label="主题切换"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          userSelect: dragging ? 'none' : undefined,
        }}
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-line bg-cream/95 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.6)] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          {...handleProps}
          className={`flex touch-none select-none items-center justify-between border-b border-line px-5 py-4 ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="flex items-center gap-2">
            {view === 'custom' && (
              <button
                type="button"
                onClick={() => setView('presets')}
                aria-label="返回主题列表"
                className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-ink">
                {view === 'presets' ? '主题' : '自定义主题'}
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                {view === 'presets' ? '选择喜欢的配色' : '点击配色即可应用'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭主题"
            className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {view === 'presets' ? (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                {THEMES.map((theme) => {
                  const active = theme.id === themeId
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onSelect(theme.id)}
                      aria-pressed={active}
                      className={`rounded-2xl border p-3 text-left transition ${
                        active
                          ? 'border-gold bg-surface-strong'
                          : 'border-line bg-surface hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {theme.swatches.map((color) => (
                            <span
                              key={color}
                              className="size-5 rounded-full border border-line"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {active && <CheckBadge />}
                      </div>
                      <p className="mt-2 text-sm font-medium text-ink">{theme.name}</p>
                      <p className="mt-0.5 text-[11px] text-ink-soft">
                        {theme.description}
                      </p>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setView('custom')}
                className={`mt-2.5 flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                  customActive
                    ? 'border-gold bg-surface-strong'
                    : 'border-line bg-surface hover:bg-surface-2'
                }`}
              >
                <div className="flex items-center gap-2">
                  {customPalette ? (
                    <div className="flex gap-1">
                      {customPalette.colors.map((color) => (
                        <span
                          key={color}
                          className="size-5 rounded-full border border-line"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="grid size-6 place-items-center rounded-full bg-surface-2 text-ink-soft">
                      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  )}
                  <p className="text-sm font-medium text-ink">自定义主题</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {customActive && <CheckBadge />}
                  <svg viewBox="0 0 24 24" className="size-4 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            </>
          ) : (
            <div className="space-y-5">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-ink">自选配色</h3>
                  <div className="flex rounded-full bg-surface p-0.5">
                    {(['dual', 'tri'] as const).map((mode) => {
                      const active = userMode === mode
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => updateMode(mode)}
                          aria-pressed={active}
                          className={`rounded-full px-3 py-0.5 text-xs transition ${
                            active
                              ? 'bg-gold text-on-accent'
                              : 'text-ink-soft hover:text-ink'
                          }`}
                        >
                          {mode === 'dual' ? '双色' : '三色'}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div
                  className={`grid gap-2 ${
                    userMode === 'tri' ? 'grid-cols-3' : 'grid-cols-2'
                  }`}
                >
                  <ColorField label="背景" value={bgColor} onChange={updateBg} />
                  {userMode === 'tri' && (
                    <ColorField
                      label="辅助"
                      value={assistColor}
                      onChange={updateAssist}
                    />
                  )}
                  <ColorField
                    label={userMode === 'tri' ? '强调' : '辅助'}
                    value={accentColor}
                    onChange={updateAccent}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-ink-soft">
                  边选边预览，文字对比度自动适配
                </p>
                <button
                  type="button"
                  onClick={handleAddPalette}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gold px-3 py-2 text-xs font-medium text-on-accent transition hover:bg-gold-soft"
                >
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  添加为我的配色
                </button>
              </section>

              {savedPalettes.length > 0 && (
                <SavedPalettes
                  palettes={savedPalettes}
                  activeId={customActive ? customPalette?.id ?? null : null}
                  onSelect={handleSelectSaved}
                  onRename={onRenameSavedPalette}
                  onDelete={onDeleteSavedPalette}
                />
              )}

              <PaletteGroup
                title="双色搭配"
                hint="主色 · 辅助色"
                palettes={DUAL_PALETTES}
                activeId={customActive ? customPalette?.id ?? null : null}
                onSelect={onSelectCustom}
              />
              <PaletteGroup
                title="三色搭配"
                hint="背景 · 辅助 · 强调"
                palettes={TRI_PALETTES}
                activeId={customActive ? customPalette?.id ?? null : null}
                onSelect={onSelectCustom}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckBadge() {
  return (
    <span className="grid size-5 place-items-center rounded-full bg-gold text-on-accent">
      <svg viewBox="0 0 20 20" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10.5 8 14.5 16 5.5" />
      </svg>
    </span>
  )
}

interface PaletteGroupProps {
  title: string
  hint: string
  palettes: CustomPalette[]
  activeId: string | null
  onSelect: (palette: CustomPalette) => void
}

function PaletteGroup({
  title,
  hint,
  palettes,
  activeId,
  onSelect,
}: PaletteGroupProps) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        <span className="text-[11px] text-ink-soft">{hint}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {palettes.map((palette) => {
          const active = palette.id === activeId
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => onSelect(palette)}
              aria-pressed={active}
              className={`rounded-2xl border p-2.5 text-left transition ${
                active
                  ? 'border-gold bg-surface-strong'
                  : 'border-line bg-surface hover:bg-surface-2'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {palette.colors.map((color) => (
                    <span
                      key={color}
                      className="size-4 rounded-full border border-line"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {active && <CheckBadge />}
              </div>
              <p className="mt-1.5 text-xs text-ink">{palette.name}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [text, setText] = useState(value)

  const commitText = () => {
    const normalized = normalizeHex(text)
    if (normalized) {
      setText(normalized)
      onChange(normalized)
    } else {
      setText(value)
    }
  }

  const handlePick = (picked: string) => {
    setText(picked)
    onChange(picked)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-2 py-1.5">
      <input
        type="color"
        value={value}
        onChange={(event) => handlePick(event.target.value)}
        aria-label={`选择${label}颜色`}
        className="size-7 shrink-0 cursor-pointer rounded-md border border-line bg-transparent p-0"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] leading-tight text-ink-soft">
          {label}
        </span>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={commitText}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitText()
          }}
          spellCheck={false}
          aria-label={`${label}色值`}
          className="w-full bg-transparent font-mono text-[11px] uppercase text-ink outline-none"
        />
      </span>
    </div>
  )
}
