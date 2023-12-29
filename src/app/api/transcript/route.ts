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
  sentences[0].duration = sentences[1].offset - sentences[0].offset
  for (let i = 1; i < sentences.length; i++) {
      sentences[i].duration = sentences[i].offset - sentences[i - 1].offset
  }

  return NextResponse.json(sentences)
}
