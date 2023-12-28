import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get('v')
  if (!videoId) {
    return NextResponse.json({
      error: 'No video id provided'
    })
  }

  const sentences = await YoutubeTranscript.fetchTranscript(videoId)
  for (let i = 0; i < sentences.length - 2; i++) {
    const duration = sentences[i + 1].offset - sentences[i].offset
    sentences[i].duration = duration
  }

  return NextResponse.json(sentences)
}
