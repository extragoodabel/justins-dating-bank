import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { PRESET_PROFILE_SETS } from './data/promptBank'
import type {
  Answer,
  AnswerAuthor,
  AnswerTier,
  Category,
  ClicheLevel,
  Prompt,
  StrategicRole,
  Strength,
} from './data/promptTypes'
import { usePromptBankPersistenceContext } from './context/usePromptBankPersistenceContext'

const CATEGORY_ORDER: Category[] = [
  'Getting Personal',
  'Your World',
  'About Me',
  'My Type',
  'Date Vibes',
  "Let's Chat About",
  'Self-Care',
  'Storytime',
  'Voice-First',
]

const STRENGTHS: Strength[] = ['Lock', 'Strong', 'Useful', 'Use Carefully']
const ROLES: StrategicRole[] = ['Hook', 'Humor', 'Values', 'Filter', 'Conversation', 'Proof', 'Lifestyle']

const STRENGTH_CARD: Record<Strength, string> = {
  Lock:
    'border-[#9EFF6B]/75 bg-[#9EFF6B]/14 text-[#E9FFB8] shadow-[0_0_14px_-6px_rgba(158,255,107,0.65)]',
  Strong: 'border-[#9EFF6B]/22 bg-[#151515] text-[#C8F5A8]',
  Useful: 'border-[#2A2A2A] bg-[#151515] text-[#A1A1A1]',
  'Use Carefully': 'border-amber-900/45 bg-amber-950/22 text-amber-100/85',
}

function summarize(text: string, max = 118): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

function AnswerNotesField({
  initialNotes,
  onCommit,
}: {
  initialNotes: string
  onCommit: (notes: string) => void
}) {
  const [value, setValue] = useState(initialNotes)

  return (
    <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
      Notes (local)
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onCommit(value)}
        rows={2}
        placeholder="Creative direction, staging, what to avoid…"
        className="mt-2 w-full resize-y rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#9EFF6B]/45"
      />
    </label>
  )
}

function answerPassesClicheFilters(a: Answer, hideHigh: boolean, lowOnly: boolean): boolean {
  if (hideHigh && a.clicheLevel === 'high') return false
  if (lowOnly && a.clicheLevel !== 'low') return false
  return true
}

function visibleAnswersForPrompt(p: Prompt, hideHigh: boolean, lowOnly: boolean): Answer[] {
  return p.answers.filter((a) => answerPassesClicheFilters(a, hideHigh, lowOnly))
}

