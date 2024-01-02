import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useTranscript } from '@/app/hooks/useTranscript';
import { ProcessVideoParams } from '../components/VideoEditor';

const baseURL = 'http://localhost:3000'

type ProgressStatus = 'idle' | 'adding-intro' | 'adding-logo' | 'cropping' | 'done'

export function useFFmpeg() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [edittedVideoURL, setEdittedVideoURL] = useState<string | undefined>()
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('idle')
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const { cropTranscript } = useTranscript()

  let progressStatusText: string | null
  switch (progressStatus) {
    case 'adding-intro':
      progressStatusText = 'Adding intro...'
      break
    case 'cropping':
      progressStatusText = 'Cropping...'
    case 'adding-logo':
      progressStatusText = 'Adding logo...'
      break
    case 'done':
      progressStatusText = 'Done'
      break
    case 'idle':
    default:
      progressStatusText = null
  }

  async function loadFFmpeg() {
    if (!ffmpegRef.current) {
      const ffmpegRefInstance = new FFmpeg()
      await ffmpegRefInstance.load()

      ffmpegRef.current = ffmpegRefInstance
    }
  }

  async function processVideo(params: ProcessVideoParams) {
    setIsProcessing(true)

    const {
      startTime: startTimeStr,
      endTime: endTimeStr,
      shouldAddIntro,
      shouldAddLogo
    } = params

    const [startTime, endTime] = [startTimeStr, endTimeStr]
      .map(time => {
        const [minutes, seconds] = time.split(':').map(Number)

        const duration = dayjs.duration({ hours: 0, minutes, seconds })

        return {
          timeMs: duration.asMilliseconds(),
          timeFormatted: duration.format('HH:mm:ss'),
        }
      })

    ffmpegRef.current?.on('log', ({ type, message }) => {
      console.log(`${type}: ${message}`)
    })

    ffmpegRef.current?.on('progress', ({ progress }) => {
      const percentage = Math.round(progress * 100) 
      setProgressPercentage(percentage > 100 ? 100 : percentage)
    })

    let outputFile = './output.mp4'

    await cropVideo(startTime.timeFormatted, endTime.timeFormatted, outputFile)

    let introDurationMs = 0
    if (shouldAddIntro) {
      const { outputFileWithIntro, introDuration } = await addIntro(outputFile)
      introDurationMs = introDuration
      outputFile = outputFileWithIntro
    }

    if (shouldAddLogo) {
      outputFile = await addLogo(outputFile)
    }

    const data = await ffmpegRef.current?.readFile(outputFile)
    if (data) {
      const url = URL.createObjectURL(new Blob([data], { type: 'video/*' }))
      setEdittedVideoURL(url)
      URL.revokeObjectURL(url)

      cropTranscript(startTime.timeMs, endTime.timeMs, introDurationMs)
    }

    setIsProcessing(false)
    setProgressStatus('done')
  }

  async function cropVideo(startTime: string, endTime: string, outputFile: string) {
    setProgressStatus('cropping')

    const url = new URL('/input.mp4', baseURL)
    const videoFile = await fetchFile(url.href)

    await ffmpegRef.current?.writeFile('./input.mp4', videoFile)

    await ffmpegRef.current?.exec([
      '-i', 'input.mp4',
      '-ss', startTime,
      '-to', endTime,
      outputFile,
    ])
  }

  async function addIntro(inputFile: string) {
    setProgressStatus('adding-intro')

    const url = new URL('./intro.mp4', baseURL)
    const introFile = await fetchFile(url.href)
    await ffmpegRef.current?.writeFile('./intro.mp4', introFile)

    const outputFileWithIntro = 'intro-output.mkv'

    const video = document.createElement('video')
    video.setAttribute('src', './intro.mp4')
    video.preload = 'metadata'

    let introDuration = 0
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      introDuration = dayjs
        .duration({ seconds: video.duration })
        .asMilliseconds()
    }
    video.remove()

    await ffmpegRef.current?.exec([
      '-i', 'intro.mp4',
      '-i', inputFile,
      '-filter_complex', '[0:v] [0:a] [1:v] [1:a] concat=n=2:v=1:a=1 [v] [a]',
      '-map', '[v]',
      '-map', '[a]',
      outputFileWithIntro,
    ])

    return {
      outputFileWithIntro,
      introDuration,
    }
  }

  async function addLogo(inputFile: string) {
    setProgressStatus('adding-logo')

    const url = new URL('/logo.jpeg', baseURL)
    const logoFile = await fetchFile(url.href)
    await ffmpegRef.current?.writeFile('./logo.jpeg', logoFile)

    const outputFileWithLogo = 'logo-output.mp4'

    await ffmpegRef.current?.exec([
      '-i', inputFile,
      '-i', 'logo.jpeg',
      '-filter_complex', '[0:v][1:v] overlay=25:50',
      outputFileWithLogo,
    ])

    return outputFileWithLogo
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
    progressStatusText,
    processVideo,
  }
}
