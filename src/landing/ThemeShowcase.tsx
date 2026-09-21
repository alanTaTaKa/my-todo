import { useEffect, useState } from 'react'
import {
  MODES,
  THEME_IDS,
  themesForMode,
  themesInMode,
  type ModeId,
  type ThemeId,
} from '../lib/themes'

function initialTheme(): ThemeId {
  const current = document.documentElement.dataset.theme
  if (current && THEME_IDS.includes(current as ThemeId)) {
    return current as ThemeId
  }
  return 'fresh'
}

export function ThemeShowcase() {
  const [mode, setMode] = useState<ModeId>('minimal')
  const [selected, setSelected] = useState<ThemeId>(() => initialTheme())

  const themes =
    mode === 'minimal'
      ? themesForMode('minimal').filter((theme) => theme.id !== 'system')
      : themesInMode(mode)

  useEffect(() => {
    document.documentElement.dataset.theme = selected
  }, [selected])

  return (
    <section id="themes" className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-20">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
          挑一个今天的心情
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          26 套配色，点一下，整页就跟着变
        </p>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-sm rounded-full bg-surface p-0.5">
        {MODES.map((item) => {
          const active = item.id === mode
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              aria-pressed={active}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs transition ${
                active
                  ? 'bg-gold text-on-accent'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {item.name}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {themes.map((theme) => {
          const active = theme.id === selected
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelected(theme.id)}
              aria-pressed={active}
              className={`rounded-2xl border p-3 text-left transition ${
                active
                  ? 'border-gold bg-surface-strong'
                  : 'border-line bg-surface hover:bg-surface-2'
              }`}
            >
              <div className="flex gap-1">
                {theme.swatches.map((color) => (
                  <span
                    key={color}
                    className="size-5 rounded-full border border-line"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm font-medium text-ink">{theme.name}</p>
              <p className="mt-0.5 text-[11px] text-ink-soft">
                {theme.description}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
