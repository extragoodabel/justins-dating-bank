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
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9EFF6B]">
          Extra Good · Backup
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Save progress</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#A1A1A1]">
          Everything lives in this browser until you export. Grab a JSON backup before clearing data,
          switching devices, or sharing work with the team.
        </p>
      </header>

      <section className="mt-10 max-w-xl rounded-2xl border border-[#2A2A2A] bg-[#111]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
          Local storage
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#A1A1A1]">
          Saved locally in this browser only. Export a backup if you want to keep or share your
          work (prompt bank + match tracker + Signal Report notes).
        </p>

        {banner ? (
          <p
            className={`mt-5 font-mono text-[11px] leading-snug ${
              banner.kind === 'err' ? 'text-red-300/95' : 'text-[#9EFF6B]'
            }`}
          >
            {banner.text}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-[#9EFF6B]/45 bg-[#9EFF6B]/10 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9EFF6B] transition hover:bg-[#9EFF6B]/18"
          >
            Export project
          </button>
          <button
            type="button"
            onClick={handleImportPick}
            className="rounded-xl border border-[#2A2A2A] bg-[#151515] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5F5F5] transition hover:border-[#9EFF6B]/35"
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
            className="rounded-xl border border-[#2A2A2A] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#888888] transition hover:border-red-900/55 hover:text-red-200/90"
          >
            Reset local edits
          </button>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-[#6b6b6b]">
          Reset clears prompt bank customizations in this browser only. It does not remove Match
          Tracker entries — use export/import if you need a full snapshot or wipe matches via Match
          Tracker.
        </p>
      </section>
    </div>
  )
}
