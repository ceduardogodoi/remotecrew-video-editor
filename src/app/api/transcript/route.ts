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

  const transcript = await YoutubeTranscript.fetchTranscript(videoId)
  return NextResponse.json(transcript)
}
