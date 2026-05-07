import { annotateAnswer } from '../data/clicheInference'
import { normalizeAnswerAuthor } from '../data/answerDisplay'
import { normalizeMatchTrackerPersisted } from '../data/matchTrackerNormalize'
import type { MatchTrackerPersisted } from '../data/matchTrackerTypes'
import type { Answer, AnswerTier, CatalogAnswer, ClicheLevel, FinalSetSlot } from '../data/promptTypes'
import type { PersistedBlob } from './usePromptBankStorage'

export const PROMPT_BANK_EXPORT_FILENAME = 'justin-hinge-prompt-bank-save.json'

export type PromptBankSaveFile = {
  schemaVersion: 1
  exportedAt: string
  storageKey: string
  appId: 'justin-hinge-prompt-bank'
  data: PersistedBlob
}

/** Unified backup: prompt bank + match tracker + Signal Report notes */
export type WorkspaceSaveFile = {
  schemaVersion: 2
  exportedAt: string
  storageKey?: string
  appId: 'justin-hinge-prompt-bank'
  data: {
    promptBank: PersistedBlob
    matchTracker: MatchTrackerPersisted
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asClicheLevel(v: unknown): ClicheLevel | undefined {
  if (v === 'low' || v === 'medium' || v === 'high') return v
  return undefined
}

function normalizeImportedAnswer(entry: unknown): Answer | null {
  if (!isPlainObject(entry)) return null
  const id = entry.id
  const text = entry.text
  if (typeof id !== 'string' || typeof text !== 'string') return null
  const tags = Array.isArray(entry.tags)
    ? entry.tags.filter((t): t is string => typeof t === 'string')
    : []
  const recommended = typeof entry.recommended === 'boolean' ? entry.recommended : undefined
  const favorite = typeof entry.favorite === 'boolean' ? entry.favorite : undefined
  const notes = typeof entry.notes === 'string' ? entry.notes : undefined
  const tr = entry.tier
  const tier: AnswerTier | undefined =
    tr === 'recommended' || tr === 'experimental' || tr === 'needs_work' ? tr : undefined

  const writtenBy = normalizeAnswerAuthor(entry.writtenBy)

  const base: CatalogAnswer = {
    id,
    text,
    tags,
    recommended,
    favorite,
    notes,
    tier,
    writtenBy,
  }
  const cl = asClicheLevel(entry.clicheLevel)
  if (cl != null && Array.isArray(entry.clicheReasons)) {
    const reasons = entry.clicheReasons.filter((r): r is string => typeof r === 'string')
    const annotated = annotateAnswer(base)
    return {
      ...annotated,
      clicheLevel: cl,
      clicheReasons: reasons,
    }
  }
  return annotateAnswer(base)
}

function normalizeFinalSlot(entry: unknown): FinalSetSlot | null {
  if (!isPlainObject(entry)) return null
  const { promptId, answerId, promptText, answerText } = entry
  if (
    typeof promptId !== 'string' ||
    typeof answerId !== 'string' ||
    typeof promptText !== 'string' ||
    typeof answerText !== 'string'
  ) {
    return null
  }
  return { promptId, answerId, promptText, answerText }
}

function normalizeOverrides(raw: unknown): PersistedBlob['answerOverrides'] {
  if (!isPlainObject(raw)) return {}
  const out: PersistedBlob['answerOverrides'] = {}
  for (const [key, val] of Object.entries(raw)) {
    if (typeof key !== 'string' || !isPlainObject(val)) continue
    const slice: PersistedBlob['answerOverrides'][string] = {}
    if (typeof val.favorite === 'boolean') slice.favorite = val.favorite
    if (typeof val.recommended === 'boolean') slice.recommended = val.recommended
    if (typeof val.notes === 'string') slice.notes = val.notes
    const cl = asClicheLevel(val.clicheLevel)
    if (cl != null) slice.clicheLevel = cl
    if (Array.isArray(val.clicheReasons)) {
      slice.clicheReasons = val.clicheReasons.filter((r): r is string => typeof r === 'string')
    }
    if (val.writtenBy === 'human' || val.writtenBy === 'ai') {
      slice.writtenBy = val.writtenBy
    }
    if (Object.keys(slice).length > 0) out[key] = slice
  }
  return out
}

function normalizeCustomAnswers(raw: unknown): PersistedBlob['customAnswersByPrompt'] {
  if (!isPlainObject(raw)) return {}
  const out: PersistedBlob['customAnswersByPrompt'] = {}
  for (const [promptId, arr] of Object.entries(raw)) {
    if (typeof promptId !== 'string' || !Array.isArray(arr)) continue
    const answers: Answer[] = []
    for (const item of arr) {
      const a = normalizeImportedAnswer(item)
      if (a) answers.push(a)
    }
    if (answers.length > 0) out[promptId] = answers
  }
  return out
}

function normalizeFinalSet(raw: unknown): FinalSetSlot[] {
  if (!Array.isArray(raw)) return []
  const slots: FinalSetSlot[] = []
  for (const item of raw) {
    const s = normalizeFinalSlot(item)
    if (s) slots.push(s)
  }
  return slots.slice(0, 3)
}

/** Pull PersistedBlob candidate from exported envelope or legacy bare blob */
function extractBlob(parsed: unknown): unknown | null {
  if (!isPlainObject(parsed)) return null
  if (parsed.schemaVersion === 2) {
    if (parsed.appId !== undefined && parsed.appId !== 'justin-hinge-prompt-bank') {
      return null
    }
    const data = parsed.data
    if (!isPlainObject(data)) return null
    return data.promptBank !== undefined ? data.promptBank : null
  }
  if (parsed.schemaVersion === 1) {
    if (parsed.appId !== undefined && parsed.appId !== 'justin-hinge-prompt-bank') {
      return null
    }
    return parsed.data !== undefined ? parsed.data : null
  }
  return parsed
}

function blobFromCandidate(candidate: unknown):
  | { ok: true; blob: PersistedBlob }
  | { ok: false; error: string } {
  if (candidate === null || candidate === undefined) {
    return {
      ok: false,
      error:
        'Unrecognized save format. Use a file exported from this app (justin-hinge-prompt-bank-save.json).',
    }
  }
  if (!isPlainObject(candidate)) {
    return { ok: false, error: 'Save file root must be an object.' }
  }

  const blob: PersistedBlob = {
    customAnswersByPrompt: normalizeCustomAnswers(candidate.customAnswersByPrompt),
    answerOverrides: normalizeOverrides(candidate.answerOverrides),
    finalSet: normalizeFinalSet(candidate.finalSet),
  }

  return { ok: true, blob }
}

export function parsePromptBankImport(rawJson: unknown):
  | { ok: true; blob: PersistedBlob }
  | { ok: false; error: string } {
  const candidate = extractBlob(rawJson)
  return blobFromCandidate(candidate)
}

/** Import prompt bank and optionally match tracker (v2). Legacy v1 / bare blob preserves existing matches. */
export function parseWorkspaceImport(rawJson: unknown):
  | { ok: true; promptBank: PersistedBlob; matchTracker: MatchTrackerPersisted | 'preserve' }
  | { ok: false; error: string } {
  if (!isPlainObject(rawJson)) {
    return { ok: false, error: 'Save file root must be an object.' }
  }

  if (
    rawJson.schemaVersion === 2 &&
    (rawJson.appId === undefined || rawJson.appId === 'justin-hinge-prompt-bank')
  ) {
    const data = rawJson.data
    if (!isPlainObject(data)) {
      return { ok: false, error: 'Invalid workspace save (missing data).' }
    }
    const pb = blobFromCandidate(data.promptBank)
    if (!pb.ok) return pb
    const mt = normalizeMatchTrackerPersisted(data.matchTracker ?? { matches: [] })
    return { ok: true, promptBank: pb.blob, matchTracker: mt }
  }

  const legacy = parsePromptBankImport(rawJson)
  if (!legacy.ok) return legacy
  return { ok: true, promptBank: legacy.blob, matchTracker: 'preserve' }
}

export function buildPromptBankExportEnvelope(storageKey: string, data: PersistedBlob): PromptBankSaveFile {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    storageKey,
    appId: 'justin-hinge-prompt-bank',
    data,
  }
}

export function buildWorkspaceExportEnvelope(
  storageKey: string | undefined,
  promptBank: PersistedBlob,
  matchTracker: MatchTrackerPersisted,
): WorkspaceSaveFile {
  return {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    storageKey,
    appId: 'justin-hinge-prompt-bank',
    data: { promptBank, matchTracker },
  }
}

export function downloadWorkspaceSave(
  storageKey: string | undefined,
  promptBank: PersistedBlob,
  matchTracker: MatchTrackerPersisted,
) {
  const envelope = buildWorkspaceExportEnvelope(storageKey, promptBank, matchTracker)
  const json = JSON.stringify(envelope, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = PROMPT_BANK_EXPORT_FILENAME
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** @deprecated Prefer downloadWorkspaceSave — kept for callers that only export the prompt bank slice */
export function downloadPromptBankSave(storageKey: string, data: PersistedBlob) {
  downloadWorkspaceSave(storageKey, data, { matches: [] })
}
