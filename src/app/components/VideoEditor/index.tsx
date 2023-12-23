'use client'

import { useAppContext } from '@/app/contexts'
import ReactPlayer from 'react-player/lazy'

export function VideoEditor() {
  const {
    isPlayerReady,
    isVideoPlaying,
    playerRef,
    handlePlayVideo,
    handlePauseVideo,
  } = useAppContext()

  return (
    <div className="video-editor">
      {isPlayerReady && (
        <ReactPlayer
          ref={playerRef}
          url="https://www.youtube.com/watch?v=ce5tWoPPRIQ"
          width="100%"
          height="100%"
          playing={isVideoPlaying}
          onPlay={handlePlayVideo}
          onPause={handlePauseVideo}
        />
      )}

      <div className="video-editor__editor"></div>
    </div>
  )
}
