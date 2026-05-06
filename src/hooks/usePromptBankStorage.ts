import { useCallback, useEffect, useMemo, useState } from 'react'
import { annotateAnswer } from '../data/clicheInference'
import type { Answer, FinalSetSlot, Prompt } from '../data/promptTypes'

const STORAGE_KEY = 'eg-justin-prompt-bank-v1'

export type PersistedBlob = {
  customAnswersByPrompt: Record<string, Answer[]>
  answerOverrides: Record<
    string,
    Partial<Pick<Answer, 'favorite' | 'recommended' | 'notes' | 'clicheLevel' | 'clicheReasons'>>
  >
  finalSet: FinalSetSlot[]
}

const emptyPersist = (): PersistedBlob => ({
  customAnswersByPrompt: {},
  answerOverrides: {},
  finalSet: [],
})

function loadRaw(): PersistedBlob {
  if (typeof window === 'undefined') return emptyPersist()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyPersist()
    const p = JSON.parse(raw) as PersistedBlob
    return {
      customAnswersByPrompt: p.customAnswersByPrompt ?? {},
      answerOverrides: p.answerOverrides ?? {},
      finalSet: Array.isArray(p.finalSet) ? p.finalSet : [],
    }
  } catch {
    return emptyPersist()
  }
}

function saveRaw(blob: PersistedBlob) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blob))
}

export function mergeAnswersIntoPrompt(p: Prompt, persisted: PersistedBlob): Prompt {
  const rawExtra = persisted.customAnswersByPrompt[p.id] ?? []
  const extra = rawExtra.map((a) =>
    a.clicheLevel != null && Array.isArray(a.clicheReasons)
      ? a
      : annotateAnswer({
          id: a.id,
          text: a.text,
          tags: a.tags ?? [],
          recommended: a.recommended,
          favorite: a.favorite,
          notes: a.notes,
          tier: a.tier,
        }),
  )
  const merged = [...p.answers, ...extra].map((a) => {
    const ov = persisted.answerOverrides[a.id]
    if (!ov) return { ...a }
    return {
      ...a,
      favorite: ov.favorite !== undefined ? ov.favorite : a.favorite,
      recommended: ov.recommended !== undefined ? ov.recommended : a.recommended,
      notes: ov.notes !== undefined ? ov.notes : a.notes,
      clicheLevel: ov.clicheLevel !== undefined ? ov.clicheLevel : a.clicheLevel,
      clicheReasons: ov.clicheReasons !== undefined ? ov.clicheReasons : a.clicheReasons,
    }
  })
  return { ...p, answers: merged }
}

export function usePromptBankPersistence(basePrompts: Prompt[]) {
  const [persisted, setPersisted] = useState<PersistedBlob>(() => loadRaw())

  useEffect(() => {
    saveRaw(persisted)
  }, [persisted])

  const prompts = useMemo(
    () => basePrompts.map((p) => mergeAnswersIntoPrompt(p, persisted)),
    [basePrompts, persisted],
  )

  const setFavorite = useCallback((answerId: string, value: boolean) => {
    setPersisted((prev) => ({
      ...prev,
      answerOverrides: {
        ...prev.answerOverrides,
        [answerId]: { ...prev.answerOverrides[answerId], favorite: value },
      },
    }))
  }, [])

  const setRecommended = useCallback((answerId: string, value: boolean) => {
    setPersisted((prev) => ({
      ...prev,
      answerOverrides: {
        ...prev.answerOverrides,
        [answerId]: { ...prev.answerOverrides[answerId], recommended: value },
      },
    }))
  }, [])

  const toggleFavorite = useCallback(
    (answerId: string, current: boolean | undefined) => {
      setFavorite(answerId, !current)
    },
    [setFavorite],
  )

  const toggleRecommended = useCallback(
    (answerId: string, current: boolean | undefined) => {
      setRecommended(answerId, !current)
    },
    [setRecommended],
  )

  const setAnswerNotes = useCallback((answerId: string, notes: string) => {
    setPersisted((prev) => ({
      ...prev,
      answerOverrides: {
        ...prev.answerOverrides,
        [answerId]: { ...prev.answerOverrides[answerId], notes },
      },
    }))
  }, [])

  const addCustomAnswer = useCallback((promptId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const nextAnswer = annotateAnswer({
      id,
      text: trimmed,
      tags: ['custom'],
    })
    setPersisted((prev) => ({
      ...prev,
      customAnswersByPrompt: {
        ...prev.customAnswersByPrompt,
        [promptId]: [...(prev.customAnswersByPrompt[promptId] ?? []), nextAnswer],
      },
    }))
  }, [])

  const addToFinalSet = useCallback((slot: FinalSetSlot) => {
    setPersisted((prev) => {
      const exists = prev.finalSet.some(
        (s) => s.promptId === slot.promptId && s.answerId === slot.answerId,
      )
      if (exists) return prev
      if (prev.finalSet.length >= 3) return prev
      return { ...prev, finalSet: [...prev.finalSet, slot] }
    })
  }, [])

  const removeFromFinalSet = useCallback((index: number) => {
    setPersisted((prev) => ({
      ...prev,
      finalSet: prev.finalSet.filter((_, i) => i !== index),
    }))
  }, [])

  const clearFinalSet = useCallback(() => {
    setPersisted((prev) => ({ ...prev, finalSet: [] }))
  }, [])

  const applyPresetSlots = useCallback(
    (slots: { promptId: string; answerId: string }[]) => {
      setPersisted((prev) => {
        const resolved: FinalSetSlot[] = []
        for (const s of slots.slice(0, 3)) {
          const p = basePrompts.find((x) => x.id === s.promptId)
          if (!p) continue
          const merged = mergeAnswersIntoPrompt(p, prev)
          const a = merged.answers.find((x) => x.id === s.answerId)
          if (a) {
            resolved.push({
              promptId: p.id,
              answerId: a.id,
              promptText: p.prompt,
              answerText: a.text,
            })
          }
        }
        return { ...prev, finalSet: resolved }
      })
    },
    [basePrompts],
  )

  return {
    persisted,
    prompts,
    toggleFavorite,
    toggleRecommended,
    setAnswerNotes,
    addCustomAnswer,
    addToFinalSet,
    removeFromFinalSet,
    clearFinalSet,
    applyPresetSlots,
  }
}
