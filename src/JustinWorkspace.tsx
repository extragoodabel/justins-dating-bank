import { useState } from 'react'

import { MatchTrackerProvider } from './hooks/useMatchTrackerStorage'
import { PromptBankPersistenceProvider } from './context/PromptBankPersistenceProvider'
import MatchTrackerTab from './MatchTrackerTab'
import PromptBankApp from './PromptBankApp'
import SaveProgressTab from './SaveProgressTab'
import SignalReportTab from './SignalReportTab'
import ThemeToggle from './theme/ThemeToggle'

export type WorkspaceTabId = 'bank' | 'tracker' | 'signal' | 'save'

const TAB_BTN =
  'relative whitespace-nowrap rounded-md px-3 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 ease-out md:px-5 md:text-[12px]'

export default function JustinWorkspace() {
  const [tab, setTab] = useState<WorkspaceTabId>('bank')

  return (
    <PromptBankPersistenceProvider>
      <MatchTrackerProvider>
        <div className="page-atmosphere min-h-[100dvh] text-ink">
          <nav className="chrome-blur sticky top-0 z-40 border-b border-border">
            <div className="relative flex items-stretch justify-center px-4 md:px-12">
              <div className="flex max-w-full items-stretch justify-start gap-1 overflow-x-auto pr-[8.75rem] md:justify-center md:gap-2 md:pr-12">
              {(
                [
                  ['bank', 'Prompt Bank'],
                  ['tracker', 'Match Tracker'],
                  ['signal', 'Signal Report'],
                  ['save', 'Save progress'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`${TAB_BTN} ${
                    tab === id
                      ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-accent'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
              </div>
              <div className="pointer-events-auto absolute right-4 top-1/2 z-50 -translate-y-1/2 md:right-10">
                <ThemeToggle />
              </div>
            </div>
          </nav>

          <div className="pointer-events-none stitch-rule mx-5 opacity-[0.28] md:mx-12" aria-hidden />

          {tab === 'bank' && <PromptBankApp stickyChromeTopClass="top-[52px]" />}
          {tab === 'tracker' && <MatchTrackerTab />}
          {tab === 'signal' && <SignalReportTab />}
          {tab === 'save' && <SaveProgressTab />}
        </div>
      </MatchTrackerProvider>
    </PromptBankPersistenceProvider>
  )
}
