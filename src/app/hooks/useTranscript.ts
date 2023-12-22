import { useEffect, useState } from "react";
import { TranscriptResponse } from "youtube-transcript";

export function useTranscript() {
  const [transcript, setTranscript] = useState<TranscriptResponse[]>([])

  async function fetchTranscript() {
    const url = new URL('/api/transcript', 'http://localhost:3000')
    url.searchParams.append('v', 'ce5tWoPPRIQ')
    const response = await fetch(url)
    const data = await response.json()

    setTranscript(data)
    return data
  }

  useEffect(() => {
    fetchTranscript()
  }, [])

  return {
    transcript
  }
}
