import { useEffect, useState } from 'react'
import { resolveTheme, type ThemeId } from '../lib/themes'
import type { CustomPalette } from '../lib/palettes'
import { buildCustomThemeCss, deriveCustomTheme } from '../lib/customTheme'
import {
  loadCustomPalette,
  loadSavedPalettes,
  loadThemeId,
  saveCustomPalette,
  saveCustomThemeCss,
  saveSavedPalettes,
  saveThemeId,
} from '../lib/storage'

const CUSTOM_STYLE_ID = 'custom-theme-style'

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => loadThemeId())
  const [customPalette, setCustomPalette] = useState<CustomPalette | null>(() =>
    loadCustomPalette(),
  )
  const [savedPalettes, setSavedPalettes] = useState<CustomPalette[]>(() =>
    loadSavedPalettes(),
  )

  useEffect(() => {
    saveThemeId(themeId)
  }, [themeId])

  useEffect(() => {
    saveSavedPalettes(savedPalettes)
  }, [savedPalettes])

  useEffect(() => {
    if (!customPalette) return

    const css = buildCustomThemeCss(deriveCustomTheme(customPalette))
    saveCustomPalette(customPalette)
    saveCustomThemeCss(css)

    let style = document.getElementById(CUSTOM_STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = CUSTOM_STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = css
  }, [customPalette])

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(themeId)
    }
    apply()

    if (themeId === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
    return undefined
  }, [themeId])

  const applyCustomTheme = (palette: CustomPalette) => {
    setCustomPalette(palette)
    setThemeId('custom')
  }

  const addSavedPalette = (input: {
    mode: 'dual' | 'tri'
    colors: string[]
  }): CustomPalette => {
    const palette: CustomPalette = {
      id: crypto.randomUUID(),
      name: `我的配色 ${savedPalettes.length + 1}`,
      mode: input.mode,
      colors: input.colors,
    }
    setSavedPalettes((prev) => [...prev, palette])
    return palette
  }

  const renameSavedPalette = (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSavedPalettes((prev) =>
      prev.map((palette) =>
        palette.id === id ? { ...palette, name: trimmed } : palette,
      ),
    )
    setCustomPalette((prev) =>
      prev && prev.id === id ? { ...prev, name: trimmed } : prev,
    )
  }

  const deleteSavedPalette = (id: string) => {
    setSavedPalettes((prev) => prev.filter((palette) => palette.id !== id))
  }

  return {
    themeId,
    setThemeId,
    customPalette,
    applyCustomTheme,
    savedPalettes,
    addSavedPalette,
    renameSavedPalette,
    deleteSavedPalette,
  }
}
