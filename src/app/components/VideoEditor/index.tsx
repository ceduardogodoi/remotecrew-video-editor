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
          url="/video.mp4"
          width="100%"
          height="500px"
          playing={isVideoPlaying}
          onPlay={handlePlayVideo}
          onPause={handlePauseVideo}
          controls
        />
      )}

      <div className="video-editor__editor" />
    </div>
  )
}
