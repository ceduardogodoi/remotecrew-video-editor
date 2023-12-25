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
import { useTranscript } from '@/app/hooks/useTranscript'
import { duration } from 'dayjs'

interface AppContext {
  playerRef: MutableRefObject<ReactPlayer | null>,
  isPlayerReady: boolean
  isVideoPlaying: boolean
  currentTime: number
  sentenceIndex: number

  handlePlayVideo(): void
  handlePauseVideo(): void
  handlePlayPauseVideo(): void
  handleSeekTo(seconds: number, index: number): void
}

const AppContext = createContext({} as AppContext)

export function AppContextProvider({ children }: PropsWithChildren) {
  const { transcript } = useTranscript()

  const playerRef = useRef<ReactPlayer | null>(null)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const [state, setState] = useState({
    isPlayerReady: false,
    isVideoPlaying: false,
    currentTime: playerRef.current?.getCurrentTime() ?? 0,
    sentenceIndex: 0,
  })

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
      currentTime: time,
      sentenceIndex: index,
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
      // console.log('current transcript', sentenceIndex);
      // console.log('timeoutsRef:', timeoutsRef.current)

      const previousTimeoutId = timeoutsRef.current.pop()
      clearTimeout(previousTimeoutId)
      // console.log('previousTimeoutId deleted:', previousTimeoutId)

      const { duration } = transcript[sentenceIndex]

      const newTimeoutId = setTimeout(() => {
        setState(previous => ({
          ...previous,
          sentenceIndex: previous.sentenceIndex + 1,
        }))
      }, duration)

      timeoutsRef.current.push(newTimeoutId)
      // console.log('newTimeoutId added:', newTimeoutId)
    }
  }, [transcript, state.isVideoPlaying, state.sentenceIndex])

  return (
    <AppContext.Provider value={{
      playerRef,
      isPlayerReady: state.isPlayerReady,
      isVideoPlaying: state.isVideoPlaying,
      currentTime: state.currentTime,
      sentenceIndex: state.sentenceIndex,

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
