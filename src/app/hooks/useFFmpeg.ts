import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useTranscript } from '@/app/hooks/useTranscript';

export function useFFmpeg() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [edittedVideoURL, setEdittedVideoURL] = useState<string | undefined>()
  const [progressPercentage, setProgressPercentage] = useState(0)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const { cropTranscript } = useTranscript()

  let progressStatus: string
  switch (progressPercentage) {
    case 0:
      progressStatus = 'Crop'
      break
    case 100:
      progressStatus = 'Cropped'
      break
    default:
      progressStatus = `Cropping... ${progressPercentage}%`
  }

  async function loadFFmpeg() {
    if (!ffmpegRef.current) {
      const ffmpegRefInstance = new FFmpeg()
      await ffmpegRefInstance.load()

      ffmpegRef.current = ffmpegRefInstance
    }
  }

  async function loadAndCropVideo(startTimeStr: string, endTimeStr: string) {
    const [startTime, endTime] = [startTimeStr, endTimeStr]
      .map(time => {
        const [minutes, seconds] = time.split(':').map(Number)

        const duration = dayjs.duration({ hours: 0, minutes, seconds })

        return {
          timeMs: duration.asMilliseconds(),
          timeFormatted: duration.format('HH:mm:ss'),
        }
      })

    setIsProcessing(true)

    const baseURL = 'http://localhost:3000'
    const inputURL = new URL('/input.mp4', baseURL)
    const logoURL = new URL('/logo.jpeg', baseURL)
    const videoFile = await fetchFile(inputURL.href)
    const logoFile = await fetchFile(logoURL.href)
    await ffmpegRef.current?.writeFile('./input.mp4', videoFile)
    await ffmpegRef.current?.writeFile('./logo.jpeg', logoFile)

    if (process.env.NODE_ENV === 'development') {
      ffmpegRef.current?.on('log', ({ type, message }) => {
        console.log(`${type}: ${message}`)
      })
    }

    ffmpegRef.current?.on('progress', ({ progress }) => {
      setProgressPercentage(Math.round(progress * 100))
    })

    await ffmpegRef.current?.exec([
      '-i', 'input.mp4',
      '-i', 'logo.jpeg',
      '-filter_complex', '[0:v][1:v] overlay=25:50',
      '-ss', startTime.timeFormatted,
      '-to', endTime.timeFormatted,
      'output.mp4',
    ])

    const data = await ffmpegRef.current?.readFile('./output.mp4')
    if (data) {
      const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }))
      setEdittedVideoURL(url)

      cropTranscript(startTime.timeMs, endTime.timeMs)
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
    progressPercentage,
    progressStatus,
    loadAndCropVideo,
  }
}
