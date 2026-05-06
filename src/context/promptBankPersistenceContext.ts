import { createContext } from 'react'

import { usePromptBankPersistence } from '../hooks/usePromptBankStorage'

export type PromptBankPersistenceApi = ReturnType<typeof usePromptBankPersistence>

export const PromptBankPersistenceContext = createContext<PromptBankPersistenceApi | null>(null)
