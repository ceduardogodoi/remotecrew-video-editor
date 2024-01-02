import { useEffect, useMemo, useState } from 'react';
import { TranscriptResponse } from 'youtube-transcript';
import { useAppContext } from '../contexts';

export function useTranscript() {
  const { transcript, updateTranscript } = useAppContext()

  async function fetchTranscript() {
    const url = new URL('/api/transcript', 'http://localhost:3000')
    url.searchParams.append('v', 'ce5tWoPPRIQ')
    const response = await fetch(url)
    const data = await response.json()

    updateTranscript(data)
    return data
  }

  function cropTranscript(startMs: number, endMs: number, introDurationMs = 0) {
    const newTranscript = transcript.filter(sentence => {
      return sentence.offset >= startMs && sentence.offset <= endMs
    })

    newTranscript[0].offset = 0
    newTranscript[0].duration = introDurationMs + 2000
    for (let i = 1; i < newTranscript.length; i++) {
      newTranscript[i].offset = newTranscript[i - 1].offset + newTranscript[i - 1].duration
    }

    updateTranscript(newTranscript)
  }

  useEffect(() => {
    fetchTranscript()
  }, [])

  return {
    transcript,

    cropTranscript,
  }
}
