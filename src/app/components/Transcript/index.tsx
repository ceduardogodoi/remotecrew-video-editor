'use client'

import { useEffect, useRef } from 'react';
import { dayjs } from '@/app/libs/dayjs'
import { Avatar } from '@/app/components/Avatar';
import { useAppContext } from '@/app/contexts';

interface Props {
  text: string
  time: number
  index: number
}

export function Transcript({
  text,
  time,
  index,
}: Props) {
  const name = 'Storyteller'
  const duration = dayjs.duration(time)
  const timeline = duration.format('mm:ss')

  const transcriptRef = useRef<HTMLButtonElement | null>(null)

  const {
    handleSeekTo,
    sentenceIndex,
  } = useAppContext()

  useEffect(() => {
    if (index === sentenceIndex) {
      transcriptRef.current?.classList.add('transcript-sentence--current')
      transcriptRef.current?.scrollIntoView()
    } else {
      transcriptRef.current?.classList.remove('transcript-sentence--current')
    }
  }, [index, sentenceIndex])

  function handleClick() {
    handleSeekTo(time, index)
  }

  return (
    <button
      className="transcript-sentence"
      onClick={handleClick}
      ref={transcriptRef}
    >
      <header className="transcript-sentence__header">
        <Avatar name={name} />

        <span className="transcript-sentence__name">
          {name}
        </span>

        <time className="transcript-sentence__time">
          {timeline}
        </time>
      </header>

      <div className="transcript-sentence__text-container">
        <p className="transcript-sentence__text">
          {text}
        </p>
      </div>
    </button>
  )
}
