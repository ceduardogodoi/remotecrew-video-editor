import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export function useFFmpeg() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [edittedVideoURL, setEdittedVideoURL] = useState<string | undefined>()
  const [progressPercentage, setProgressPercentage] = useState(0)
  const ffmpegRef = useRef<FFmpeg | null>(null)

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
        return dayjs.duration({ hours: 0, minutes, seconds }).format('HH:mm:ss')
      })

    setIsProcessing(true)

    const videoURL = new URL('/video.mp4', 'http://localhost:3000')
    const file = await fetchFile(videoURL.href)
    await ffmpegRef.current?.writeFile('./video.mp4', file)

    // if (process.env.NODE_ENV === 'development') {
    //   ffmpegRef.current?.on('log', ({ type, message }) => {
    //     console.log(`${type}: ${message}`)
    //   })
    // }

    ffmpegRef.current?.on('progress', ({ progress }) => {
      setProgressPercentage(Math.round(progress * 100))
    })

    await ffmpegRef.current?.exec([
      '-i', 'video.mp4',
      '-ss', startTime,
      '-to', endTime,
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
    progressPercentage,
    progressStatus,
    loadAndCropVideo,
  }
}
