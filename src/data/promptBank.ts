import { annotatePromptAnswers } from './clicheInference'
import type { PresetProfileSet } from './promptTypes'
import { finalizePrompt } from './promptLayers'
import { PROMPTS_A } from './promptsCatalogA'
import { PROMPTS_B } from './promptsCatalogB'

/** Barrel export — single import path for the app */
export type {
  Answer,
  AnswerTier,
  CatalogAnswer,
  Category,
  ClicheLevel,
  FinalSetSlot,
  PresetProfileSet,
  Prompt,
  PromptEvaluation,
  PromptLayers,
  PromptSeed,
  StrategicRole,
  Strength,
} from './promptTypes'

export const PROMPTS = [...PROMPTS_A, ...PROMPTS_B].map(finalizePrompt).map(annotatePromptAnswers)

export const PRESET_PROFILE_SETS: PresetProfileSet[] = [
  {
    id: 'best-overall',
    title: 'Best overall',
    description: 'Balanced: ritual → dancing + affection gate + movement hook.',
    slots: [
      { promptId: 'together-we-could', answerId: 'twc-1' },
      { promptId: 'ill-fall-for-you-if', answerId: 'iffy-1' },
      { promptId: 'i-go-crazy-for', answerId: 'igcf-1' },
    ],
  },
  {
    id: 'relationship-led',
    title: 'More relationship-led',
    description: 'Intent-forward without sounding frantic.',
    slots: [
      { promptId: 'life-goal-of-mine', answerId: 'lgom-1' },
      { promptId: 'together-we-could', answerId: 'twc-3' },
      { promptId: 'ill-fall-for-you-if', answerId: 'iffy-2' },
    ],
  },
  {
    id: 'playful-high-response',
    title: 'More playful / high response',
    description: 'DDR/karaoke energy + low-stakes story + balanced dating metaphor.',
    slots: [
      { promptId: 'i-go-crazy-for', answerId: 'igcf-2' },
      { promptId: 'together-we-could', answerId: 'twc-4' },
      { promptId: 'dating-me-is-like', answerId: 'dmil-2' },
    ],
  },
]
