'use client'

import { SearchBar } from '@/app/components/SearchBar';
import { Transcript } from '@/app/components/Transcript';
import { useTranscript } from '@/app/hooks/useTranscript';

export function TabTranscript() {
  const { transcript } = useTranscript()

  return (
    <>
      <SearchBar />

      <div className="tab__content__transcript">
        {transcript.map((sentence, index) => (
            <Transcript
              key={index}
              text={sentence.text}
              time={sentence.offset}
            />
          )
        )}
      </div>
    </>
  )
}
