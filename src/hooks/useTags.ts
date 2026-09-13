import { useEffect, useState } from 'react'
import type { Tag, TagColorKey } from '../types'
import { DEFAULT_TAGS, loadTags, saveTags } from '../lib/storage'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>(() => loadTags() ?? DEFAULT_TAGS)

  useEffect(() => {
    saveTags(tags)
  }, [tags])

  const addTag = (name: string, color: TagColorKey) => {
    const trimmed = name.trim()
    if (!trimmed) return

    setTags((prev) => {
      if (prev.some((tag) => tag.name === trimmed)) return prev
      return [
        ...prev,
        { id: crypto.randomUUID(), name: trimmed, color, createdAt: Date.now() },
      ]
    })
  }

  const renameTag = (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    setTags((prev) => {
      if (
        prev.some((tag) => tag.id !== id && tag.name === trimmed)
      ) {
        return prev
      }
      return prev.map((tag) => (tag.id === id ? { ...tag, name: trimmed } : tag))
    })
  }

  const deleteTag = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id))
  }

  return { tags, addTag, renameTag, deleteTag }
}
