'use client'

import ReactPlayer from 'react-player/lazy'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { Pause, Play } from 'lucide-react'
import { useAppContext } from '@/app/contexts'
import { useFFmpeg } from '@/app/hooks/useFFmpeg'
import { Toggle } from '@/app/components/Toggle'

export interface ProcessVideoParams {
  startTime: string
  endTime: string
  shouldAddIntro: boolean
  shouldAddLogo: boolean
  shouldCrop: boolean
}

export function VideoEditor() {
  const {
    isPlayerReady,
    isVideoPlaying,
    playerRef,
    videoDurationInSeconds: videoDurationSeconds,
    handlePlayVideo,
    handlePauseVideo,
    handlePlayPauseVideo,
  } = useAppContext()

  let videoDuration: string | null = null
  if (videoDurationSeconds) {
    videoDuration = dayjs.duration(videoDurationSeconds, 's').format('mm:ss')
  }

  const { register, handleSubmit, watch } = useForm<ProcessVideoParams>({
    defaultValues: {
      shouldAddIntro: false,
      shouldAddLogo: false,
      shouldCrop: false,
    }
  })

  const {
    isProcessing,
    edittedVideoURL,
    progressStatus,
    progressStatusText,
    progressPercentage,
    processVideo,
  } = useFFmpeg()

  const [shouldCrop, shouldAddIntro, shouldAddLogo] = watch(['shouldCrop', 'shouldAddIntro', 'shouldAddLogo'])
  const hasNoProcess = !shouldCrop && !shouldAddIntro && !shouldAddLogo

  async function handleProcessVideo(data: ProcessVideoParams) {
    const { startTime, endTime, shouldAddIntro, shouldAddLogo, shouldCrop } = data

    handlePauseVideo()

    await processVideo({
      startTime,
      endTime,
      shouldCrop,
      shouldAddIntro,
      shouldAddLogo
    })
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

      <form className="video-editor__editor" onSubmit={handleSubmit(handleProcessVideo)}>
        {videoDuration && (
          <>
            <section className="video-editor__timing-section">
              <button
                className="btn"
                onClick={handlePlayPauseVideo}
                title={isVideoPlaying ? 'Pause video' : 'Play video'}
                disabled={isProcessing}
                type="button"
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

              <div className="video-editor__timing">
                <button
                  type="submit"
                  className="btn btn--secondary"
                  title="Process the video according to the choosen settings"
                  disabled={isProcessing || hasNoProcess}
                >
                  Process
                </button>

                <Toggle
                  title="Whether to crop the video or not"
                  disabled={isProcessing}
                  {...register('shouldCrop')}
                  label="Auto Crop"
                />

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
                    disabled={isProcessing}
                    readOnly={!shouldCrop}
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
                    readOnly={!shouldCrop}
                    disabled={isProcessing}
                    {...register('endTime')}
                  />
                </div>
              </div>
            </section>

            <section className="video-editor__properties-section">
              <div className="video-editor__properties">
                <span className="video-editor__properties-label">Properties:</span>

                <div className="video-editor__property-option">
                  <input
                    id="intro"
                    type="checkbox"
                    {...register('shouldAddIntro')}
                  />
                  <label htmlFor="intro">Add Intro</label>
                </div>

                <div className="video-editor__property-option">
                  <input
                    id="logo"
                    type="checkbox"
                    {...register('shouldAddLogo')}
                  />
                  <label htmlFor="logo">Add Logo</label>
                </div>
              </div>
            </section>

            <div className="video-editor__status-wrapper">
              <p className="video-editor__status">
                Status:{' '}
                {progressStatus !== 'error' && (
                  <span>{progressStatusText} {progressStatus !== 'idle' && `(${progressPercentage}%)`}</span>
                )}

                {hasNoProcess && '- Please select at least one option to process the video'}
              </p>

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
            </div>
          </>
        )}
      </form>
    </div>
  )
}
