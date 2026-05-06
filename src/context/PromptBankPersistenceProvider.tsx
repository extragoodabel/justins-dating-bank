import { type ReactNode } from 'react'

import { PROMPTS } from '../data/promptBank'
import { usePromptBankPersistence } from '../hooks/usePromptBankStorage'

import { PromptBankPersistenceContext } from './promptBankPersistenceContext'

export function PromptBankPersistenceProvider({ children }: { children: ReactNode }) {
  const api = usePromptBankPersistence(PROMPTS)
  return (
    <PromptBankPersistenceContext.Provider value={api}>
      {children}
    </PromptBankPersistenceContext.Provider>
  )
}
