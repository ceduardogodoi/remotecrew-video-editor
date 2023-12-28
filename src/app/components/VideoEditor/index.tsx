'use client'

import ReactPlayer from 'react-player/lazy'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { Pause, Play } from 'lucide-react'
import { useAppContext } from '@/app/contexts'
import { useFFmpeg } from '@/app/hooks/useFFmpeg'

interface Inputs {
  startTime: string
  endTime: string
}

export function VideoEditor() {
  const { register, handleSubmit } = useForm<Inputs>()

  const {
    isProcessing,
    edittedVideoURL,
    loadAndCropVideo,
  } = useFFmpeg()

  const {
    isPlayerReady,
    isVideoPlaying,
    playerRef,
    videoDuration: videoDurationSeconds,

    handlePlayVideo,
    handlePauseVideo,
    handlePlayPauseVideo,
  } = useAppContext()


  let videoDuration: string | null = null
  if (videoDurationSeconds) {
    videoDuration = dayjs.duration(videoDurationSeconds, 's').format('mm:ss')
  }

  async function handleClipVideo({ startTime, endTime }: Inputs) {
    await loadAndCropVideo(startTime, endTime)
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
          title={isVideoPlaying ? 'Pause video' : 'Play video'}
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

        {videoDuration && (
          <form className="video-editor__clip-timings" onSubmit={handleSubmit(handleClipVideo)}>
            <button
              type="submit"
              className="btn btn--secondary"
              title="Crop video in selected time range"
              disabled={isProcessing}
            >
              Crop
            </button>

            <div className="video-editor__form-field">
              <label
                className="video-editor__form-label"
                htmlFor="start"
              >
                Start:
              </label>
              <input
                className="video-editor__form-input"
                id="start"
                type="text"
                defaultValue="00:00"
                {...register('startTime')}
              />
            </div>

            <span className="video-editor__time-separator">
              -
            </span>

            <div className="video-editor__form-field">
              <label
                className="video-editor__form-label"
                htmlFor="end"
              >
                End:
              </label>
              <input
                className="video-editor__form-input"
                id="end"
                type="text"
                defaultValue={videoDuration}
                {...register('endTime')}
              />
            </div>
          </form>
        )}
      </div>

      {edittedVideoURL && (
        <ReactPlayer
          url={edittedVideoURL}
          width="100%"
          height="500px"
          controls
        />
      )}
    </div>
  )
}
