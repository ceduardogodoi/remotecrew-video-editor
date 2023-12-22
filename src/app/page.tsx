import { Sidebar } from '@/app/components/Sidebar'
import { VideoEditor } from '@/app/components/VideoEditor'

export default async function Home() {
  return (
    <main>
      <div className="content">
        <VideoEditor />

        <Sidebar />
      </div>
    </main>
  )
}
