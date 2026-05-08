import { useTheme } from './useTheme'

/** Compact segmented control — Light (dating / editorial) vs Dark (Extra Good studio). */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme"
      className={`inline-flex rounded-full border border-border bg-muted/80 p-0.5 shadow-[var(--shadow-soft)] backdrop-blur-sm ${className}`}
    >
      <button
        type="button"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-150 ease-out md:px-3 ${
          theme === 'light'
            ? 'bg-card text-ink shadow-[var(--shadow-soft)] ring-1 ring-border-soft'
            : 'text-ink-secondary hover:text-ink'
        }`}
      >
        <SunIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
        <span className="hidden sm:inline">Light</span>
      </button>
      <button
        type="button"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-150 ease-out md:px-3 ${
          theme === 'dark'
            ? 'bg-card text-ink shadow-[var(--shadow-soft)] ring-1 ring-border-soft'
            : 'text-ink-secondary hover:text-ink'
        }`}
      >
        <MoonIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      />
    </svg>
  )
}
