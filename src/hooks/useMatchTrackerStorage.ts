import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  normalizeMatchTrackerPersisted,
  createEmptyMatchId,
} from '../data/matchTrackerNormalize'
import {
  DEFAULT_DATING_APP,
  type MatchRecord,
  type MatchTrackerPersisted,
  DEFAULT_FIT_SIGNALS,
} from '../data/matchTrackerTypes'

export const MATCH_TRACKER_STORAGE_KEY = 'eg-justin-match-tracker-v1'

function nowIso(): string {
  return new Date().toISOString()
}

function createId(): string {
  return createEmptyMatchId()
}

export function createEmptyMatch(partial?: Partial<MatchRecord>): MatchRecord {
  const ts = nowIso()
  return {
    id: createId(),
    name: '',
    app: DEFAULT_DATING_APP,
    dateMatched: ts.slice(0, 10),
    sourceType: 'Prompt',
    status: 'Matched',
    fitSignals: { ...DEFAULT_FIT_SIGNALS },
    overallFit: 'Too Early',
    createdAt: ts,
    updatedAt: ts,
    ...partial,
  }
}

function normalizePersisted(raw: unknown): MatchTrackerPersisted {
  return normalizeMatchTrackerPersisted(raw)
}

function loadFromStorage(): MatchTrackerPersisted {
  try {
    const raw = window.localStorage.getItem(MATCH_TRACKER_STORAGE_KEY)
    if (!raw) return { matches: [] }
    return normalizePersisted(JSON.parse(raw) as unknown)
  } catch {
    return { matches: [] }
  }
}

function saveToStorage(data: MatchTrackerPersisted): void {
  try {
    window.localStorage.setItem(MATCH_TRACKER_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

export type MatchTrackerApi = {
  matches: MatchRecord[]
  signalObservations: string
  setSignalObservations: (value: string) => void
  upsertMatch: (match: MatchRecord) => void
  deleteMatch: (id: string) => void
  replaceAll: (payload: MatchTrackerPersisted) => void
}

const MatchTrackerContext = createContext<MatchTrackerApi | null>(null)

export function MatchTrackerProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<MatchRecord[]>(() => loadFromStorage().matches)
  const [signalObservations, setSignalObservationsState] = useState(
    () => loadFromStorage().signalObservations ?? '',
  )

  useEffect(() => {
    saveToStorage({ matches, signalObservations })
  }, [matches, signalObservations])

  const setSignalObservations = useCallback((value: string) => {
    setSignalObservationsState(value)
  }, [])

  const upsertMatch = useCallback((match: MatchRecord) => {
    const stamped = { ...match, updatedAt: nowIso() }
    setMatches((prev) => {
      const idx = prev.findIndex((m) => m.id === stamped.id)
      if (idx === -1)
        return [...prev, stamped].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const next = [...prev]
      next[idx] = stamped
      return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    })
  }, [])

  const deleteMatch = useCallback((id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const replaceAll = useCallback((payload: MatchTrackerPersisted) => {
    const normalized = normalizePersisted(payload)
    setMatches(normalized.matches)
    setSignalObservationsState(normalized.signalObservations ?? '')
  }, [])

  const api = useMemo(
    () => ({
      matches,
      signalObservations,
      setSignalObservations,
      upsertMatch,
      deleteMatch,
      replaceAll,
    }),
    [matches, signalObservations, setSignalObservations, upsertMatch, deleteMatch, replaceAll],
  )

  return createElement(MatchTrackerContext.Provider, { value: api }, children)
}

export function useMatchTracker(): MatchTrackerApi {
  const ctx = useContext(MatchTrackerContext)
  if (!ctx) throw new Error('MatchTrackerProvider missing')
  return ctx
}

export function exportMatchTrackerBlob(api: MatchTrackerApi): MatchTrackerPersisted {
  return {
    matches: api.matches,
    signalObservations: api.signalObservations || undefined,
  }
}
