import type { Answer } from './promptTypes'

export function normalizeAnswerAuthor(v: unknown): Answer['writtenBy'] {
  return v === 'human' ? 'human' : 'ai'
}

/** Human-authored lines first; then recommended lane, favorites, tier, stable text tie-break */
export function compareAnswersForDisplay(a: Answer, b: Answer): number {
  const ah = a.writtenBy === 'human' ? 0 : 1
  const bh = b.writtenBy === 'human' ? 0 : 1
  if (ah !== bh) return ah - bh

  const ar = a.recommended || a.tier === 'recommended' ? 0 : 1
  const br = b.recommended || b.tier === 'recommended' ? 0 : 1
  if (ar !== br) return ar - br

  const af = a.favorite ? 0 : 1
  const bf = b.favorite ? 0 : 1
  if (af !== bf) return af - bf

  const tierRank = (x: Answer) =>
    x.tier === 'recommended' ? 0 : x.tier === 'experimental' ? 1 : x.tier === 'needs_work' ? 2 : 3
  const at = tierRank(a)
  const bt = tierRank(b)
  if (at !== bt) return at - bt

  return a.text.localeCompare(b.text)
}

export function sortAnswersForDisplay(answers: Answer[]): Answer[] {
  return [...answers].sort(compareAnswersForDisplay)
}
