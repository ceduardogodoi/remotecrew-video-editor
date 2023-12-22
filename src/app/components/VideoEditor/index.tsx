export function VideoEditor() {
  return (
    <div className="video-editor">
      <iframe
        id="player"
        className="video-editor__player"
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/ce5tWoPPRIQ?enablejsapi=1"
        title="How To Get Transcript From YouTube Video - Full Guide"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      <div className="video-editor__editor"></div>
    </div>
  )
}
