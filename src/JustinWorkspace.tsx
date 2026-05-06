import { useState } from 'react'

import { MatchTrackerProvider } from './hooks/useMatchTrackerStorage'
import { PromptBankPersistenceProvider } from './context/PromptBankPersistenceProvider'
import MatchTrackerTab from './MatchTrackerTab'
import PromptBankApp from './PromptBankApp'
import SaveProgressTab from './SaveProgressTab'
import SignalReportTab from './SignalReportTab'

export type WorkspaceTabId = 'bank' | 'tracker' | 'signal' | 'save'

const TAB_BTN =
  'relative whitespace-nowrap px-3 py-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors md:px-5 md:text-[12px]'

export default function JustinWorkspace() {
  const [tab, setTab] = useState<WorkspaceTabId>('bank')

  return (
    <PromptBankPersistenceProvider>
      <MatchTrackerProvider>
        <div className="min-h-[100dvh] bg-[#0B0B0B] text-[#F5F5F5]">
          <nav className="sticky top-0 z-40 border-b border-[#2A2A2A] bg-[#0B0B0B]/95 backdrop-blur-md">
            <div className="flex items-stretch justify-start gap-1 overflow-x-auto px-4 md:justify-center md:gap-2 md:px-12">
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
                      ? 'text-[#F5F5F5] after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#9EFF6B]'
                      : 'text-[#A1A1A1] hover:text-[#dcdcdc]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>

          {tab === 'bank' && <PromptBankApp stickyChromeTopClass="top-[52px]" />}
          {tab === 'tracker' && <MatchTrackerTab />}
          {tab === 'signal' && <SignalReportTab />}
          {tab === 'save' && <SaveProgressTab />}
        </div>
      </MatchTrackerProvider>
    </PromptBankPersistenceProvider>
  )
}
