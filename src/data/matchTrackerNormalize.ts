import {
  DATING_APPS,
  DEFAULT_DATING_APP,
  type MatchRecord,
  type MatchTrackerPersisted,
  DEFAULT_FIT_SIGNALS,
  type FitSignals,
  type DateNote,
  type DatingApp,
} from './matchTrackerTypes'

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function createEmptyMatchId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `match-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const VALID_STATUS = new Set<string>([
  'Matched',
  'Messaging',
  'Date Planned',
  'Date 1',
  'Date 2',
  'Date 3+',
  'Paused',
  'Ended',
])

/** Normalize imported / merged match tracker JSON */
export function normalizeMatchTrackerPersisted(raw: unknown): MatchTrackerPersisted {
  if (!isPlainObject(raw)) return { matches: [] }
  const matchesIn = Array.isArray(raw.matches) ? raw.matches : []
  const matches: MatchRecord[] = matchesIn
    .filter((m): m is MatchRecord => !!m && typeof m === 'object')
    .map((m) => {
      const row = m as Record<string, unknown>
      const fit =
        row.fitSignals && typeof row.fitSignals === 'object'
          ? (row.fitSignals as FitSignals)
          : {}
      const statusRaw = typeof row.status === 'string' ? row.status : 'Matched'
      const status = VALID_STATUS.has(statusRaw) ? (statusRaw as MatchRecord['status']) : 'Matched'

      const appRaw = row.app
      const appsList = DATING_APPS as readonly string[]
      const aliased =
        typeof appRaw === 'string' ? (appRaw === 'Tindr' ? 'Tinder' : appRaw) : ''
      const app: DatingApp =
        aliased !== '' && appsList.includes(aliased) ? (aliased as DatingApp) : DEFAULT_DATING_APP

      const base: MatchRecord = {
        id: typeof row.id === 'string' ? row.id : createEmptyMatchId(),
        name: typeof row.name === 'string' ? row.name : '',
        app,
        age: typeof row.age === 'string' ? row.age : undefined,
        location: typeof row.location === 'string' ? row.location : undefined,
        dateMatched: typeof row.dateMatched === 'string' ? row.dateMatched : '',
        sourceType:
          row.sourceType === 'Prompt' || row.sourceType === 'Photo' || row.sourceType === 'Other'
            ? row.sourceType
            : 'Prompt',
        sourcePromptId: typeof row.sourcePromptId === 'string' ? row.sourcePromptId : undefined,
        sourcePromptLabel:
          typeof row.sourcePromptLabel === 'string' ? row.sourcePromptLabel : undefined,
        sourceAnswerText:
          typeof row.sourceAnswerText === 'string' ? row.sourceAnswerText : undefined,
        firstMessage: typeof row.firstMessage === 'string' ? row.firstMessage : undefined,
        status,
        fitSignals: { ...DEFAULT_FIT_SIGNALS, ...fit },
        interests: Array.isArray(row.interests)
          ? row.interests.filter((x): x is string => typeof x === 'string')
          : undefined,
        notes: typeof row.notes === 'string' ? row.notes : undefined,
        conversationNotes:
          row.conversationNotes && typeof row.conversationNotes === 'object'
            ? (row.conversationNotes as MatchRecord['conversationNotes'])
            : undefined,
        dates: Array.isArray(row.dates) ? (row.dates as DateNote[]) : [],
        overallFit:
          row.overallFit === 'High Fit' ||
          row.overallFit === 'Possible Fit' ||
          row.overallFit === 'Low Fit' ||
          row.overallFit === 'Too Early'
            ? row.overallFit
            : 'Too Early',
        createdAt: typeof row.createdAt === 'string' ? row.createdAt : new Date().toISOString(),
        updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : new Date().toISOString(),
      }
      return base
    })
  const signalObservations =
    typeof raw.signalObservations === 'string' ? raw.signalObservations : undefined
  return { matches, signalObservations }
}
