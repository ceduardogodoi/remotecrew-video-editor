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

interface AppContext {
  playerRef: MutableRefObject<ReactPlayer | null>,
  isPlayerReady: boolean
  isVideoPlaying: boolean
  handlePlayVideo(): void
  handlePauseVideo(): void
  handlePlayPauseVideo(): void
}

const AppContext = createContext({} as AppContext)

export function AppContextProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState({
    isPlayerReady: false,
    isVideoPlaying: false,
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

      handlePlayVideo,
      handlePauseVideo,
      handlePlayPauseVideo,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
