'use client'

import { SearchBar } from '@/app/components/SearchBar';
import { Transcript } from '@/app/components/Transcript';
import { useAppContext } from '@/app/contexts';
import { useTranscript } from '@/app/hooks/useTranscript';

export function TabTranscript() {
  const { transcript } = useTranscript()
  const { sentenceIndex } = useAppContext()

  return (
    <>
      <SearchBar />

      <div className="tab__content__transcript">
        {transcript.map((sentence, index) => {
          const isCurrentSentence = sentenceIndex === index

          return (
            <Transcript
              key={index}
              text={sentence.text}
              time={sentence.offset}
              isCurrentSentence={isCurrentSentence}
            />
          )
        })}
      </div>
    </>
  )
}
