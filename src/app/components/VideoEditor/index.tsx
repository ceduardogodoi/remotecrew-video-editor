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
    progressStatus,
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
    handlePauseVideo()

    await loadAndCropVideo(startTime, endTime)
  }

  return (
    <div className="video-editor">
      {!!edittedVideoURL && (
        <h1 className="video-editor__preview-title">Previewing cropped video</h1>
      )}

      {isPlayerReady && (
        <ReactPlayer
          ref={playerRef}
          url={edittedVideoURL ?? "/input.mp4"}
          width="100%"
          height="500px"
          playing={isVideoPlaying}
          onPlay={handlePlayVideo}
          onPause={handlePauseVideo}
          controls={!!edittedVideoURL}
        />
      )}

      <div className="video-editor__editor">
        <button
          className="btn"
          onClick={handlePlayPauseVideo}
          title={isVideoPlaying ? 'Pause video' : 'Play video'}
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

        {videoDuration && (
          <form className="video-editor__clip-timings" onSubmit={handleSubmit(handleClipVideo)}>
            <button
              type="submit"
              className="btn btn--secondary"
              title="Crop video in selected time range"
              disabled={isProcessing || progressStatus === 'Cropped'}
            >
              {progressStatus}
            </button>

            {!!edittedVideoURL && (
              <a
                href={edittedVideoURL}
                className="btn"
                type="button"
                download
              >
                Download
              </a>
            )}

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
                defaultValue="01:50"
                disabled={isProcessing || progressStatus === 'Cropped'}
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
                disabled={isProcessing || progressStatus === 'Cropped'}
                {...register('endTime')}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
