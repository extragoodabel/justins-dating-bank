import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'

import { usePromptBankPersistenceContext } from './context/usePromptBankPersistenceContext'
import { PROMPT_BANK_STORAGE_KEY } from './hooks/usePromptBankStorage'
import { downloadWorkspaceSave, parseWorkspaceImport } from './hooks/promptBankPersistIo'
import { exportMatchTrackerBlob, useMatchTracker } from './hooks/useMatchTrackerStorage'

export default function SaveProgressTab() {
  const { persisted, replacePersisted, resetPersisted } = usePromptBankPersistenceContext()
  const matchTrackerApi = useMatchTracker()

  const importSaveInputRef = useRef<HTMLInputElement | null>(null)
  const [banner, setBanner] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null)

  useEffect(() => {
    if (!banner) return
    const t = window.setTimeout(() => setBanner(null), 4500)
    return () => window.clearTimeout(t)
  }, [banner])

  const handleExport = useCallback(() => {
    downloadWorkspaceSave(
      PROMPT_BANK_STORAGE_KEY,
      persisted,
      exportMatchTrackerBlob(matchTrackerApi),
    )
    setBanner({ text: 'Download started — check your downloads folder.', kind: 'ok' })
  }, [persisted, matchTrackerApi])

  const handleImportPick = useCallback(() => {
    importSaveInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      try {
        const text = await file.text()
        let parsed: unknown
        try {
          parsed = JSON.parse(text) as unknown
        } catch {
          setBanner({ text: 'Import failed: file is not valid JSON.', kind: 'err' })
          return
        }
        const result = parseWorkspaceImport(parsed)
        if (!result.ok) {
          setBanner({ text: result.error, kind: 'err' })
          return
        }
        const confirmReplace = window.confirm(
          'Importing replaces your prompt bank in this browser. If this file includes match notes, those replace your Match Tracker too. Continue?',
        )
        if (!confirmReplace) return
        replacePersisted(result.promptBank)
        if (result.matchTracker !== 'preserve') {
          matchTrackerApi.replaceAll(result.matchTracker)
        }
        setBanner({ text: 'Import complete — restored to this browser.', kind: 'ok' })
      } catch {
        setBanner({ text: 'Import failed: could not read file.', kind: 'err' })
      }
    },
    [replacePersisted, matchTrackerApi],
  )

  const handleReset = useCallback(() => {
    const ok = window.confirm(
      'Clear all local edits for this prompt bank in this browser? This cannot be undone.',
    )
    if (!ok) return
    resetPersisted()
    setBanner({ text: 'Local prompt bank edits cleared.', kind: 'ok' })
  }, [resetPersisted])

  return (
    <div className="min-h-[calc(100dvh-52px)] px-5 py-8 pb-16 md:px-12">
      <header className="max-w-2xl">
        <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-accent">
          Extra Good · Backup
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-[0.015em] md:text-3xl">Save progress</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Everything lives in this browser until you export. Grab a JSON backup before clearing data,
          switching devices, or sharing work with the team.
        </p>
      </header>

      <div className="stitch-rule mx-auto mt-2 max-w-2xl opacity-[0.22]" aria-hidden />

      <section className="card-stock mt-10 max-w-xl rounded-2xl border border-border-soft bg-card p-6">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-accent">
          Local storage
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Saved locally in this browser only. Export a backup if you want to keep or share your
          work (prompt bank + match tracker + Signal Report notes).
        </p>

        {banner ? (
          <p
            className={`mt-5 font-sans text-[11px] leading-snug ${
              banner.kind === 'err' ? 'text-red-700' : 'text-accent'
            }`}
          >
            {banner.text}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-accent/40 bg-accent-soft px-5 py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-ink transition-colors hover:bg-accent-soft"
          >
            Export project
          </button>
          <button
            type="button"
            onClick={handleImportPick}
            className="rounded-xl border border-border bg-card px-5 py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-accent/30"
          >
            Import project
          </button>
          <input
            ref={importSaveInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={handleImportFile}
          />
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-border px-5 py-3 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-rose-warm/35 hover:text-rose-warm"
          >
            Reset local edits
          </button>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-ink-soft">
          Reset clears prompt bank customizations in this browser only. It does not remove Match
          Tracker entries — use export/import if you need a full snapshot or wipe matches via Match
          Tracker.
        </p>
      </section>
    </div>
  )
}
