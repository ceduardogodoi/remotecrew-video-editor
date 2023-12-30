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
  shouldAddIntro: boolean
  shouldAddLogo: boolean
}

export function VideoEditor() {
  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      shouldAddIntro: false,
      shouldAddLogo: true,
    }
  })

  const {
    isProcessing,
    edittedVideoURL,
    progressStatus,
    processVideo,
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

  async function handleProcessVideo(data: Inputs) {
    const { startTime, endTime, shouldAddIntro, shouldAddLogo } = data
    
    handlePauseVideo()

    await processVideo({
      startTimeStr: startTime,
      endTimeStr: endTime,
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
                {progressStatus !== 'idle' && (
                  <span>{progressStatus}</span>
                )}

                <button
                  type="submit"
                  className="btn btn--secondary"
                  title="Crop video in selected time range"
                  disabled={isProcessing}
                >
                  Crop
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
                    disabled={isProcessing}
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
                    defaultChecked={false}
                    {...register('shouldAddIntro')}
                  />
                  <label htmlFor="intro">Add Intro</label>
                </div>

                <div className="video-editor__property-option">
                  <input
                    id="logo"
                    type="checkbox"
                    defaultChecked
                    {...register('shouldAddLogo')}
                  />
                  <label htmlFor="logo">Add Logo</label>
                </div>
              </div>
            </section>
          </>
        )}
      </form>
    </div>
  )
}
