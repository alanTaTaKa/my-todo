import { useCallback, useEffect, useMemo, useState } from 'react'
import { resolveTheme, type ThemeId } from '../lib/themes'
import type { CustomPalette, SavedPalette } from '../lib/palettes'
import { buildCustomThemeCss, deriveCustomTheme } from '../lib/customTheme'
import { mergeById } from '../lib/merge'
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

function syncThemeColor() {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg-base')
    .trim()
  if (!color) return

  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}

function samePalette(a: SavedPalette, b: SavedPalette): boolean {
  return (
    a.name === b.name &&
    a.mode === b.mode &&
    a.createdAt === b.createdAt &&
    a.deletedAt === b.deletedAt &&
    a.colors.length === b.colors.length &&
    a.colors.every((color, index) => color === b.colors[index])
  )
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => loadThemeId())
  const [customPalette, setCustomPalette] = useState<CustomPalette | null>(() =>
    loadCustomPalette(),
  )
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>(() =>
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
    syncThemeColor()
  }, [customPalette])

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(themeId)
      syncThemeColor()
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
  }): SavedPalette => {
    const now = Date.now()
    const visibleCount = savedPalettes.filter(
      (palette) => palette.deletedAt === null,
    ).length
    const palette: SavedPalette = {
      id: crypto.randomUUID(),
      name: `我的配色 ${visibleCount + 1}`,
      mode: input.mode,
      colors: input.colors,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    setSavedPalettes((prev) => [...prev, palette])
    return palette
  }

  const renameSavedPalette = (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const now = Date.now()
    setSavedPalettes((prev) =>
      prev.map((palette) =>
        palette.id === id ? { ...palette, name: trimmed, updatedAt: now } : palette,
      ),
    )
    setCustomPalette((prev) =>
      prev && prev.id === id ? { ...prev, name: trimmed } : prev,
    )
  }

  const deleteSavedPalette = (id: string) => {
    const now = Date.now()
    setSavedPalettes((prev) =>
      prev.map((palette) =>
        palette.id === id && palette.deletedAt === null
          ? { ...palette, deletedAt: now, updatedAt: now }
          : palette,
      ),
    )
  }

  const mergePalettes = useCallback((incoming: SavedPalette[]) => {
    setSavedPalettes((prev) => mergeById(prev, incoming, samePalette))
  }, [])

  const resetPalettes = useCallback(() => {
    setSavedPalettes([])
  }, [])

  const visiblePalettes = useMemo(
    () => savedPalettes.filter((palette) => palette.deletedAt === null),
    [savedPalettes],
  )

  return {
    themeId,
    setThemeId,
    customPalette,
    applyCustomTheme,
    savedPalettes: visiblePalettes,
    allPalettes: savedPalettes,
    addSavedPalette,
    renameSavedPalette,
    deleteSavedPalette,
    mergePalettes,
    resetPalettes,
  }
}
