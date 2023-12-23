'use client'

import { useEffect, useRef } from 'react';
import { dayjs } from '@/app/libs/dayjs'
import { Avatar } from '@/app/components/Avatar';
import { useAppContext } from '@/app/contexts';

interface Props {
  text: string
  time: number
}

export function Transcript({
  text,
  time,
}: Props) {
  const name = 'Storyteller'
  const duration = dayjs.duration(time)
  const timeline = duration.format('mm:ss')

  const transcriptRef = useRef<HTMLButtonElement | null>(null)

  const {
    handleSeekTo,
    currentTimingMs,
  } = useAppContext()

  useEffect(() => {
    if (currentTimingMs === time) {
      transcriptRef.current?.classList.add('transcript-sentence--current')
    } else {
      transcriptRef.current?.classList.remove('transcript-sentence--current')
    }
  }, [currentTimingMs, time])

  function handleClick() {
    const seconds = dayjs.duration(time).asSeconds()
    handleSeekTo(time)
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
