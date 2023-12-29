'use client'

import {
  MutableRefObject,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import ReactPlayer from 'react-player'
import { dayjs } from '@/app/libs/dayjs'
import { TranscriptResponse } from 'youtube-transcript'

interface AppContext {
  transcript: TranscriptResponse[],
  playerRef: MutableRefObject<ReactPlayer | null>,
  isPlayerReady: boolean
  isVideoPlaying: boolean
  sentenceIndex: number
  videoDuration?: number

  updateTranscript(newTranscript: TranscriptResponse[]): void
  handlePlayVideo(): void
  handlePauseVideo(): void
  handlePlayPauseVideo(): void
  handleSeekTo(seconds: number, index: number): void
}

const AppContext = createContext({} as AppContext)

export function AppContextProvider({ children }: PropsWithChildren) {
  const playerRef = useRef<ReactPlayer | null>(null)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const videoDuration = playerRef.current?.getDuration()

  const [state, setState] = useState({
    isPlayerReady: false,
    isVideoPlaying: false,
    sentenceIndex: 0,
  })
  const [transcript, setTranscript] = useState<TranscriptResponse[]>([])
  console.log(transcript)

  function handlePlayVideo() {
    setState(previous => ({
      ...previous,
      isVideoPlaying: true,
    }))
  }

  function handlePauseVideo() {
    setState(previous => ({
      ...previous,
      isVideoPlaying: false,
    }))
  }

  function handlePlayPauseVideo() {
    setState(previous => ({
      ...previous,
      isVideoPlaying: !previous.isVideoPlaying,
    }))
  }

  function handleSeekTo(time: number, index: number) {
    const seconds = dayjs.duration(time).asSeconds()
    playerRef.current?.seekTo(seconds, 'seconds')

    setState(previous => ({
      ...previous,
      sentenceIndex: index,
    }))
  }

  function updateTranscript(newTranscript: TranscriptResponse[]) {
    setTranscript(newTranscript)

    setState(previous => ({
      ...previous,
      sentenceIndex: 0,
    }))
  }

  useEffect(() => {
    if (!state.isPlayerReady) {
      setState(previous => ({
        ...previous,
        isPlayerReady: true,
      }))
    }
  }, [state.isPlayerReady])

  useEffect(() => {
    const { isVideoPlaying, sentenceIndex } = state
    if (playerRef.current && isVideoPlaying && transcript[sentenceIndex]) {
      const previousTimeoutId = timeoutsRef.current.pop()
      clearTimeout(previousTimeoutId)

      const newTimeoutId = setTimeout(() => {
        setState(previous => ({
          ...previous,
          sentenceIndex: previous.sentenceIndex + 1,
        }))
      }, transcript[sentenceIndex].duration)

      timeoutsRef.current.push(newTimeoutId)
    }
  }, [transcript, state.isVideoPlaying, state.sentenceIndex])

  return (
    <AppContext.Provider value={{
      transcript,
      playerRef,
      isPlayerReady: state.isPlayerReady,
      isVideoPlaying: state.isVideoPlaying,
      sentenceIndex: state.sentenceIndex,
      videoDuration,

      updateTranscript,
      handlePlayVideo,
      handlePauseVideo,
      handlePlayPauseVideo,
      handleSeekTo,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
