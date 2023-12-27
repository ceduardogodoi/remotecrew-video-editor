'use client'

import ReactPlayer from 'react-player/lazy'
import dayjs from 'dayjs'
import { Pause, Play } from 'lucide-react'
import { useAppContext } from '@/app/contexts'
import { useFFmpeg } from '@/app/hooks/useFFmpeg'

export function VideoEditor() {
  const {
    ffmpeg,
    loadAndClipVideo,
    isProcessing,
    edittedVideoURL,
  } = useFFmpeg()

  const {
    isPlayerReady,
    isVideoPlaying,
    playerRef,
    handlePlayVideo,
    handlePauseVideo,
    handlePlayPauseVideo,
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
        />
      )}

      <div className="video-editor__editor">
        <button
          className="btn"
          onClick={handlePlayPauseVideo}
          disabled={isProcessing}
        >
          {isVideoPlaying ? (
            <Pause fill="currentColor" size={18} />
          ) : (
            <Play fill="currentColor" size={18} />
          )}

          <span>
            {isVideoPlaying ? 'Pause' : 'Play'}
          </span>
        </button>

        {edittedVideoURL && (
          <ReactPlayer
            url={edittedVideoURL}
            width="100%"
            height="500px"
            controls
          />
        )}
      </div>
    </div>
  )
}
