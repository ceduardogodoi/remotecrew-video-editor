import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

export function useFFmpeg() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [edittedVideoURL, setEdittedVideoURL] = useState<string | undefined>()
  const ffmpegRef = useRef<FFmpeg | null>(null)

  async function loadFFmpeg() {
    if (!ffmpegRef.current) {
      const ffmpegRefInstance = new FFmpeg()
      await ffmpegRefInstance.load()

      ffmpegRef.current = ffmpegRefInstance
    }
  }

  async function loadAndClipVideo() {
    setIsProcessing(true)

    const videoURL = new URL('/video.mp4', 'http://localhost:3000')
    const file = await fetchFile(videoURL.href)
    await ffmpegRef.current?.writeFile('./video.mp4', file)

    ffmpegRef.current?.on('log', ({ type, message }) => {
      console.log(`${type}: ${message}`)
    })

    await ffmpegRef.current?.exec([
      '-i', 'video.mp4',
      '-t', '2.5',
      'video-clip.mp4',
    ])

    const data = await ffmpegRef.current?.readFile('./video-clip.mp4')
    if (data) {
      const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }))
      setEdittedVideoURL(url)
    }

    setIsProcessing(false)
  }


  useEffect(() => {
    loadFFmpeg()
  }, [])

  return {
    ffmpeg: ffmpegRef.current,
    isProcessing,
    edittedVideoURL,
    loadAndClipVideo,
  }
}
