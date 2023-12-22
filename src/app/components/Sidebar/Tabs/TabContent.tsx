import { Tab } from '.'
import { TabSummary } from './TabSummary'
import { TabTranscript } from './TabTranscript'

interface SelectedTabProps {
  activeTab: Tab
}

export function TabContent({ activeTab }: SelectedTabProps) {
  return (
    <div className="tab__content">
      {activeTab === 'transcript' ? (
        <TabTranscript />
      ) : (
        <TabSummary />
      )}
    </div>
  )
}
