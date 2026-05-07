import type { Answer, AnswerTier, CatalogAnswer, ClicheLevel, FinalizedPrompt, Prompt } from './promptTypes'

type InferOpts = { tier?: AnswerTier }

/** Hand-tuned where heuristics misread irony, quotes, or meta lines */
export const CLICHE_OVERRIDES: Record<
  string,
  Partial<Pick<Answer, 'clicheLevel' | 'clicheReasons'>>
> = {}

const MUST_HIGH: { re: RegExp; reason: string }[] = [
  { re: /\bjust\s+ask\b/i, reason: 'Classic dodge (“just ask”)' },
  { re: /\bfluent\s+in\s+sarcasm\b/i, reason: 'Overused humor trope' },
  { re: /\bwork\s+hard\b.*\bplay\s+hard\b|\bplay\s+hard\b.*\bwork\s+hard\b/i, reason: '“Work hard, play hard” template' },
]

const STRONG_PATTERNS: { re: RegExp; reason: string; w: number }[] = [
  {
    re: /\bstructured\s+enough\b.*\bspontaneous\s+enough\b|\bspontaneous\s+enough\b.*\bstructured\s+enough\b/i,
    reason: 'Abstract balance pairing without a scene',
    w: 2,
  },
  {
    re: /\bquality\s+time\b.*\badventure\b|\badventure\b.*\bquality\s+time\b|\btrust\b.*\bquality\s+time\b/i,
    reason: 'Abstract pairing (trust / quality time / adventure) without a scene',
    w: 2,
  },
  {
    re: /\bwhat\s+lights\s+you\s+up\b|\boutside\s+of\s+work\b|\boutside\s+work\b/i,
    reason: 'Broad opener / life-work partition phrase',
    w: 2,
  },
  { re: /\blove\s+to\s+laugh\b|\blaughter\b.*\bimportant\b/i, reason: 'Generic “love to laugh” energy', w: 2 },
  { re: /\blove\s+to\s+travel\b|\blove\s+traveling\b|\bpassport\s+ready\b/i, reason: 'Travel filler without a specific stamp', w: 2 },
  { re: /\bgood\s+vibes\b|\bpositive\s+vibes\b/i, reason: 'Vague “good vibes” phrasing', w: 2 },
  { re: /\bpizza\b.*\btacos?\b|\btacos?\b.*\bpizza\b/i, reason: 'Pizza/tacos checklist meme', w: 2 },
  { re: /\blooking\s+for\s+someone\b.*\b(kind|fun|adventurous|loyal|honest)/i, reason: 'Trait-laundry partner spec', w: 3 },
  { re: /\bmy\s+friends\s+would\s+say\b/i, reason: 'Third-person virtue dodge', w: 2 },
  { re: /\bpartner\s+in\s+crime\b/i, reason: 'Stock couples phrase', w: 2 },
  { re: /\bliving\s+my\s+best\s+life\b|\bhere\s+for\s+a\s+good\s+time\b/i, reason: 'App-caption filler', w: 2 },
  { re: /\bbuild(?:ing)?\s+something\s+meaningful\b(?![^.]{0,80}\b(husband|dad|father|family|marriage)\b)/i, reason: '“Meaningful” without concrete stake', w: 2 },
]

const SOFT_PATTERNS: { re: RegExp; reason: string; w: number }[] = [
  { re: /\badventurous\b|\beasy-?going\b|\blaid[- ]back\b|\bdown[- ]to[- ]earth\b/i, reason: 'Stock self-descriptor', w: 1 },
  { re: /\bfoodie\b|\bgym\s+rat\b|\bnetflix\b.*\b(chill|wine)\b/i, reason: 'Category tag instead of a scene', w: 1 },
  { re: /\bfamily\s+values\b|\btraditional\s+values\b/i, reason: 'Abstract values label', w: 1 },
  { re: /\bkind\b.*\bfun\b.*\badventurous\b|\bfun\b.*\bkind\b.*\badventurous\b/i, reason: 'Generic trait trio', w: 2 },
]

