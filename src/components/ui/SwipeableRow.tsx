import { useRef, useState, type ReactNode, type TouchEvent } from 'react'

interface Props {
  children: ReactNode
  onSwipeRight?: () => void
  onSwipeLeft?: () => void
  rightLabel?: string
  leftLabel?: string
}

const THRESHOLD = 72
const MAX_DRAG = 120

/**
 * Envolve uma linha de lista e permite arrastar com o dedo pra disparar uma
 * ação: pra direita (ex.: concluir) ou pra esquerda (ex.: excluir). Só reage
 * a toque — no desktop (mouse) o conteúdo se comporta normalmente.
 */
export function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = '✓ Concluir',
  leftLabel = '✕ Excluir',
}: Props) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef<number | null>(null)

  function handleTouchStart(e: TouchEvent) {
    startX.current = e.touches[0].clientX
    setDragging(true)
  }

  function handleTouchMove(e: TouchEvent) {
    if (startX.current === null) return
    const delta = e.touches[0].clientX - startX.current
    setDragX(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, delta)))
  }

  function handleTouchEnd() {
    setDragging(false)
    if (dragX > THRESHOLD && onSwipeRight) onSwipeRight()
    else if (dragX < -THRESHOLD && onSwipeLeft) onSwipeLeft()
    setDragX(0)
    startX.current = null
  }

  return (
    <div className="relative overflow-hidden touch-pan-y">
      {(onSwipeRight || onSwipeLeft) && (
        <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-medium pointer-events-none">
          <span
            className={`bg-positive text-white rounded px-2 py-1 transition-opacity ${
              dragX > 24 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {rightLabel}
          </span>
          <span
            className={`bg-red-600 text-white rounded px-2 py-1 transition-opacity ${
              dragX < -24 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {leftLabel}
          </span>
        </div>
      )}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  )
}
