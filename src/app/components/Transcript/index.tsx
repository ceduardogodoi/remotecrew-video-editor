'use client'

import { useEffect, useRef } from 'react';
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Avatar } from '@/app/components/Avatar';

dayjs.extend(duration)

interface Props {
  text: string
  time: number
  isCurrentSentence: boolean
}

export function Transcript({
  text,
  time,
  isCurrentSentence,
}: Props) {
  const transcriptRef = useRef<HTMLDivElement>(null)

  const name = 'Storyteller'
  const duration = dayjs.duration(time)
  const timeline = duration.format('mm:ss')

  useEffect(() => {
    if (isCurrentSentence) {
      transcriptRef.current?.classList.add('transcript-sentence--current')
      transcriptRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    } else {
      transcriptRef.current?.classList.remove('transcript-sentence--current')
    }
  }, [isCurrentSentence])

  return (
    <div
      className="transcript-sentence"
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
    </div>
  )
}
