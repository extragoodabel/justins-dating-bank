import { useEffect, useState } from 'react'
import PromptBankApp from './PromptBankApp'
import WorkshopDeck from './WorkshopDeck'

export default function App() {
  const [mode, setMode] = useState<'prompt' | 'workshop'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#workshop'
      ? 'workshop'
      : 'prompt',
  )

  useEffect(() => {
    const sync = () =>
      setMode(window.location.hash === '#workshop' ? 'workshop' : 'prompt')
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return mode === 'workshop' ? <WorkshopDeck /> : <PromptBankApp />
}
