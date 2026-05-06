import { useContext } from 'react'

import { PromptBankPersistenceContext } from './promptBankPersistenceContext'

export function usePromptBankPersistenceContext() {
  const ctx = useContext(PromptBankPersistenceContext)
  if (!ctx) throw new Error('PromptBankPersistenceProvider missing')
  return ctx
}
