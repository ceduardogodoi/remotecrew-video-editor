import { YoutubeTranscript } from 'youtube-transcript'
import { SearchBar } from '@/app/components/SearchBar';
import { Transcript } from '@/app/components/Transcript';

export function TabTranscript() {
  return (
    <>
      <SearchBar />

      <div className="tab__content__transcript">
        <Transcript />
        <Transcript />
        <Transcript />
        <Transcript />
        <Transcript />
      </div>
    </>
  )
}
