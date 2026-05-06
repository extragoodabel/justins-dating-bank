import { useMemo } from 'react'

import { usePromptBankPersistenceContext } from './context/usePromptBankPersistenceContext'
import type { MatchRecord, MatchStatus, OverallFit } from './data/matchTrackerTypes'
import { useMatchTracker } from './hooks/useMatchTrackerStorage'

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

type PromptAgg = {
  key: string
  label: string
  total: number
  highFit: number
  lowFit: number
  weakThreads: number
  datesLed: number
}

function labelForMatch(m: MatchRecord, promptLookup: Map<string, string>): string {
  if (m.sourcePromptId) {
    return promptLookup.get(m.sourcePromptId) ?? m.sourcePromptLabel ?? 'Prompt'
  }
  const t = m.sourcePromptLabel?.trim()
  return t || 'Photo / other'
}

function didLeadDate(m: MatchRecord): boolean {
  if ((m.dates?.length ?? 0) > 0) return true
  return m.status === 'Date 1' || m.status === 'Date 2' || m.status === 'Date 3+'
}

function isWeakThread(m: MatchRecord): boolean {
  return (
    m.status === 'Messaging' &&
    (m.overallFit === 'Low Fit' || m.overallFit === 'Possible Fit')
  )
}

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#A1A1A1]">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 text-[#F5F5F5]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
        <div
          className="h-full rounded-full bg-[#9EFF6B]/55 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const cardClass =
  'rounded-2xl border border-[#2A2A2A] bg-[#111]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]'

