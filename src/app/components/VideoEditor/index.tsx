'use client'

import ReactPlayer from 'react-player/lazy'
import { useAppContext } from '@/app/contexts'
import { useFFmpeg } from '@/app/hooks/useFFmpeg'

export function VideoEditor() {
  const { loadAndClipVideo, isProcessing, edittedVideoURL } = useFFmpeg()

  const {
    isPlayerReady,
    isVideoPlaying,
    playerRef,
    handlePlayVideo,
    handlePauseVideo,
  } = useAppContext()

  async function handleClipVideo() {
    await loadAndClipVideo()
  }

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

      <div className="video-editor__editor">
        <button
          className="btn"
          onClick={handleClipVideo}
        >
          {isProcessing ? 'Processing...' : 'Clip Video'}
        </button>

        {edittedVideoURL && (
        <ReactPlayer
          url={edittedVideoURL}
          width="100%"
          height="500px"
          playing
          // onPlay={handlePlayVideo}
          // onPause={handlePauseVideo}
          controls
        />
      )}
      </div>
    </div>
  )
}
