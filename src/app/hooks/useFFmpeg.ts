import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useTranscript } from '@/app/hooks/useTranscript';

const baseURL = 'http://localhost:3000'

type FileData = Awaited<ReturnType<InstanceType<typeof FFmpeg>['readFile']>>

type ProcessVideoParams = {
  startTimeStr: string
  endTimeStr: string
  shouldAddIntro: boolean
  shouldAddLogo: boolean
}

type ProgressStatus = 'idle' | 'adding-intro' | 'adding-logo' | 'cropping'

export function useFFmpeg() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [edittedVideoURL, setEdittedVideoURL] = useState<string | undefined>()
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('idle')
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const { cropTranscript } = useTranscript()

  async function loadFFmpeg() {
    if (!ffmpegRef.current) {
      const ffmpegRefInstance = new FFmpeg()
      await ffmpegRefInstance.load()

      ffmpegRef.current = ffmpegRefInstance
    }
  }

  async function processVideo(params: ProcessVideoParams) {
    setIsProcessing(true)

    const { startTimeStr, endTimeStr, shouldAddIntro, shouldAddLogo } = params

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
      setProgressPercentage(Math.round(progress * 100))
    })

    let data: FileData | undefined
    let outputFile = './output.mp4'

    await cropVideo(startTime.timeFormatted, endTime.timeFormatted, outputFile)
    console.log(outputFile)

    if (shouldAddIntro) {
      console.log('adding intro')
      outputFile = await addIntro(outputFile)
      console.log('outputFile', outputFile)
    }

    if (shouldAddLogo) {
      console.log('adding logo')
      outputFile = await addLogo(outputFile)
      console.log('outputFile', outputFile)
    }

    data = await ffmpegRef.current?.readFile(outputFile)
    if (data) {
      const url = URL.createObjectURL(new Blob([data], { type: 'video/*' }))
      setEdittedVideoURL(url)

      cropTranscript(startTime.timeMs, endTime.timeMs)
    }

    setIsProcessing(false)
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

    await ffmpegRef.current?.exec([
      '-i', 'intro.mp4',
      '-i', inputFile,
      '-filter_complex', '[0:v] [0:a] [1:v] [1:a] concat=n=2:v=1:a=1 [v] [a]',
      '-map', '[v]',
      '-map', '[a]',
      outputFileWithIntro,
    ])

    return outputFileWithIntro
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
    processVideo,
  }
}
