import {
  useEffect,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  label: string
  onClose: () => void
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
  bodyClassName?: string
  headerClassName?: string
  dialogStyle?: CSSProperties
  handleProps?: HTMLAttributes<HTMLElement>
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({
  label,
  onClose,
  header,
  children,
  footer,
  size = 'md',
  bodyClassName = 'px-5 py-4',
  headerClassName = '',
  dialogStyle,
  handleProps,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={dialogStyle}
        className={`flex max-h-[85vh] w-full ${SIZE_CLASS[size]} flex-col rounded-t-3xl border border-line bg-cream/95 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.6)] sm:rounded-3xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          {...handleProps}
          className={`flex items-center justify-between gap-2 border-b border-line px-5 py-4 ${headerClassName}`}
        >
          <div className="min-w-0">{header}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`关闭${label}`}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-strong hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>

        {footer && (
          <div className="border-t border-line px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  )
}
