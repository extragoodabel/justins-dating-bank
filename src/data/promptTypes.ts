/** Leverage hierarchy — no “unusable” tier; “Use Carefully” means needs specificity or creativity */
export type Strength = 'Lock' | 'Strong' | 'Useful' | 'Use Carefully'

export type StrategicRole =
  | 'Hook'
  | 'Humor'
  | 'Values'
  | 'Filter'
  | 'Conversation'
  | 'Proof'
  | 'Lifestyle'

export type Category =
  | 'Getting Personal'
  | 'Your World'
  | 'About Me'
  | 'My Type'
  | 'Date Vibes'
  | "Let's Chat About"
  | 'Self-Care'
  | 'Storytime'
  | 'Voice-First'

/** Polished-line maturity — UI falls back to legacy `recommended` when omitted */
export type AnswerTier = 'recommended' | 'experimental' | 'needs_work'

export type ClicheLevel = 'low' | 'medium' | 'high'

/** Catalog / persisted draft row before cliché annotation */
/** Who authored the line — catalog defaults to AI unless marked otherwise */
export type AnswerAuthor = 'human' | 'ai'

export type CatalogAnswer = {
  id: string
  text: string
  tags: string[]
  recommended?: boolean
  favorite?: boolean
  notes?: string
  tier?: AnswerTier
  /** Omit or `'ai'` for model/catalog drafts; `'human'` for hand-written lines */
  writtenBy?: AnswerAuthor
}

export type Answer = CatalogAnswer & {
  writtenBy: AnswerAuthor
  clicheLevel: ClicheLevel
  clicheReasons: string[]
}

export type PromptEvaluation = {
  whyItWorks: string[]
  whenItFails: string[]
}

/** Catalog input row — `risks` is authoring shorthand folded into `whenItFails` at finalize unless overridden */
export type PromptSeedCore = {
  id: string
  category: Category
  prompt: string
  strength: Strength
  redditSignal?: string
  strategicRoles: StrategicRole[]
  valueForJustin: string
  /** Legacy authoring — merged into evaluation.whenItFails when `promptEvaluation` omitted */
  risks?: string[]
  promptEvaluation?: PromptEvaluation
  /** Prompts that reward humor, specificity, or subversion over template answers */
  creativeOpportunity?: boolean
  answers: CatalogAnswer[]
}

export type PromptLayers = {
  /** Verbatim meeting phrases — imperfect, uncleaned */
  sourceQuotes: string[]
  /** Longer first-person voice passages — not summaries */
  voiceFragments: string[]
  /** Distilled insight bullets — specific to Justin */
  themes: string[]
}

/** Catalog entries before layer merge — layers optional and filled by `finalizePrompt` */
export type PromptSeed = PromptSeedCore & Partial<PromptLayers>

/** After `finalizePrompt`, before cliché annotation */
export type FinalizedPrompt = Omit<PromptSeedCore, 'answers' | 'risks' | 'promptEvaluation'> &
  PromptLayers & {
    answers: CatalogAnswer[]
    promptEvaluation: PromptEvaluation
    creativeOpportunity: boolean
  }

/** Fully resolved prompt for the app */
export type Prompt = Omit<PromptSeedCore, 'answers' | 'risks' | 'promptEvaluation'> &
  PromptLayers & {
    answers: Answer[]
    promptEvaluation: PromptEvaluation
    creativeOpportunity: boolean
  }

export type FinalSetSlot = {
  promptId: string
  answerId: string
  promptText: string
  answerText: string
}

export type PresetProfileSet = {
  id: string
  title: string
  description: string
  slots: { promptId: string; answerId: string }[]
}