export default function SignalReportTab() {
  const { prompts } = usePromptBankPersistenceContext()
  const { matches, signalObservations, setSignalObservations } = useMatchTracker()

  const promptLookup = useMemo(() => new Map(prompts.map((p) => [p.id, p.prompt])), [prompts])

  const statusCounts = useMemo(() => {
    const m = new Map<MatchStatus, number>()
    for (const s of STATUSES) m.set(s, 0)
    for (const row of matches) {
      m.set(row.status, (m.get(row.status) ?? 0) + 1)
    }
    return m
  }, [matches])

  const fitCounts = useMemo(() => {
    const m = new Map<OverallFit, number>()
    for (const f of OVERALL) m.set(f, 0)
    for (const row of matches) {
      m.set(row.overallFit, (m.get(row.overallFit) ?? 0) + 1)
    }
    return m
  }, [matches])

  const promptAggs = useMemo(() => {
    const map = new Map<string, PromptAgg>()
    for (const m of matches) {
      const key = m.sourcePromptId ?? '__other__'
      const label = labelForMatch(m, promptLookup)
      const cur = map.get(key) ?? { key, label, total: 0, highFit: 0, lowFit: 0, weakThreads: 0, datesLed: 0 }
      cur.total += 1
      cur.label = label
      if (m.overallFit === 'High Fit') cur.highFit += 1
      if (m.overallFit === 'Low Fit') cur.lowFit += 1
      if (isWeakThread(m)) cur.weakThreads += 1
      if (didLeadDate(m)) cur.datesLed += 1
      map.set(key, cur)
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [matches, promptLookup])

  const maxStatus = useMemo(() => Math.max(1, ...STATUSES.map((s) => statusCounts.get(s) ?? 0)), [statusCounts])
  const maxFit = useMemo(() => Math.max(1, ...OVERALL.map((f) => fitCounts.get(f) ?? 0)), [fitCounts])

  const highFitMatches = useMemo(
    () => matches.filter((m) => m.overallFit === 'High Fit'),
    [matches],
  )

  const interestRollup = useMemo(() => {
    const canonical = new Map<string, { display: string; count: number }>()
    for (const m of highFitMatches) {
      for (const raw of m.interests ?? []) {
        const t = raw.trim()
        if (!t) continue
        const low = t.toLowerCase()
        const prev = canonical.get(low)
        if (prev) prev.count += 1
        else canonical.set(low, { display: t, count: 1 })
      }
    }
    return [...canonical.values()].sort((a, b) => b.count - a.count).slice(0, 14)
  }, [highFitMatches])

  const topByResponses = useMemo(() => [...promptAggs].slice(0, 6), [promptAggs])
  const highFitPrompts = useMemo(
    () => [...promptAggs].filter((p) => p.highFit > 0).sort((a, b) => b.highFit - a.highFit).slice(0, 6),
    [promptAggs],
  )
  const mismatchHeavy = useMemo(
    () => [...promptAggs].filter((p) => p.lowFit > 0).sort((a, b) => b.lowFit - a.lowFit).slice(0, 6),
    [promptAggs],
  )
  const weakConversations = useMemo(
    () => [...promptAggs].filter((p) => p.weakThreads > 0).sort((a, b) => b.weakThreads - a.weakThreads).slice(0, 6),
    [promptAggs],
  )
  const dateDrivers = useMemo(
    () => [...promptAggs].filter((p) => p.datesLed > 0).sort((a, b) => b.datesLed - a.datesLed).slice(0, 6),
    [promptAggs],
  )

  return (
    <div className="min-h-[calc(100dvh-52px)] px-5 py-8 pb-16 md:px-12">
      <header className="max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9EFF6B]">
          Extra Good · Profile barometer
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Signal Report</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#A1A1A1]">
          A quiet read on what your prompts are pulling in — conversation quality, fit patterns, and
          date motion — without turning people into metrics.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-[#6b6b6b]">
          Saved locally in this browser. Use initials or nicknames in Match Tracker if you want more
          privacy.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Totals
          </h2>
          <p className="mt-6 text-4xl font-semibold tracking-tight text-[#F5F5F5]">
            {matches.length}
          </p>
          <p className="mt-2 text-sm text-[#A1A1A1]">Matches tracked in this browser</p>
        </section>

        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Conversation motion
          </h2>
          <p className="mt-3 text-xs text-[#6b6b6b]">
            Where energy sits — messaging vs dates — not a funnel grade.
          </p>
          <div className="mt-6 space-y-5">
            {STATUSES.map((s) => (
              <StatBar key={s} label={s} value={statusCounts.get(s) ?? 0} max={maxStatus} />
            ))}
          </div>
        </section>

        <section className={`${cardClass} lg:col-span-2`}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Overall compatibility reads
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {OVERALL.map((f) => (
              <StatBar key={f} label={f} value={fitCounts.get(f) ?? 0} max={maxFit} />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Most responded-to prompts
          </h2>
          <p className="mt-2 text-xs text-[#6b6b6b]">Where inbound starts — tie-break by volume.</p>
          <ul className="mt-6 space-y-4">
            {topByResponses.length === 0 ? (
              <li className="text-sm text-[#6b6b6b]">Link matches to prompts to see this.</li>
            ) : (
              topByResponses.map((p) => (
                <li key={p.key} className="border-b border-[#2A2A2A]/80 pb-4 last:border-0">
                  <p className="font-medium text-[#F5F5F5]">{p.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-[#A1A1A1]">
                    {p.total} thread{p.total === 1 ? '' : 's'}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Prompts meeting high-fit matches
          </h2>
          <p className="mt-2 text-xs text-[#6b6b6b]">
            When overall read landed &quot;High Fit&quot; — directional, not definitive.
          </p>
          <ul className="mt-6 space-y-4">
            {highFitPrompts.length === 0 ? (
              <li className="text-sm text-[#6b6b6b]">No high-fit reads logged yet.</li>
            ) : (
              highFitPrompts.map((p) => (
                <li key={p.key} className="border-b border-[#2A2A2A]/80 pb-4 last:border-0">
                  <p className="font-medium text-[#F5F5F5]">{p.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-[#9EFF6B]/85">
                    {p.highFit} high-fit note{p.highFit === 1 ? '' : 's'} · {p.total} total
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F59E0B]">
            Prompts with softer alignment reads
          </h2>
          <p className="mt-2 text-xs text-[#6b6b6b]">
            Where “Low Fit” shows up — curiosity for tuning voice or filters, not blame.
          </p>
          <ul className="mt-6 space-y-4">
            {mismatchHeavy.length === 0 ? (
              <li className="text-sm text-[#6b6b6b]">Nothing flagged here yet.</li>
            ) : (
              mismatchHeavy.map((p) => (
                <li key={p.key} className="border-b border-[#2A2A2A]/80 pb-4 last:border-0">
                  <p className="font-medium text-[#F5F5F5]">{p.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-amber-100/75">
                    {p.lowFit} low-fit read{p.lowFit === 1 ? '' : 's'} · {p.total} total
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Still messaging, softer fit reads
          </h2>
          <p className="mt-2 text-xs text-[#6b6b6b]">
            Prompts where threads stayed in messaging with Possible/Low fit — worth re-reading tone.
          </p>
          <ul className="mt-6 space-y-4">
            {weakConversations.length === 0 ? (
              <li className="text-sm text-[#6b6b6b]">No threads in this pattern.</li>
            ) : (
              weakConversations.map((p) => (
                <li key={p.key} className="border-b border-[#2A2A2A]/80 pb-4 last:border-0">
                  <p className="font-medium text-[#F5F5F5]">{p.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-[#A1A1A1]">
                    {p.weakThreads} thread{p.weakThreads === 1 ? '' : 's'}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Prompts associated with dates
          </h2>
          <p className="mt-2 text-xs text-[#6b6b6b]">
            Any logged outing or status past planning — loose association with source prompt.
          </p>
          <ul className="mt-6 space-y-4">
            {dateDrivers.length === 0 ? (
              <li className="text-sm text-[#6b6b6b]">No date motion captured yet.</li>
            ) : (
              dateDrivers.map((p) => (
                <li key={p.key} className="border-b border-[#2A2A2A]/80 pb-4 last:border-0">
                  <p className="font-medium text-[#F5F5F5]">{p.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-[#A1A1A1]">
                    {p.datesLed} with date notes or date status · {p.total} threads
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
            Interests among high-fit matches
          </h2>
          <p className="mt-2 text-xs text-[#6b6b6b]">
            Tags you typed — surfaced lightly when overall read was High Fit.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {interestRollup.length === 0 ? (
              <p className="text-sm text-[#6b6b6b]">
                Add comma-separated interests on high-fit matches to populate this.
              </p>
            ) : (
              interestRollup.map((row) => (
                <span
                  key={row.display.toLowerCase()}
                  className="rounded-full border border-[#2A2A2A] bg-[#151515] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#C8F5A8]"
                >
                  {row.display}{' '}
                  <span className="text-[#6b6b6b]">×{row.count}</span>
                </span>
              ))
            )}
          </div>
        </section>
      </div>

      <section className={`${cardClass} mt-10`}>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9EFF6B]">
          Workshop observations
        </h2>
        <p className="mt-2 text-xs text-[#6b6b6b]">
          Narrative notes for Extra Good — exported with your workspace backup from Prompt Bank.
        </p>
        <textarea
          value={signalObservations}
          onChange={(e) => setSignalObservations(e.target.value)}
          rows={6}
          placeholder='e.g. “Together, we could…” pulls playful logistics replies; “Life goal” pulls fewer threads but warmer intent.'
          className="mt-5 w-full resize-y rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#6b6b6b] focus:border-[#9EFF6B]/45"
        />
      </section>
    </div>
  )
}