const SPECIFICITY_BOOST: { re: RegExp; n: number }[] = [
  { re: /\b(ddr|karaoke|nfl|reds|fc\s*cincinnati|marathon|skydiv|lego|broadcast|sideline)\b/i, n: 2 },
  { re: /\b\d{1,2}\s*(:\d{2})?\s*(am|pm)\b/i, n: 2 },
  { re: /\b(wedding|dance\s+floor|banks|ohio)\b/i, n: 1 },
  { re: /\b(i'm|i am)\s+the\s+guy\s+who\b/i, n: 2 },
  { re: /every\s+other\s+profile|not\s+trying\s+to\s+sound\s+like/i, n: 3 },
]

function uniqReasons(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const x of items) {
    const k = x.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(x)
  }
  return out
}

export function inferClicheFromText(text: string, opts?: InferOpts): Pick<Answer, 'clicheLevel' | 'clicheReasons'> {
  const raw = text.trim()

  const reasons: string[] = []
  let score = 0

  for (const { re, reason } of MUST_HIGH) {
    if (re.test(raw)) {
      reasons.push(reason)
      score += 10
    }
  }

  for (const { re, reason, w } of STRONG_PATTERNS) {
    if (re.test(raw)) {
      reasons.push(reason)
      score += w
    }
  }

  for (const { re, reason, w } of SOFT_PATTERNS) {
    if (re.test(raw)) {
      reasons.push(reason)
      score += w
    }
  }

  const traitHits = raw.match(/\b(warm|kind|fun|curious|loyal|honest|adventurous|active|spontaneous|genuine)\b/gi)
  const traitDistinct = traitHits ? new Set(traitHits.map((x) => x.toLowerCase())).size : 0
  if (traitDistinct >= 4 && /,| and /.test(raw)) {
    reasons.push('Stacks traits instead of showing one moment')
    score += 2
  }
  if (/\b(women|someone|people)\s+who\s+(are|is)\b/i.test(raw) && traitDistinct >= 3) {
    reasons.push('Partner checklist framing')
    score += 2
  }

  if (/^(hi|hey)\b.{0,40}$/i.test(raw) || (raw.length < 28 && !/[.!?]/.test(raw) && traitDistinct >= 2)) {
    reasons.push('Very short — reads like a headline, not a person')
    score += 1
  }

  let spec = 0
  for (const { re, n } of SPECIFICITY_BOOST) {
    if (re.test(raw)) spec += n
  }
  if (raw.length > 95 && /[.!?]/.test(raw)) spec += 1
  score -= Math.min(spec, 4)

  if (opts?.tier === 'needs_work') {
    reasons.push('Catalog tier flagged needs_work')
    score += 1
  }

  let level: ClicheLevel
  if (score >= 5 || reasons.some((r) => MUST_HIGH.some((m) => m.reason === r))) {
    level = 'high'
  } else if (score >= 2) {
    level = 'medium'
  } else {
    level = 'low'
  }

  const deduped = uniqReasons(reasons)

  if (level === 'low' && deduped.length === 0) {
    return {
      clicheLevel: 'low',
      clicheReasons: ['Specific detail or voice signal', 'Hard to paste onto most profiles unchanged'],
    }
  }

  return {
    clicheLevel: level,
    clicheReasons: deduped.length ? deduped : ['Reads fairly specific'],
  }
}

export function annotateAnswer(a: CatalogAnswer): Answer {
  const inferred = inferClicheFromText(a.text, { tier: a.tier })
  const writtenBy = a.writtenBy === 'human' ? 'human' : 'ai'
  const ov = CLICHE_OVERRIDES[a.id]
  if (!ov) return { ...a, writtenBy, ...inferred }

  return {
    ...a,
    writtenBy,
    clicheLevel: ov.clicheLevel ?? inferred.clicheLevel,
    clicheReasons: ov.clicheReasons ?? inferred.clicheReasons,
  }
}

export function annotatePromptAnswers(p: FinalizedPrompt): Prompt {
  return {
    ...p,
    answers: p.answers.map(annotateAnswer),
  }
}
