import { useMemo, useState } from 'react'

import { usePromptBankPersistenceContext } from './context/usePromptBankPersistenceContext'
import type {
  ConversationNotes,
  DateNote,
  DatingApp,
  FitSignalRating,
  MatchRecord,
  MatchStatus,
  OverallFit,
  SourceType,
} from './data/matchTrackerTypes'
import { DATING_APPS, FIT_SIGNAL_META } from './data/matchTrackerTypes'
import { createEmptyMatchId } from './data/matchTrackerNormalize'
import { createEmptyMatch, useMatchTracker } from './hooks/useMatchTrackerStorage'

const SOURCE_TYPES: SourceType[] = ['Prompt', 'Photo', 'Other']
const STATUSES: MatchStatus[] = [
  'Matched',
  'Messaging',
  'Date Planned',
  'Date 1',
  'Date 2',
  'Date 3+',
  'Paused',
  'Ended',
]
const OVERALL: OverallFit[] = ['Too Early', 'Possible Fit', 'High Fit', 'Low Fit']
const FIT_RATINGS: FitSignalRating[] = ['Strong', 'Possible', 'Unclear', 'Mismatch']

function preview(text: string | undefined, max = 96): string {
  const t = (text ?? '').trim()
  if (!t) return '—'
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

function fitChipClass(r: FitSignalRating): string {
  switch (r) {
    case 'Strong':
      return 'border-[#9EFF6B]/55 bg-[#9EFF6B]/12 text-[#C8F5A8]'
    case 'Possible':
      return 'border-[#9EFF6B]/22 bg-[#151515] text-[#A8C990]'
    case 'Unclear':
      return 'border-[#2A2A2A] bg-[#151515] text-[#8a8a8a]'
    case 'Mismatch':
      return 'border-amber-800/45 bg-amber-950/28 text-amber-100/85'
  }
}

function overallClass(fit: OverallFit): string {
  switch (fit) {
    case 'High Fit':
      return 'border-[#9EFF6B]/45 bg-[#9EFF6B]/10 text-[#C8F5A8]'
    case 'Possible Fit':
      return 'border-[#9EFF6B]/18 bg-[#151515] text-[#cbcbcb]'
    case 'Low Fit':
      return 'border-amber-800/40 bg-amber-950/22 text-amber-100/80'
    case 'Too Early':
      return 'border-[#2A2A2A] bg-[#151515] text-[#A1A1A1]'
  }
}

function cloneMatch(m: MatchRecord): MatchRecord {
  return {
    ...m,
    fitSignals: { ...m.fitSignals },
    interests: m.interests ? [...m.interests] : undefined,
    conversationNotes: m.conversationNotes ? { ...m.conversationNotes } : undefined,
    dates: m.dates ? m.dates.map((d) => ({ ...d })) : [],
  }
}

function signalSummary(m: MatchRecord): { strong: number; mismatch: number } {
  let strong = 0
  let mismatch = 0
  for (const v of Object.values(m.fitSignals)) {
    if (v === 'Strong') strong += 1
    if (v === 'Mismatch') mismatch += 1
  }
  return { strong, mismatch }
}

function emptyDateNote(): DateNote {
  return {
    id: createEmptyMatchId(),
    dateNumber: 'Date 1',
    date: new Date().toISOString().slice(0, 10),
  }
}

const inputClass =
  'mt-2 w-full rounded-xl border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#F5F5F5] outline-none placeholder:text-[#6b6b6b] focus:border-[#9EFF6B]/45'
const labelClass = 'block font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]'
const sectionClass =
  'rounded-2xl border border-[#2A2A2A] bg-[#111]/90 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]'

export default function MatchTrackerTab() {
  const { prompts } = usePromptBankPersistenceContext()
  const { matches, upsertMatch, deleteMatch } = useMatchTracker()

  const [filterStatus, setFilterStatus] = useState<MatchStatus | 'all'>('all')
  const [filterFit, setFilterFit] = useState<OverallFit | 'all'>('all')
  const [filterPromptId, setFilterPromptId] = useState<string | 'all'>('all')
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<MatchRecord>(() => createEmptyMatch())

  const openMatch = (m: MatchRecord) => {
    setActiveId(m.id)
    setDraft(cloneMatch(m))
  }

  const promptOptions = useMemo(
    () =>
      [...prompts].sort((a, b) => a.prompt.localeCompare(b.prompt)),
    [prompts],
  )

  const promptById = useMemo(() => new Map(prompts.map((p) => [p.id, p])), [prompts])

  const selectedPromptAnswers = useMemo(() => {
    if (!draft.sourcePromptId) return []
    const p = promptById.get(draft.sourcePromptId)
    return p?.answers ?? []
  }, [draft.sourcePromptId, promptById])

  const filteredMatches = useMemo(() => {
    const q = search.trim().toLowerCase()
    return matches.filter((m) => {
      if (filterStatus !== 'all' && m.status !== filterStatus) return false
      if (filterFit !== 'all' && m.overallFit !== filterFit) return false
      if (filterPromptId !== 'all') {
        if (filterPromptId === '__none__') {
          if (m.sourcePromptId) return false
        } else if (m.sourcePromptId !== filterPromptId) return false
      }
      if (!q) return true
      const blob = [
        m.name,
        m.notes,
        m.firstMessage,
        m.sourcePromptLabel,
        m.sourceAnswerText,
        m.location,
        (m.interests ?? []).join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }, [matches, filterStatus, filterFit, filterPromptId, search])

  const handleAdd = () => {
    const m = createEmptyMatch()
    setDraft(m)
    setActiveId(m.id)
  }

  const handleSave = () => {
    upsertMatch(draft)
    setActiveId(draft.id)
  }

  const handleDelete = () => {
    const saved = matches.some((x) => x.id === draft.id)
    if (!saved) {
      setActiveId(null)
      setDraft(createEmptyMatch())
      return
    }
    const ok = window.confirm(
      'Remove this match note from this browser? This does not change anything on the apps.',
    )
    if (!ok) return
    deleteMatch(draft.id)
    setActiveId(null)
    setDraft(createEmptyMatch())
  }

  const updateDraft = (patch: Partial<MatchRecord>) => {
    setDraft((d) => ({ ...d, ...patch }))
  }

  const updateConversation = (patch: Partial<ConversationNotes>) => {
    setDraft((d) => ({
      ...d,
      conversationNotes: { ...d.conversationNotes, ...patch },
    }))
  }

  const updateDateRow = (id: string, patch: Partial<DateNote>) => {
    setDraft((d) => ({
      ...d,
      dates: (d.dates ?? []).map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }))
  }

  const addDateRow = () => {
    setDraft((d) => ({
      ...d,
      dates: [...(d.dates ?? []), emptyDateNote()],
    }))
  }

  const removeDateRow = (id: string) => {
    setDraft((d) => ({
      ...d,
      dates: (d.dates ?? []).filter((row) => row.id !== id),
    }))
  }

  return (
    <div className="flex min-h-[calc(100dvh-52px)] flex-col">
      <header className="border-b border-[#2A2A2A] px-5 py-8 md:px-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9EFF6B]">
          Extra Good · Match notes
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
          Match Tracker
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A1A1A1]">
          Compatibility signals and conversation learnings — framed around what fits your life and
          values, not &quot;scoring&quot; anyone.
        </p>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[#6b6b6b]">
          Saved locally in this browser. Use initials or nicknames if you want to keep this private.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-5 py-6 lg:flex-row lg:gap-8 lg:px-12 lg:py-8">
        <aside className="flex min-h-0 w-full flex-col gap-4 lg:max-w-[380px] lg:shrink-0">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-full border border-[#9EFF6B]/45 bg-[#9EFF6B]/14 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#E9FFB8] hover:bg-[#9EFF6B]/22"
            >
              Add match
            </button>
          </div>

          <label className={labelClass}>
            Search
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, notes, prompt, interests…"
              className={inputClass}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className={labelClass}>
              Status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as MatchStatus | 'all')}
                className={inputClass}
              >
                <option value="all">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Overall fit
              <select
                value={filterFit}
                onChange={(e) => setFilterFit(e.target.value as OverallFit | 'all')}
                className={inputClass}
              >
                <option value="all">All</option>
                {OVERALL.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${labelClass} sm:col-span-2 lg:col-span-1`}>
              Source prompt
              <select
                value={filterPromptId}
                onChange={(e) => setFilterPromptId(e.target.value as string | 'all')}
                className={inputClass}
              >
                <option value="all">All sources</option>
                <option value="__none__">Photo / other / unknown</option>
                {promptOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {preview(p.prompt, 56)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-8">
            {filteredMatches.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#2A2A2A] px-4 py-10 text-center text-sm text-[#6b6b6b]">
                No matches match these filters yet.
              </p>
            ) : (
              filteredMatches.map((m) => {
                const { strong, mismatch } = signalSummary(m)
                const active = activeId === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openMatch(m)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      active
                        ? 'border-[#9EFF6B]/45 bg-[#9EFF6B]/08'
                        : 'border-[#2A2A2A] bg-[#111]/90 hover:border-[#3a3a3a]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#F5F5F5]">
                          {m.name.trim() || 'Untitled match'}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6b6b]">
                          {m.app} · matched {m.dateMatched || '—'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${overallClass(m.overallFit)}`}
                      >
                        {m.overallFit}
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#A1A1A1]">
                      {m.status}
                    </p>
                    <p className="mt-2 text-xs text-[#A1A1A1]">
                      <span className="text-[#6b6b6b]">Source · </span>
                      {preview(
                        m.sourceType === 'Prompt'
                          ? m.sourcePromptLabel ?? promptById.get(m.sourcePromptId ?? '')?.prompt
                          : m.sourcePromptLabel || m.sourceType,
                        72,
                      )}
                    </p>
                    <p className="mt-1 text-xs italic text-[#8a8a8a]">
                      “{preview(m.firstMessage, 88)}”
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-[#2A2A2A] bg-[#151515] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#9EFF6B]">
                        {strong} strong signals
                      </span>
                      {mismatch > 0 ? (
                        <span className="rounded-md border border-amber-900/35 bg-amber-950/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-amber-100/85">
                          {mismatch} caution
                        </span>
                      ) : null}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-16">
          <div className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A]/80 pb-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {draft.name.trim() || 'New match note'}
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
                  Profile barometer · conversation learnings
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full border border-[#9EFF6B]/45 bg-[#9EFF6B]/14 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#E9FFB8]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full border border-[#3a3a3a] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#A1A1A1] hover:border-amber-900/45 hover:text-amber-100"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
                  Basic info
                </h3>
                <label className={labelClass}>
                  Name / nickname
                  <input
                    value={draft.name}
                    onChange={(e) => updateDraft({ name: e.target.value })}
                    className={inputClass}
                    placeholder="Initials are fine"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Age
                    <input
                      value={draft.age ?? ''}
                      onChange={(e) => updateDraft({ age: e.target.value || undefined })}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </label>
                  <label className={labelClass}>
                    Location
                    <input
                      value={draft.location ?? ''}
                      onChange={(e) => updateDraft({ location: e.target.value || undefined })}
                      className={inputClass}
                      placeholder="City / region"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    App
                    <select
                      value={draft.app}
                      onChange={(e) => updateDraft({ app: e.target.value as DatingApp })}
                      className={inputClass}
                    >
                      {DATING_APPS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Date matched
                    <input
                      type="date"
                      value={draft.dateMatched?.slice(0, 10) ?? ''}
                      onChange={(e) => updateDraft({ dateMatched: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                </div>
                <label className={labelClass}>
                  Conversation status
                  <select
                    value={draft.status}
                    onChange={(e) => updateDraft({ status: e.target.value as MatchStatus })}
                    className={inputClass}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Overall compatibility read
                  <select
                    value={draft.overallFit}
                    onChange={(e) => updateDraft({ overallFit: e.target.value as OverallFit })}
                    className={inputClass}
                  >
                    {OVERALL.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
                  What they responded to
                </h3>
                <label className={labelClass}>
                  Source type
                  <select
                    value={draft.sourceType}
                    onChange={(e) => {
                      const st = e.target.value as SourceType
                      updateDraft({
                        sourceType: st,
                        ...(st !== 'Prompt'
                          ? { sourcePromptId: undefined, sourceAnswerText: undefined }
                          : {}),
                      })
                    }}
                    className={inputClass}
                  >
                    {SOURCE_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                {draft.sourceType === 'Prompt' ? (
                  <>
                    <label className={labelClass}>
                      Prompt from bank
                      <select
                        value={draft.sourcePromptId ?? ''}
                        onChange={(e) => {
                          const pid = e.target.value || undefined
                          const p = pid ? promptById.get(pid) : undefined
                          setDraft((d) => ({
                            ...d,
                            sourcePromptId: pid,
                            sourcePromptLabel: p?.prompt ?? d.sourcePromptLabel,
                            sourceAnswerText: undefined,
                          }))
                        }}
                        className={inputClass}
                      >
                        <option value="">Select…</option>
                        {promptOptions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {preview(p.prompt, 70)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Answer line (optional)
                      <select
                        value={
                          selectedPromptAnswers.some((a) => a.text === draft.sourceAnswerText)
                            ? draft.sourceAnswerText
                            : ''
                        }
                        onChange={(e) =>
                          updateDraft({
                            sourceAnswerText: e.target.value || undefined,
                          })
                        }
                        className={inputClass}
                      >
                        <option value="">Pick text or type below</option>
                        {selectedPromptAnswers.map((a) => (
                          <option key={a.id} value={a.text}>
                            {preview(a.text, 80)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}
                <label className={labelClass}>
                  {draft.sourceType === 'Prompt'
                    ? 'Answer text (free edit)'
                    : 'Label (photo name, vibe, etc.)'}
                  <textarea
                    value={
                      draft.sourceType === 'Prompt'
                        ? (draft.sourceAnswerText ?? '')
                        : (draft.sourcePromptLabel ?? '')
                    }
                    onChange={(e) => {
                      const v = e.target.value
                      if (draft.sourceType === 'Prompt') updateDraft({ sourceAnswerText: v })
                      else updateDraft({ sourcePromptLabel: v })
                    }}
                    rows={3}
                    className={`${inputClass} resize-y`}
                    placeholder={
                      draft.sourceType === 'Prompt'
                        ? 'Exact line live on profile…'
                        : 'Short note on what they saw…'
                    }
                  />
                </label>
                <label className={labelClass}>
                  Their opener / first comment
                  <textarea
                    value={draft.firstMessage ?? ''}
                    onChange={(e) => updateDraft({ firstMessage: e.target.value || undefined })}
                    rows={3}
                    className={`${inputClass} resize-y`}
                    placeholder="What stood out in their first message?"
                  />
                </label>
              </div>
            </div>

            <div className={`${sectionClass} mt-8 border-[#2A2A2A] bg-[#0d0d0d]`}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
                Fit signals
              </h3>
              <p className="mt-2 text-xs text-[#6b6b6b]">
                Reflective tags — not a report card. Strong / Possible / Unclear / gentle mismatch.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {FIT_SIGNAL_META.map(({ key, label }) => (
                  <label key={key} className={labelClass}>
                    {label}
                    <select
                      value={draft.fitSignals[key]}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          fitSignals: {
                            ...d.fitSignals,
                            [key]: e.target.value as FitSignalRating,
                          },
                        }))
                      }
                      className={inputClass}
                    >
                      {FIT_RATINGS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <span
                        className={`inline-block rounded-lg border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${fitChipClass(draft.fitSignals[key])}`}
                      >
                        {draft.fitSignals[key]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={`${sectionClass} mt-8 border-[#2A2A2A] bg-[#0d0d0d]`}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
                Conversation notes
              </h3>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className={labelClass}>
                  What did they respond to?
                  <textarea
                    value={draft.conversationNotes?.whatTheyRespondedTo ?? ''}
                    onChange={(e) =>
                      updateConversation({ whatTheyRespondedTo: e.target.value || undefined })
                    }
                    rows={2}
                    className={`${inputClass} resize-y`}
                  />
                </label>
                <label className={labelClass}>
                  What did they ask about?
                  <textarea
                    value={draft.conversationNotes?.whatTheyAskedAbout ?? ''}
                    onChange={(e) =>
                      updateConversation({ whatTheyAskedAbout: e.target.value || undefined })
                    }
                    rows={2}
                    className={`${inputClass} resize-y`}
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-[#A1A1A1]">
                  <input
                    type="checkbox"
                    checked={!!draft.conversationNotes?.didConversationFeelEasy}
                    onChange={(e) =>
                      updateConversation({ didConversationFeelEasy: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#2A2A2A] bg-[#151515] accent-[#9EFF6B]"
                  />
                  Conversation felt easy
                </label>
                <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-[#A1A1A1]">
                  <input
                    type="checkbox"
                    checked={!!draft.conversationNotes?.didTheyShowCuriosity}
                    onChange={(e) =>
                      updateConversation({ didTheyShowCuriosity: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#2A2A2A] bg-[#151515] accent-[#9EFF6B]"
                  />
                  They showed curiosity
                </label>
                <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-[#A1A1A1]">
                  <input
                    type="checkbox"
                    checked={!!draft.conversationNotes?.didItFeelLikeInterview}
                    onChange={(e) =>
                      updateConversation({ didItFeelLikeInterview: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#2A2A2A] bg-[#151515] accent-[#9EFF6B]"
                  />
                  Felt interview-y
                </label>
                <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-[#A1A1A1]">
                  <input
                    type="checkbox"
                    checked={!!draft.conversationNotes?.movedTowardDate}
                    onChange={(e) => updateConversation({ movedTowardDate: e.target.checked })}
                    className="h-4 w-4 rounded border-[#2A2A2A] bg-[#151515] accent-[#9EFF6B]"
                  />
                  Moved toward a date
                </label>
                <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-[#A1A1A1]">
                  <input
                    type="checkbox"
                    checked={!!draft.conversationNotes?.conversationStalled}
                    onChange={(e) =>
                      updateConversation({ conversationStalled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#2A2A2A] bg-[#151515] accent-[#9EFF6B]"
                  />
                  Conversation stalled
                </label>
              </div>
              <label className={`${labelClass} mt-4 block`}>
                Chemistry / rhythm notes
                <textarea
                  value={draft.conversationNotes?.chemistryNotes ?? ''}
                  onChange={(e) =>
                    updateConversation({ chemistryNotes: e.target.value || undefined })
                  }
                  rows={3}
                  className={`${inputClass} resize-y`}
                  placeholder="Moments that felt alive, awkward, or ambiguous…"
                />
              </label>
              <label className={`${labelClass} mt-4 block`}>
                If it stalled — what might explain it?
                <textarea
                  value={draft.conversationNotes?.stallNotes ?? ''}
                  onChange={(e) => updateConversation({ stallNotes: e.target.value || undefined })}
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </label>
            </div>

            <div className={`${sectionClass} mt-8 border-[#2A2A2A] bg-[#0d0d0d]`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
                  Date notes
                </h3>
                <button
                  type="button"
                  onClick={addDateRow}
                  className="rounded-full border border-[#2A2A2A] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#A1A1A1] hover:border-[#9EFF6B]/35"
                >
                  Add date
                </button>
              </div>
              <div className="mt-5 space-y-6">
                {(draft.dates ?? []).length === 0 ? (
                  <p className="text-sm text-[#6b6b6b]">
                    No dates logged yet — add one when you meet up.
                  </p>
                ) : (
                  (draft.dates ?? []).map((dn, idx) => (
                    <div
                      key={dn.id}
                      className="rounded-xl border border-[#2A2A2A] bg-[#151515]/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
                          Outing {idx + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeDateRow(dn.id)}
                          className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100/80 hover:text-amber-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 grid gap-4 sm:grid-cols-3">
                        <label className={labelClass}>
                          Which date
                          <select
                            value={dn.dateNumber}
                            onChange={(e) =>
                              updateDateRow(dn.id, {
                                dateNumber: e.target.value as DateNote['dateNumber'],
                              })
                            }
                            className={inputClass}
                          >
                            <option value="Date 1">Date 1</option>
                            <option value="Date 2">Date 2</option>
                            <option value="Date 3+">Date 3+</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          Day
                          <input
                            type="date"
                            value={dn.date?.slice(0, 10) ?? ''}
                            onChange={(e) => updateDateRow(dn.id, { date: e.target.value })}
                            className={inputClass}
                          />
                        </label>
                        <label className={labelClass}>
                          Place / vibe
                          <input
                            value={dn.location ?? ''}
                            onChange={(e) =>
                              updateDateRow(dn.id, { location: e.target.value || undefined })
                            }
                            className={inputClass}
                            placeholder="Neighborhood, spot…"
                          />
                        </label>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <label className={labelClass}>
                          What felt good?
                          <textarea
                            value={dn.whatWorked ?? ''}
                            onChange={(e) =>
                              updateDateRow(dn.id, { whatWorked: e.target.value || undefined })
                            }
                            rows={2}
                            className={`${inputClass} resize-y`}
                          />
                        </label>
                        <label className={labelClass}>
                          What felt off?
                          <textarea
                            value={dn.whatFeltOff ?? ''}
                            onChange={(e) =>
                              updateDateRow(dn.id, { whatFeltOff: e.target.value || undefined })
                            }
                            rows={2}
                            className={`${inputClass} resize-y`}
                          />
                        </label>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className={labelClass}>
                          Emotional connection
                          <select
                            value={dn.emotionalConnection ?? ''}
                            onChange={(e) =>
                              updateDateRow(dn.id, {
                                emotionalConnection:
                                  (e.target.value as DateNote['emotionalConnection']) ||
                                  undefined,
                              })
                            }
                            className={inputClass}
                          >
                            <option value="">—</option>
                            <option value="Strong">Strong</option>
                            <option value="Some">Some</option>
                            <option value="Weak">Weak</option>
                            <option value="Unclear">Unclear</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          Physical chemistry
                          <select
                            value={dn.physicalChemistry ?? ''}
                            onChange={(e) =>
                              updateDateRow(dn.id, {
                                physicalChemistry:
                                  (e.target.value as DateNote['physicalChemistry']) || undefined,
                              })
                            }
                            className={inputClass}
                          >
                            <option value="">—</option>
                            <option value="Strong">Strong</option>
                            <option value="Some">Some</option>
                            <option value="Weak">Weak</option>
                            <option value="Unclear">Unclear</option>
                          </select>
                        </label>
                      </div>
                      <label className={`${labelClass} mt-4 block`}>
                        Next step
                        <input
                          value={dn.nextStep ?? ''}
                          onChange={(e) =>
                            updateDateRow(dn.id, { nextStep: e.target.value || undefined })
                          }
                          className={inputClass}
                          placeholder="Plan, pause, clarify…"
                        />
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`${sectionClass} mt-8 border-[#2A2A2A] bg-[#0d0d0d]`}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
                Interests & general notes
              </h3>
              <label className={`${labelClass} mt-4 block`}>
                Interests (comma-separated)
                <input
                  value={(draft.interests ?? []).join(', ')}
                  onChange={(e) => {
                    const parts = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                    updateDraft({ interests: parts.length ? parts : undefined })
                  }}
                  className={inputClass}
                  placeholder="Climbing, jazz, faith practice…"
                />
              </label>
              <label className={`${labelClass} mt-4 block`}>
                General notes
                <textarea
                  value={draft.notes ?? ''}
                  onChange={(e) => updateDraft({ notes: e.target.value || undefined })}
                  rows={4}
                  className={`${inputClass} resize-y`}
                  placeholder="Anything else worth remembering — boundaries, timing, shared context…"
                />
              </label>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
