import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

interface DragStart {
  pointerX: number
  pointerY: number
  offsetX: number
  offsetY: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function useDraggable() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const start = useRef<DragStart>({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 })

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, select')) return

    start.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return

    const maxX = window.innerWidth / 2 - 40
    const maxY = window.innerHeight / 2 - 40
    setOffset({
      x: clamp(start.current.offsetX + event.clientX - start.current.pointerX, -maxX, maxX),
      y: clamp(start.current.offsetY + event.clientY - start.current.pointerY, -maxY, maxY),
    })
  }

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return {
    offset,
    dragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  }
}