function matchesFilters(
  p: Prompt,
  q: string,
  cat: Category | 'all',
  strength: Strength | 'all',
  role: StrategicRole | 'all',
  recOnly: boolean,
  favOnly: boolean,
  hideHighCliche: boolean,
  lowClicheOnly: boolean,
): boolean {
  const va = visibleAnswersForPrompt(p, hideHighCliche, lowClicheOnly)
  if ((hideHighCliche || lowClicheOnly) && va.length === 0) return false

  if (cat !== 'all' && p.category !== cat) return false
  if (strength !== 'all' && p.strength !== strength) return false
  if (role !== 'all' && !p.strategicRoles.includes(role)) return false
  if (recOnly && !va.some((a) => a.recommended || a.tier === 'recommended')) return false
  if (favOnly && !va.some((a) => a.favorite)) return false

  if (!q.trim()) return true
  const needle = q.trim().toLowerCase()
  const hay = [
    p.prompt,
    p.category,
    p.valueForJustin,
    ...p.strategicRoles,
    ...p.promptEvaluation.whyItWorks,
    ...p.promptEvaluation.whenItFails,
    ...(p.redditSignal ? [p.redditSignal] : []),
    ...p.sourceQuotes,
    ...p.voiceFragments,
    ...p.themes,
    ...p.answers.flatMap((a) => [
      a.text,
      ...(a.tags ?? []),
      ...(a.notes ? [a.notes] : []),
      ...(a.clicheReasons ?? []),
      a.clicheLevel,
    ]),
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(needle)
}

type PromptBankAppProps = {
  /** Offset below workspace tab bar so sticky chrome clears tabs */
  stickyChromeTopClass?: string
}

export default function PromptBankApp({
  stickyChromeTopClass = 'top-0',
}: PromptBankAppProps = {}) {
  const {
    persisted,
    prompts,
    toggleFavorite,
    toggleRecommended,
    setAnswerNotes,
    addCustomAnswer,
    addToFinalSet,
    removeFromFinalSet,
    clearFinalSet,
    applyPresetSlots,
  } = usePromptBankPersistenceContext()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [strengthF, setStrengthF] = useState<Strength | 'all'>('all')
  const [roleF, setRoleF] = useState<StrategicRole | 'all'>('all')
  const [recOnly, setRecOnly] = useState(false)
  const [favOnly, setFavOnly] = useState(false)
  const [hideHighCliche, setHideHighCliche] = useState(false)
  const [lowClicheOnly, setLowClicheOnly] = useState(false)
  const [newAnswerDraft, setNewAnswerDraft] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [setNotice, setSetNotice] = useState<string | null>(null)
  const detailRef = useRef<HTMLElement | null>(null)
  const stickyChromeRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const lastScrollYRef = useRef(0)
  const [compactChrome, setCompactChrome] = useState(false)
  /** Below md breakpoint: collapse header + filters while scrolling down */
  const [mobileFiltersCollapsed, setMobileFiltersCollapsed] = useState(false)

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (search.trim()) n += 1
    if (category !== 'all') n += 1
    if (strengthF !== 'all') n += 1
    if (roleF !== 'all') n += 1
    if (recOnly) n += 1
    if (favOnly) n += 1
    if (hideHighCliche) n += 1
    if (lowClicheOnly) n += 1
    return n
  }, [
    search,
    category,
    strengthF,
    roleF,
    recOnly,
    favOnly,
    hideHighCliche,
    lowClicheOnly,
  ])

  useEffect(() => {
    lastScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onMq = () => {
      if (mq.matches) setMobileFiltersCollapsed(false)
    }
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [])

  useEffect(() => {
    let raf = 0
    const DELTA_MIN = 10
    const COLLAPSE_AFTER_Y = 72

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const prev = lastScrollYRef.current
        const delta = y - prev
        lastScrollYRef.current = y

        const md = window.matchMedia('(min-width: 768px)').matches

        if (md) {
          setCompactChrome(y > 56)
          return
        }

        if (y < 28) {
          setMobileFiltersCollapsed(false)
          return
        }

        if (Math.abs(delta) < DELTA_MIN) return

        if (delta > 0 && y > COLLAPSE_AFTER_Y) {
          setMobileFiltersCollapsed(true)
        } else if (delta < 0) {
          setMobileFiltersCollapsed(false)
        }
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const expandMobileChromeAndFocusSearch = useCallback(() => {
    setMobileFiltersCollapsed(false)
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
  }, [])

  const expandMobileChrome = useCallback(() => {
    setMobileFiltersCollapsed(false)
  }, [])

  useLayoutEffect(() => {
    const el = stickyChromeRef.current
    if (!el || typeof document === 'undefined') return
    const apply = () => {
      document.documentElement.style.setProperty('--prompt-bank-sticky-h', `${el.offsetHeight}px`)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--prompt-bank-sticky-h')
    }
  }, [compactChrome, mobileFiltersCollapsed])

  const filtered = useMemo(
    () =>
      prompts.filter((p) =>
        matchesFilters(
          p,
          search,
          category,
          strengthF,
          roleF,
          recOnly,
          favOnly,
          hideHighCliche,
          lowClicheOnly,
        ),
      ),
    [
      prompts,
      search,
      category,
      strengthF,
      roleF,
      recOnly,
      favOnly,
      hideHighCliche,
      lowClicheOnly,
    ],
  )

  const grouped = useMemo(() => {
    const m = new Map<string, Prompt[]>()
    for (const c of CATEGORY_ORDER) m.set(c, [])
    for (const p of filtered) {
      const arr = m.get(p.category)
      if (arr) arr.push(p)
      else m.set(p.category, [p])
    }
    return CATEGORY_ORDER.map((c) => ({ category: c, items: m.get(c) ?? [] })).filter(
      (g) => g.items.length > 0,
    )
  }, [filtered])

  const selected = selectedId ? prompts.find((p) => p.id === selectedId) ?? null : null

  useEffect(() => {
    if (!copiedId) return
    const t = window.setTimeout(() => setCopiedId(null), 1600)
    return () => window.clearTimeout(t)
  }, [copiedId])

  useEffect(() => {
    if (!setNotice) return
    const t = window.setTimeout(() => setSetNotice(null), 3200)
    return () => window.clearTimeout(t)
  }, [setNotice])

  const copyText = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
    } catch {
      setCopiedId(null)
    }
  }, [])

  const copyFinalSet = useCallback(async () => {
    const lines = persisted.finalSet.map(
      (s, i) => `${i + 1}. ${s.promptText}\n${s.answerText}`,
    )
    const body = lines.join('\n\n')
    try {
      await navigator.clipboard.writeText(body)
      setCopiedId('__final__')
    } catch {
      /* ignore */
    }
  }, [persisted.finalSet])

  const handleAddToSet = useCallback(
    (p: Prompt, answerId: string, answerText: string) => {
      if (persisted.finalSet.length >= 3) {
        setSetNotice('Working set is full (3 max). Remove a slot to add another.')
        return
      }
      addToFinalSet({
        promptId: p.id,
        answerId,
        promptText: p.prompt,
        answerText,
      })
    },
    [addToFinalSet, persisted.finalSet.length],
  )

  const selectPrompt = (id: string) => {
    setSelectedId(id)
    window.requestAnimationFrame(() => {
      const el = detailRef.current
      if (!el) return
      const desktop = window.matchMedia('(min-width: 768px)').matches
      if (desktop) {
        el.scrollTo({ top: 0, behavior: 'auto' })
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0B0B0B] text-[#F5F5F5]">
      <div
        ref={stickyChromeRef}
        className={`sticky z-30 shrink-0 border-b border-[#2A2A2A] bg-[#0B0B0B]/95 backdrop-blur-md motion-safe:transition-shadow motion-safe:duration-300 ${stickyChromeTopClass}`}
      >
        {/* Title + search/filters — collapses on small screens while scrolling down */}
        <div
          id="prompt-bank-filter-panel"
          className={`motion-safe:transition-[max-height,opacity] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none ${
            mobileFiltersCollapsed
              ? 'pointer-events-none max-h-0 opacity-0 motion-safe:overflow-hidden md:pointer-events-auto md:max-h-none md:opacity-100 md:overflow-visible'
              : 'pointer-events-auto max-h-[min(220vh,3200px)] opacity-100 motion-safe:overflow-visible'
          }`}
        >
          <div
            className={`px-5 transition-[padding] duration-300 ease-out md:px-12 motion-reduce:transition-none ${
              compactChrome ? 'pb-2 pt-3 md:pb-2 md:pt-3' : 'pb-4 pt-6 md:pb-6 md:pt-8'
            }`}
          >
            <p
              className={`font-mono font-semibold uppercase tracking-[0.28em] text-[#9EFF6B] transition-all duration-300 motion-reduce:transition-none ${
                compactChrome ? 'text-[9px]' : 'text-[10px]'
              }`}
            >
              Extra Good · Internal Tool
            </p>
            <h1
              className={`font-semibold tracking-tight transition-[font-size,margin] duration-300 ease-out motion-reduce:transition-none ${
                compactChrome ? 'mt-1 text-lg md:text-xl' : 'mt-3 text-2xl md:text-3xl'
              }`}
            >
              Justin&apos;s Dating Profile Prompt Bank
            </h1>
          </div>

          <div
            className={`border-t border-[#2A2A2A]/80 px-5 transition-[padding] duration-300 ease-out motion-reduce:transition-none md:px-12 ${
              compactChrome ? 'pb-3 pt-3' : 'pb-4 pt-4'
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-4 lg:gap-y-3">
                <label className="block min-w-[min(100%,280px)] flex-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]">
                  Search
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Prompts, answers, roles, tags…"
                    className="mt-2 w-full rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 font-sans text-sm text-[#F5F5F5] outline-none placeholder:text-[#6b6b6b] focus:border-[#9EFF6B]/45"
                  />
                </label>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]">
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category | 'all')}
                  className="mt-2 block w-full min-w-[200px] rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 font-sans text-sm text-[#F5F5F5] outline-none focus:border-[#9EFF6B]/45 lg:w-52"
                >
                  <option value="all">All</option>
                  {CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]">
                Strength
                <select
                  value={strengthF}
                  onChange={(e) => setStrengthF(e.target.value as Strength | 'all')}
                  className="mt-2 block w-full min-w-[160px] rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 font-sans text-sm outline-none focus:border-[#9EFF6B]/45 lg:w-44"
                >
                  <option value="all">All</option>
                  {STRENGTHS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A1A1A1]">
                Role
                <select
                  value={roleF}
                  onChange={(e) => setRoleF(e.target.value as StrategicRole | 'all')}
                  className="mt-2 block w-full min-w-[160px] rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-3 font-sans text-sm outline-none focus:border-[#9EFF6B]/45 lg:w-44"
                >
                  <option value="all">All</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#2A2A2A]/70 pt-3">
              <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#A1A1A1]">
                <input
                  type="checkbox"
                  checked={favOnly}
                  onChange={(e) => setFavOnly(e.target.checked)}
                  className="size-4 accent-[#9EFF6B]"
                />
                Favorites
              </label>
              <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#A1A1A1]">
                <input
                  type="checkbox"
                  checked={recOnly}
                  onChange={(e) => setRecOnly(e.target.checked)}
                  className="size-4 accent-[#9EFF6B]"
                />
                Recommended only
              </label>
              <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#A1A1A1]">
                <input
                  type="checkbox"
                  checked={hideHighCliche}
                  onChange={(e) => setHideHighCliche(e.target.checked)}
                  className="size-4 accent-[#9EFF6B]"
                />
                Hide high cliché
              </label>
              <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#A1A1A1]">
                <input
                  type="checkbox"
                  checked={lowClicheOnly}
                  onChange={(e) => setLowClicheOnly(e.target.checked)}
                  className="size-4 accent-[#9EFF6B]"
                />
                Low cliché only
              </label>
            </div>
          </div>
        </div>
        </div>

        {/* Narrow screens: slim bar to reopen search & filters while scrolled */}
        <div
          className={`motion-safe:transition-[max-height,opacity,padding] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none md:hidden ${
            mobileFiltersCollapsed
              ? 'flex max-h-24 items-center gap-2 border-t border-[#2A2A2A]/80 px-4 py-2.5 opacity-100'
              : 'pointer-events-none max-h-0 overflow-hidden border-transparent px-4 py-0 opacity-0'
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#9EFF6B]">
              Prompt bank
            </p>
            <p className="truncate text-xs text-[#A1A1A1]">
              {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} on` : 'Browse prompts'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Search prompts"
            onClick={expandMobileChromeAndFocusSearch}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#151515] text-[#A1A1A1] transition hover:border-[#9EFF6B]/35 hover:text-[#F5F5F5]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <button
            type="button"
            aria-expanded={!mobileFiltersCollapsed}
            aria-controls="prompt-bank-filter-panel"
            onClick={expandMobileChrome}
            className="shrink-0 rounded-xl border border-[#9EFF6B]/45 bg-[#9EFF6B]/12 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E9FFB8] transition hover:bg-[#9EFF6B]/20"
          >
            Filters
          </button>
        </div>
      </div>

      {/* lg+: viewport-fixed workspace; columns scroll independently. Below lg: natural document flow. */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-col md:h-[calc(100dvh-20rem)] md:min-h-[240px] md:flex-row md:gap-8 md:overflow-hidden md:px-10 md:pb-5 md:pt-6 lg:h-[calc(100dvh-21rem)] lg:min-h-[260px] lg:gap-10 lg:px-12 lg:pb-6 lg:pt-8">
        <aside className="shrink-0 border-[#2A2A2A] px-5 py-8 md:flex md:h-full md:w-[min(380px,42vw)] md:flex-none md:flex-col md:overflow-y-auto md:overscroll-y-contain md:border-r md:px-0 md:py-0 md:pr-6 lg:w-[min(400px,40vw)] lg:pr-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
            Prompt library
          </p>
          {filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#151515] p-10 text-center">
              <p className="text-lg font-medium text-[#F5F5F5]">No matches</p>
              <p className="mt-2 text-sm text-[#A1A1A1]">
                Adjust filters or search terms — nothing in the bank matches this combination.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-10">
              {grouped.map(({ category: cat, items }) => (
                <section key={cat}>
                  <h2 className="sticky top-[var(--prompt-bank-sticky-h,8.25rem)] z-10 bg-[#0B0B0B]/95 py-2 ps-[0.35em] font-mono text-[10px] uppercase tracking-[0.22em] text-[#A1A1A1] backdrop-blur-sm md:sticky md:top-0 md:bg-[#0B0B0B]/98">
                    {cat}
                  </h2>
                  <ul className="mt-3 space-y-3">
                    {items.map((p) => {
                      const va = visibleAnswersForPrompt(p, hideHighCliche, lowClicheOnly)
                      const hasRecAnswer = va.some((a) => a.recommended || a.tier === 'recommended')
                      const clicheFilterOn = hideHighCliche || lowClicheOnly
                      const caution = p.strength === 'Use Carefully'
                      const lockBoost = p.strength === 'Lock'
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => selectPrompt(p.id)}
                            className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                              selectedId === p.id
                                ? 'border-[#9EFF6B]/55 bg-[#151515]'
                                : lockBoost
                                  ? 'border-[#9EFF6B]/35 bg-[#151515] shadow-[0_0_28px_-14px_rgba(158,255,107,0.45)] hover:border-[#9EFF6B]/55'
                                  : 'border-[#2A2A2A] bg-[#151515] hover:border-[#9EFF6B]/35'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-base font-semibold leading-snug">
                                {p.prompt}
                              </span>
                              <span className="flex shrink-0 gap-1">
                                {p.strength === 'Lock' || hasRecAnswer ? (
                                  <span
                                    className="size-2 rounded-full bg-[#9EFF6B] shadow-[0_0_10px_rgba(158,255,107,0.85)]"
                                    title="Lock leverage / recommended lane"
                                  />
                                ) : null}
                                {caution ? (
                                  <span
                                    className="font-mono text-xs text-amber-200/90"
                                    title="Use carefully — add specificity or creativity"
                                  >
                                    !
                                  </span>
                                ) : null}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${STRENGTH_CARD[p.strength]}`}
                              >
                                {p.strength}
                              </span>
                              {p.strategicRoles.slice(0, 3).map((r) => (
                                <span
                                  key={r}
                                  className="rounded-md border border-[#2A2A2A] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-[#A1A1A1]"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                            <p className="mt-3 text-sm leading-snug text-[#A1A1A1]">
                              {summarize(p.valueForJustin)}
                            </p>
                            <p className="mt-2 font-mono text-[10px] text-[#6b6b6b]">
                              {clicheFilterOn
                                ? `${va.length === p.answers.length ? `${va.length}` : `${va.length}/${p.answers.length}`} answer${va.length === 1 ? '' : 's'} (cliché filter)`
                                : `${p.answers.length} answer${p.answers.length === 1 ? '' : 's'}`}
                            </p>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-[#2A2A2A] md:h-full md:border-t-0">
          <main
            ref={detailRef}
            id="prompt-detail"
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-10 md:min-h-0 md:px-0 md:pb-10 md:pt-2 lg:min-h-0"
          >
            {!selected ? (
              <div className="flex min-h-[320px] flex-col justify-center rounded-2xl border border-dashed border-[#2A2A2A] bg-[#151515]/40 p-12 lg:min-h-[min(320px,50vh)]">
                <p className="text-xl font-semibold text-[#F5F5F5]">Select a prompt</p>
                <p className="mt-3 max-w-[48ch] text-[#A1A1A1]">
                  Pick a card for strategic fit, why / when evaluation, voice-linked source material, and
                  answers — plus cliché checks and local notes.
                </p>
              </div>
            ) : (
              <PromptDetail
                key={selected.id}
                prompt={selected}
                copiedId={copiedId}
                newAnswerDraft={newAnswerDraft}
                setNewAnswerDraft={setNewAnswerDraft}
                hideHighCliche={hideHighCliche}
                lowClicheOnly={lowClicheOnly}
                onCopy={copyText}
                onToggleFavorite={toggleFavorite}
                onToggleRecommended={toggleRecommended}
                onNotesBlur={(answerId, notes) => setAnswerNotes(answerId, notes)}
                onAddToSet={handleAddToSet}
                onAddCustomAnswer={addCustomAnswer}
              />
            )}

            <section className="mx-auto mt-14 max-w-[1400px] border-t border-[#2A2A2A] pt-10 lg:mt-16 lg:max-w-none lg:pr-2 lg:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
              Profile set builder
            </p>
            <p className="mt-2 max-w-[56ch] text-sm text-[#A1A1A1]">
              Tray for three Hinge slots — paste-ready when you are. Pairings persist in this
              browser only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => clearFinalSet()}
              className="rounded-lg border border-[#2A2A2A] px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-[#A1A1A1] hover:border-[#9EFF6B]/35 hover:text-[#F5F5F5]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => void copyFinalSet()}
              disabled={persisted.finalSet.length === 0}
              className="rounded-lg bg-[#9EFF6B] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#0B0B0B] disabled:opacity-40"
            >
              {copiedId === '__final__' ? 'Copied' : 'Copy set'}
            </button>
          </div>
        </div>
        {setNotice ? (
          <p className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/30 px-4 py-3 font-mono text-xs text-amber-100">
            {setNotice}
          </p>
        ) : null}
        {persisted.finalSet.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#151515] p-8 text-center text-sm text-[#A1A1A1]">
            No slots yet. Use “Add to set” on an answer, or load a recommended build below.
          </p>
        ) : (
          <ol className="mt-6 space-y-4">
            {persisted.finalSet.map((s, i) => (
              <li
                key={`${s.promptId}-${s.answerId}`}
                className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
                      Slot {i + 1}
                    </p>
                    <p className="mt-1 text-lg font-semibold">{s.promptText}</p>
                    <p className="mt-3 text-base leading-relaxed text-[#F5F5F5]">{s.answerText}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromFinalSet(i)}
                    className="shrink-0 rounded-lg border border-[#2A2A2A] px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[#A1A1A1] hover:border-red-900/50 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
            )}
            </section>
          </main>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] shrink-0 border-t border-[#2A2A2A] px-5 py-12 md:px-12">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
          Recommended starting sets
        </p>
        <p className="mt-2 max-w-[60ch] text-sm text-[#A1A1A1]">
          Draft combinations tuned for balance — load into the tray, then iterate.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PRESET_PROFILE_SETS.map((preset) => (
            <article
              key={preset.id}
              className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-6"
            >
              <h3 className="text-lg font-semibold">{preset.title}</h3>
              <p className="mt-2 text-sm text-[#A1A1A1]">{preset.description}</p>
              <ol className="mt-5 space-y-3 text-sm">
                {preset.slots.map((slot, idx) => {
                  const pr = prompts.find((x) => x.id === slot.promptId)
                  const ans = pr?.answers.find((a) => a.id === slot.answerId)
                  return (
                    <li key={`${preset.id}-${idx}`} className="border-l border-[#2A2A2A] pl-3">
                      <p className="font-medium text-[#F5F5F5]">{pr?.prompt ?? slot.promptId}</p>
                      <p className="mt-1 text-[#A1A1A1]">{ans?.text ?? '—'}</p>
                    </li>
                  )
                })}
              </ol>
              <button
                type="button"
                onClick={() => applyPresetSlots(preset.slots)}
                className="mt-6 w-full rounded-lg border border-[#9EFF6B]/45 bg-[#0B0B0B] py-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#9EFF6B] hover:bg-[#9EFF6B]/10"
              >
                Load into builder
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className="shrink-0 border-t border-[#2A2A2A] px-5 py-8 md:px-12">
        <p className="font-mono text-[10px] text-[#6b6b6b]">
          Workshop slides:{' '}
          <a href="#workshop" className="text-[#9EFF6B] underline-offset-4 hover:underline">
            #workshop
          </a>
        </p>
      </footer>
    </div>
  )
}

function AnswerAuthorBadge({ author }: { author: AnswerAuthor }) {
  if (author === 'human') {
    return (
      <span
        className="rounded-md border border-sky-500/40 bg-sky-950/35 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-sky-100/90"
        title="Hand-written line (prioritized in this list)"
      >
        Human
      </span>
    )
  }
  return (
    <span
      className="rounded-md border border-[#3a3a3a] bg-[#141414] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#888888]"
      title="AI-assisted catalog draft"
    >
      AI
    </span>
  )
}

function resolveAnswerTier(a: Answer): AnswerTier | null {
  if (a.tier) return a.tier
  if (a.recommended) return 'recommended'
  return null
}

function AnswerTierPill({ tier }: { tier: AnswerTier }) {
  const styles: Record<AnswerTier, string> = {
    recommended: 'border-[#9EFF6B]/45 text-[#9EFF6B] bg-[#9EFF6B]/[0.06]',
    experimental: 'border-[#3a3a3a] text-[#cfcfcf] bg-[#141414]',
    needs_work: 'border-amber-800/55 text-amber-100/85 bg-amber-950/25',
  }
  const labels: Record<AnswerTier, string> = {
    recommended: 'Recommended',
    experimental: 'Experimental',
    needs_work: 'Needs work',
  }
  return (
    <span
      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${styles[tier]}`}
    >
      {labels[tier]}
    </span>
  )
}

function ClicheDot({ level }: { level: ClicheLevel }) {
  const cls =
    level === 'low'
      ? 'bg-emerald-500/85 ring-1 ring-emerald-400/35'
      : level === 'medium'
        ? 'bg-amber-400/95 ring-1 ring-amber-300/45'
        : 'bg-red-500/90 ring-1 ring-red-400/50'
  const label = level === 'low' ? 'Low cliché risk' : level === 'medium' ? 'Medium cliché risk' : 'High cliché risk'
  return (
    <span title={label} className={`inline-block size-2 shrink-0 rounded-full ${cls}`} aria-hidden />
  )
}

function PromptDetail({
  prompt: selected,
  copiedId,
  newAnswerDraft,
  setNewAnswerDraft,
  hideHighCliche,
  lowClicheOnly,
  onCopy,
  onToggleFavorite,
  onToggleRecommended,
  onNotesBlur,
  onAddToSet,
  onAddCustomAnswer,
}: {
  prompt: Prompt
  copiedId: string | null
  newAnswerDraft: string
  setNewAnswerDraft: (v: string) => void
  hideHighCliche: boolean
  lowClicheOnly: boolean
  onCopy: (text: string, id: string) => void
  onToggleFavorite: (id: string, cur: boolean | undefined) => void
  onToggleRecommended: (id: string, cur: boolean | undefined) => void
  onNotesBlur: (answerId: string, notes: string) => void
  onAddToSet: (p: Prompt, answerId: string, answerText: string) => void
  onAddCustomAnswer: (promptId: string, text: string) => void
}) {
  const [showSource, setShowSource] = useState(false)

  const filteredAnswers = visibleAnswersForPrompt(selected, hideHighCliche, lowClicheOnly)

  const STRENGTH_STYLES: Record<Strength, string> = {
    Lock:
      'border-[#9EFF6B]/75 bg-[#9EFF6B]/14 text-[#E9FFB8] shadow-[0_0_18px_-8px_rgba(158,255,107,0.55)]',
    Strong: 'border-[#9EFF6B]/30 bg-[#141414] text-[#C8F5A8]',
    Useful: 'border-[#2A2A2A] bg-[#151515] text-[#A1A1A1]',
    'Use Carefully': 'border-amber-900/50 bg-amber-950/24 text-amber-100/90',
  }

  return (
    <div className="max-w-3xl pb-12">
      <div className="flex flex-wrap items-start gap-2 md:gap-3">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{selected.prompt}</h2>
        <span
          className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide ${STRENGTH_STYLES[selected.strength]}`}
        >
          {selected.strength}
        </span>
        {selected.strength === 'Lock' ? (
          <span className="rounded-full border border-[#9EFF6B]/50 bg-[#9EFF6B]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#9EFF6B]">
            Recommended core prompt
          </span>
        ) : null}
        {selected.creativeOpportunity ? (
          <span className="rounded-full border border-sky-800/50 bg-sky-950/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-sky-100/90">
            Creative opportunity
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-xs text-[#A1A1A1]">{selected.category}</p>
      {selected.strength === 'Use Carefully' ? (
        <p className="mt-3 max-w-[56ch] text-sm leading-snug text-[#888888]">
          Works when used creatively or specifically — treat this as a challenge prompt, not a dead slot.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {selected.strategicRoles.map((r) => (
          <span
            key={r}
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#A1A1A1]"
          >
            {r}
          </span>
        ))}
      </div>

      <section className="mt-10 space-y-10">
        <div>
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
            Strategic fit (Justin)
          </h3>
          <p className="mt-3 text-base leading-relaxed text-[#F5F5F5]">{selected.valueForJustin}</p>
        </div>

        <div>
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
            Why it works
          </h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-[#A1A1A1]">
            {selected.promptEvaluation.whyItWorks.map((line, i) => (
              <li key={`yw-${i}-${line.slice(0, 40)}`}>{line}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#A1A1A1]">
            When it falls flat
          </h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-[#888888]">
            {selected.promptEvaluation.whenItFails.map((line, i) => (
              <li key={`wf-${i}-${line.slice(0, 40)}`}>{line}</li>
            ))}
          </ul>
        </div>

        {selected.redditSignal ? (
          <div className="rounded-xl border border-[#2A2A2A]/80 bg-[#0f0f0f]/80 px-4 py-3 opacity-[0.72]">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5c5c5c]">
              External signal (subjective)
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-[#6f6f6f]">{selected.redditSignal}</p>
            <p className="mt-2 font-mono text-[9px] text-[#4a4a4a]">
              Community chatter only — not a driver for strength or recommendations here.
            </p>
          </div>
        ) : null}
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSource((v) => !v)}
          className="rounded-xl border border-[#2A2A2A] bg-[#151515] px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F5F5F5] transition hover:border-[#9EFF6B]/45"
        >
          {showSource ? 'Hide source' : 'Show source'}
        </button>
        <span className="font-mono text-[10px] text-[#6b6b6b]">Quotes · voice · themes</span>
      </div>

      {showSource ? (
        <div className="mt-8 space-y-10 border-l border-[#2A2A2A] pl-5">
          <section>
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
              Source language
            </h3>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b6b6b]">
              What Justin actually said
            </p>
            {selected.sourceQuotes.length === 0 ? (
              <p className="mt-4 text-sm text-[#6b6b6b]">No verbatim quotes linked yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {selected.sourceQuotes.map((q, i) => (
                  <li
                    key={`${i}-${q.slice(0, 24)}`}
                    className="text-sm leading-snug text-[#888888]"
                  >
                    “{q}”
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
              Voice
            </h3>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b6b6b]">
              How Justin actually talks
            </p>
            {selected.voiceFragments.length === 0 ? (
              <p className="mt-4 text-sm text-[#6b6b6b]">No voice passages linked yet.</p>
            ) : (
              <div className="mt-5 space-y-5">
                {selected.voiceFragments.map((frag, i) => (
                  <p
                    key={`${i}-${frag.slice(0, 16)}`}
                    className="text-[15px] leading-relaxed text-[#cfcfcf] md:text-base"
                  >
                    {frag}
                  </p>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
              Themes
            </h3>
            {selected.themes.length === 0 ? (
              <p className="mt-4 text-sm text-[#6b6b6b]">No distilled themes yet.</p>
            ) : (
              <ul className="mt-4 list-inside list-disc space-y-1.5 text-sm text-[#A1A1A1]">
                {selected.themes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      <section className="mt-14">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#9EFF6B]">
          Refined answers
        </h3>
        <p className="mt-2 max-w-[52ch] font-mono text-[10px] leading-relaxed text-[#6b6b6b]">
          Human-authored lines sort first; each card shows an AI vs Human badge. Cliché risk is separate
          from tier / voice alignment.
        </p>
        {filteredAnswers.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#151515] p-8 text-center text-sm text-[#A1A1A1]">
            No answers match the cliché filters. Toggle filters above or pick another prompt.
          </p>
        ) : (
          <ul className="mt-8 space-y-6">
            {filteredAnswers.map((a) => {
              const resolvedTier = resolveAnswerTier(a)
              const clicheHintTitle =
                a.clicheReasons?.length > 0
                  ? `Cliché: ${a.clicheLevel} — ${a.clicheReasons.join(' · ')}`
                  : `Cliché: ${a.clicheLevel}`
              const tierRecommendedLane = resolvedTier === 'recommended'

              return (
                <li key={a.id} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
                      <span className="mt-2 shrink-0" title={clicheHintTitle}>
                        <ClicheDot level={a.clicheLevel} />
                      </span>
                      <p className="max-w-prose min-w-0 text-xl font-medium leading-snug tracking-tight text-[#F5F5F5] md:text-[1.35rem]">
                        {a.text}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <AnswerAuthorBadge author={a.writtenBy} />
                      {resolvedTier ? <AnswerTierPill tier={resolvedTier} /> : null}
                    </div>
                  </div>
                  {tierRecommendedLane && a.clicheLevel === 'high' ? (
                    <p className="mt-3 border-l border-amber-800/40 pl-3 text-xs leading-snug text-amber-100/85">
                      Strong tier lane, but this still reads generic on the page — worth rewriting for
                      specificity.
                    </p>
                  ) : tierRecommendedLane && a.clicheLevel === 'medium' ? (
                    <p className="mt-3 border-l border-amber-800/40 pl-3 text-xs leading-snug text-amber-100/85">
                      Decent tier lane, but watch generic rhythm — one concrete beat would sharpen voice
                      alignment.
                    </p>
                  ) : null}
                  {resolvedTier === 'needs_work' && a.clicheLevel === 'low' ? (
                    <p className="mt-3 border-l border-[#2A2A2A] pl-3 text-xs leading-snug text-[#888888]">
                      Lower cliché risk — delivery still flagged needs_work (tone, length, or prompt fit).
                    </p>
                  ) : null}
                  <details className="mt-3 rounded-lg border border-[#2A2A2A]/80 bg-[#0B0B0B]/80 px-3 py-2">
                    <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-[#A1A1A1] marker:text-[#6b6b6b]">
                      Cliché notes ({a.clicheLevel})
                    </summary>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[#A1A1A1]">
                      {(a.clicheReasons ?? []).map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </details>
                  <details className="mt-3 rounded-lg border border-[#9EFF6B]/20 bg-[#0B0B0B]/80 px-3 py-2">
                    <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-[#9EFF6B] marker:text-[#6b6b6b]">
                      Refine in Justin&apos;s voice
                    </summary>
                    <ul className="mt-2 space-y-1.5 text-xs leading-snug text-[#A1A1A1]">
                      <li>Cut cliché phrases; replace with one concrete image, time, place, or behavior.</li>
                      <li>
                        Borrow rhythm from <strong className="font-medium text-[#cfcfcf]">Show source → Voice</strong>{' '}
                        above — only lines that truly fit this prompt.
                      </li>
                      <li>Add contrast or a two-beat micro-story instead of a trait list.</li>
                      <li>
                        Target <strong className="font-medium text-[#cfcfcf]">low cliché + strong alignment</strong>{' '}
                        (tier is one signal; high cliché + high tier is still a miss).
                      </li>
                    </ul>
                  </details>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-[#0B0B0B] px-2 py-0.5 font-mono text-[10px] text-[#A1A1A1]"
                      >
                        {t}
                      </span>
                    ))}
                    {a.favorite ? (
                      <span className="rounded-md border border-[#9EFF6B]/35 px-2 py-0.5 font-mono text-[10px] text-[#9EFF6B]">
                        favorite
                      </span>
                    ) : null}
                  </div>
                  <AnswerNotesField
                    key={`${a.id}:${a.notes ?? ''}`}
                    initialNotes={a.notes ?? ''}
                    onCommit={(notes) => onNotesBlur(a.id, notes)}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void onCopy(a.text, a.id)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 font-mono text-xs uppercase tracking-wide text-[#F5F5F5] transition hover:border-[#9EFF6B]/45"
                    >
                      {copiedId === a.id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(a.id, a.favorite)}
                      className={`rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-wide transition ${
                        a.favorite
                          ? 'border-[#9EFF6B]/55 text-[#9EFF6B]'
                          : 'border-[#2A2A2A] text-[#A1A1A1] hover:border-[#9EFF6B]/35'
                      }`}
                    >
                      Favorite
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleRecommended(a.id, a.recommended)}
                      className={`rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-wide transition ${
                        a.recommended
                          ? 'border-[#9EFF6B]/55 text-[#9EFF6B]'
                          : 'border-[#2A2A2A] text-[#A1A1A1] hover:border-[#9EFF6B]/35'
                      }`}
                    >
                      Rec / lock
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToSet(selected, a.id, a.text)}
                      className="rounded-lg border border-[#2A2A2A] px-3 py-2 font-mono text-xs uppercase tracking-wide text-[#F5F5F5] transition hover:border-[#9EFF6B]/45"
                    >
                      Add to set
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-10 rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
            Add answer (local)
          </h4>
          <textarea
            value={newAnswerDraft}
            onChange={(e) => setNewAnswerDraft(e.target.value)}
            rows={3}
            placeholder="Draft a new line. Saved in this browser only."
            className="mt-3 w-full resize-y rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#9EFF6B]/45"
          />
          <button
            type="button"
            onClick={() => {
              onAddCustomAnswer(selected.id, newAnswerDraft)
              setNewAnswerDraft('')
            }}
            className="mt-3 rounded-lg bg-[#9EFF6B] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-[#0B0B0B] transition hover:bg-[#b8ff8f]"
          >
            Save answer
          </button>
        </div>
      </section>
    </div>
  )
}
