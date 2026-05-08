import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

const PANEL_CLASS =
  'fixed z-[200] w-[min(17rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-card p-3 text-left shadow-[var(--shadow-card)]'

function usePopoverChrome(open: boolean, onClose: () => void) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const measure = useCallback(() => {
    const b = btnRef.current?.getBoundingClientRect()
    if (!b) return
    const panelW = Math.min(272, window.innerWidth - 24)
    let left = b.right - panelW
    left = Math.max(12, Math.min(left, window.innerWidth - panelW - 12))
    setPos({ top: b.bottom + 8, left })
  }, [])

  useEffect(() => {
    if (!open) return
    measure()
    const onResize = () => measure()
    const onScroll = () => onClose()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      onClose()
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [open, measure, onClose])

  return { btnRef, panelRef, pos }
}

/** Dot = Lock prompt or has a recommended answer (priority lane — “go”, not danger). */
export function PriorityLaneExplainer() {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const { btnRef, panelRef, pos } = usePopoverChrome(open, close)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="What the priority dot means"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="rounded-full p-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-signal-priority focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <span
          className="block size-2 rounded-full bg-signal-priority shadow-[var(--shadow-signal-priority-dot)]"
          aria-hidden
        />
      </button>
      {open ? (
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="region"
            aria-label="Priority dot legend"
            style={{ top: pos.top, left: pos.left }}
            className={PANEL_CLASS}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-signal-priority">
              Recommended lane
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink">
              You&apos;ll see this dot when the prompt is tagged{' '}
              <strong className="font-medium text-ink">Lock</strong> (a core strategic slot) or when at
              least one answer is marked{' '}
              <strong className="font-medium text-ink">recommended</strong> — counting only answers still
              visible with your cliché filters.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              Think &quot;prioritize exploring here&quot; — not a verdict that other prompts are worse.
            </p>
          </div>,
          document.body,
        )
      ) : null}
    </>
  )
}

/** “!” = strength Use Carefully — craft carefully, not forbidden. */
export function UseCarefullyExplainer() {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const { btnRef, panelRef, pos } = usePopoverChrome(open, close)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="What the caution mark means"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="flex size-6 shrink-0 items-center justify-center rounded-full border font-sans text-sm font-bold leading-none outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-amber-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        style={{
          borderColor: 'var(--eg-signal-caution-border)',
          backgroundColor: 'var(--eg-signal-caution-bg)',
          color: 'var(--eg-signal-caution-text)',
        }}
      >
        <span aria-hidden>!</span>
      </button>
      {open ? (
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="region"
            aria-label="Caution mark legend"
            style={{ top: pos.top, left: pos.left }}
            className={PANEL_CLASS}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'var(--eg-signal-caution-heading)' }}
            >
              Use carefully
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink">
              This prompt&apos;s strength rating is <strong className="font-medium text-ink">Use Carefully</strong>{' '}
              — it can work beautifully with specificity, humor, or a concrete story beat.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              The mark is a nudge against generic answers — not a red flag to skip the prompt.
            </p>
          </div>,
          document.body,
        )
      ) : null}
    </>
  )
}
