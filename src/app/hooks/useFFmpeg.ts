import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useTranscript } from '@/app/hooks/useTranscript';
import { ProcessVideoParams } from '../components/VideoEditor';

const baseURL = 'http://localhost:3000'

type ProgressStatus = 'idle' | 'adding-intro' | 'adding-logo' | 'cropping' | 'done' | 'error'

type IOFiles = {
  inputFile?: string
  outputFile?: string
}

export function useFFmpeg() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [edittedVideoURL, setEdittedVideoURL] = useState<string | undefined>()
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('idle')
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const fileRef = useRef<IOFiles>({})

  const { cropTranscript } = useTranscript()

  let progressStatusText: string | null
  switch (progressStatus) {
    case 'adding-intro':
      progressStatusText = 'Adding intro...'
      break
    case 'cropping':
      progressStatusText = 'Cropping...'
      break
    case 'adding-logo':
      progressStatusText = 'Adding logo...'
      break
    case 'done':
      progressStatusText = 'Done'
      break
    case 'error':
      progressStatusText = 'Error'
      break
    case 'idle':
    default:
      progressStatusText = 'Idle'
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
      shouldAddLogo,
      shouldCrop,
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

    fileRef.current.inputFile = 'input.mp4'
    const inputFile = fileRef.current.inputFile

    const inputURL = new URL(`/${inputFile}`, baseURL)
    const videoFileWASM = await fetchFile(inputURL.href)
    await ffmpegRef.current?.writeFile(`./${inputFile}`, videoFileWASM)

    try {
      if (shouldCrop) {
        await cropVideo(startTime.timeFormatted, endTime.timeFormatted)
      }
  
      let introDurationMs = 0
      if (shouldAddIntro) {
        const introDuration = await addIntro()
        introDurationMs = introDuration
      }
  
      // if (shouldAddLogo) {
      //   outputFile = await addLogo(outputFile)
      // }
  
      const data = await ffmpegRef.current?.readFile(fileRef.current.outputFile!)
      if (data) {
        const url = URL.createObjectURL(new Blob([data], { type: 'video/*' }))
        setEdittedVideoURL(url)
  
        cropTranscript(startTime.timeMs, endTime.timeMs, introDurationMs)
      }

      setProgressStatus('done')
    } catch (error) {
      console.log(error)
      setProgressStatus('error')
    }

    const dir = await ffmpegRef.current?.listDir('/')
    console.log('dir:::::', dir)

    setIsProcessing(false)
  }

  async function cropVideo(startTime: string, endTime: string) {
    setProgressStatus('cropping')

    fileRef.current.outputFile = 'output.mp4'
    const outputFile = fileRef.current.outputFile

    await ffmpegRef.current?.exec([
      '-i', 'input.mp4',
      '-ss', startTime,
      '-to', endTime,
      outputFile,
    ])
  }

  async function addIntro() {
    setProgressStatus('adding-intro')

    const introURL = new URL('./intro.mp4', baseURL)
    const introFile = await fetchFile(introURL.href)
    await ffmpegRef.current?.writeFile('./intro.mp4', introFile)

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

    fileRef.current.outputFile = 'intro-output.mkv'
    const outputFile = fileRef.current.outputFile

    await ffmpegRef.current?.exec([
      '-i', 'intro.mp4',
      '-i', fileRef.current.inputFile ?? 'input.mp4',
      '-filter_complex', '[0:v] [0:a] [1:v] [1:a] concat=n=2:v=1:a=1 [v] [a]',
      '-map', '[v]',
      '-map', '[a]',
      outputFile,
    ])

    return introDuration
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
