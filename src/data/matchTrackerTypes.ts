/** Big-brand apps + a few alt/common picks — extend anytime */
export const DATING_APPS = [
  'Hinge',
  'Raya',
  'Tinder',
  'Bumble',
  'Coffee Meets Bagel',
  'OkCupid',
  'Match',
  'eHarmony',
  'Plenty of Fish',
  'Zoosk',
  'Feeld',
  'Other',
] as const

export type DatingApp = (typeof DATING_APPS)[number]

export const DEFAULT_DATING_APP: DatingApp = 'Hinge'

export type SourceType = 'Prompt' | 'Photo' | 'Other'

export type MatchStatus =
  | 'Matched'
  | 'Messaging'
  | 'Date Planned'
  | 'Date 1'
  | 'Date 2'
  | 'Date 3+'
  | 'Paused'
  | 'Ended'

export type FitSignalRating = 'Strong' | 'Possible' | 'Unclear' | 'Mismatch'

export type OverallFit = 'High Fit' | 'Possible Fit' | 'Low Fit' | 'Too Early'

export type FitSignals = {
  warmAffectionate: FitSignalRating
  activeHealthConscious: FitSignalRating
  curiousGrowthMinded: FitSignalRating
  emotionallyCommunicative: FitSignalRating
  supportiveOfAmbition: FitSignalRating
  openToAdventure: FitSignalRating
  familyIntent: FitSignalRating
  faithCompatibility: FitSignalRating
  geographicFit: FitSignalRating
}

export const DEFAULT_FIT_SIGNALS: FitSignals = {
  warmAffectionate: 'Unclear',
  activeHealthConscious: 'Unclear',
  curiousGrowthMinded: 'Unclear',
  emotionallyCommunicative: 'Unclear',
  supportiveOfAmbition: 'Unclear',
  openToAdventure: 'Unclear',
  familyIntent: 'Unclear',
  faithCompatibility: 'Unclear',
  geographicFit: 'Unclear',
}

export const FIT_SIGNAL_META: { key: keyof FitSignals; label: string; hint: string }[] = [
  { key: 'warmAffectionate', label: 'Warm / affectionate', hint: 'Comfort with affection and warmth' },
  { key: 'activeHealthConscious', label: 'Active / health-conscious', hint: 'Movement, energy, care for body' },
  { key: 'curiousGrowthMinded', label: 'Curious / growth-minded', hint: 'Learning, openness, depth' },
  { key: 'emotionallyCommunicative', label: 'Emotionally communicative', hint: 'Honesty, repair, naming feelings' },
  { key: 'supportiveOfAmbition', label: 'Supportive of ambition', hint: 'Career, craft, pace of life' },
  { key: 'openToAdventure', label: 'Open to adventure', hint: 'Trying things, motion, play' },
  { key: 'familyIntent', label: 'Family / long-term alignment', hint: 'Kids, partnership trajectory' },
  { key: 'faithCompatibility', label: 'Faith / church compatibility', hint: 'Shared practice or respectful fit' },
  { key: 'geographicFit', label: 'Geographic fit', hint: 'Distance, roots, travel appetite' },
]

export type ConversationNotes = {
  whatTheyRespondedTo?: string
  whatTheyAskedAbout?: string
  didTheyShowCuriosity?: boolean
  didConversationFeelEasy?: boolean
  didItFeelLikeInterview?: boolean
  chemistryNotes?: string
  movedTowardDate?: boolean
  conversationStalled?: boolean
  stallNotes?: string
}

export type DateConnectionLevel = 'Strong' | 'Some' | 'Weak' | 'Unclear'

export type DateNote = {
  id: string
  dateNumber: 'Date 1' | 'Date 2' | 'Date 3+'
  date: string
  location?: string
  whatWorked?: string
  whatFeltOff?: string
  emotionalConnection?: DateConnectionLevel
  physicalChemistry?: DateConnectionLevel
  nextStep?: string
}

export type MatchRecord = {
  id: string
  name: string
  app: DatingApp
  age?: string
  location?: string
  dateMatched: string

  sourceType: SourceType
  sourcePromptId?: string
  sourcePromptLabel?: string
  sourceAnswerText?: string
  firstMessage?: string

  status: MatchStatus

  fitSignals: FitSignals

  interests?: string[]
  notes?: string

  conversationNotes?: ConversationNotes

  dates?: DateNote[]

  overallFit: OverallFit

  createdAt: string
  updatedAt: string
}

export type MatchTrackerPersisted = {
  matches: MatchRecord[]
  /** Free-form observations for Signal Report */
  signalObservations?: string
}
