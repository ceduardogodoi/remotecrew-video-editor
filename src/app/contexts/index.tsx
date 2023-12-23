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

interface AppContext {
  playerRef: MutableRefObject<ReactPlayer | null>,
  isPlayerReady: boolean
  isVideoPlaying: boolean
  currentTimingMs: number
  handlePlayVideo(): void
  handlePauseVideo(): void
  handlePlayPauseVideo(): void
  handleSeekTo(seconds: number): void
}

const AppContext = createContext({} as AppContext)

export function AppContextProvider({ children }: PropsWithChildren) {
  const { transcript } = useTranscript()

  const [state, setState] = useState({
    isPlayerReady: false,
    isVideoPlaying: false,
    currentTimingMs: transcript[0]?.offset ?? 0,
  })

  const playerRef = useRef<ReactPlayer | null>(null)

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

  function handleSeekTo(time: number) {
    const seconds = dayjs.duration(time).asSeconds()
    playerRef.current?.seekTo(seconds, 'seconds')

    setState(previous => ({
      ...previous,
      currentTimingMs: time,
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

  return (
    <AppContext.Provider value={{
      playerRef,
      isPlayerReady: state.isPlayerReady,
      isVideoPlaying: state.isVideoPlaying,
      currentTimingMs: state.currentTimingMs,

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
