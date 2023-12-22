'use client'

import { PropsWithChildren, useRef, useState } from 'react'
import { TabContent } from './TabContent'

export type Tab = 'transcript' | 'summary'

export function Tabs({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<Tab>('transcript')

  const transcriptRef = useRef<HTMLButtonElement | null>(null)
  const summaryRef = useRef<HTMLButtonElement | null>(null)

  function handleTabChangeTranscript() {
    setActiveTab('transcript')
    transcriptRef.current?.classList.add('tab--active')
    summaryRef.current?.classList.remove('tab--active')
  }

  function handleTabChangeSummary() {
    setActiveTab('summary')
    summaryRef.current?.classList.add('tab--active')
    transcriptRef.current?.classList.remove('tab--active')
  }

  return (
    <>
      <header className="sidebar__header">
        <div className="sidebar__tabs">
          <button
            ref={transcriptRef}
            className="tab tab--active" onClick={handleTabChangeTranscript}
          >
            Transcript
          </button>
          <button
            ref={summaryRef}
            className="tab" onClick={handleTabChangeSummary}
          >
            Summary
          </button>
        </div>
      </header>

      <TabContent activeTab={activeTab} />
    </>
  )
}
