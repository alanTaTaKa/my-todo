import { useState } from 'react'

interface CharacterAvatarProps {
  src: string
  alt: string
  className?: string
}

export function CharacterAvatar({ src, alt, className }: CharacterAvatarProps) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={
        className ?? 'size-12 shrink-0 rounded-full border border-line object-cover'
      }
    />
  )
}
