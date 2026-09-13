import { useCallback, useEffect, useState } from 'react'
import type { Tag, TagColorKey } from '../types'
import { DEFAULT_TAGS, loadTags, saveTags } from '../lib/storage'
import { mergeById } from '../lib/merge'

function sameTag(a: Tag, b: Tag): boolean {
  return (
    a.name === b.name &&
    a.color === b.color &&
    a.createdAt === b.createdAt &&
    a.deletedAt === b.deletedAt
  )
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>(() => loadTags() ?? DEFAULT_TAGS)

  useEffect(() => {
    saveTags(tags)
  }, [tags])

  const addTag = (name: string, color: TagColorKey) => {
    const trimmed = name.trim()
    if (!trimmed) return

    setTags((prev) => {
      if (prev.some((tag) => tag.deletedAt === null && tag.name === trimmed)) return prev
      const now = Date.now()
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: trimmed,
          color,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ]
    })
  }

  const renameTag = (id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    setTags((prev) => {
      if (prev.some((tag) => tag.id !== id && tag.deletedAt === null && tag.name === trimmed)) {
        return prev
      }
      return prev.map((tag) =>
        tag.id === id ? { ...tag, name: trimmed, updatedAt: Date.now() } : tag,
      )
    })
  }

  const deleteTag = (id: string) => {
    const now = Date.now()
    setTags((prev) =>
      prev.map((tag) =>
        tag.id === id && tag.deletedAt === null
          ? { ...tag, deletedAt: now, updatedAt: now }
          : tag,
      ),
    )
  }

  const mergeTags = useCallback((incoming: Tag[]) => {
    setTags((prev) => mergeById(prev, incoming, sameTag))
  }, [])

  const visibleTags = tags.filter((tag) => tag.deletedAt === null)

  return {
    tags: visibleTags,
    allTags: tags,
    addTag,
    renameTag,
    deleteTag,
    mergeTags,
  }
}
