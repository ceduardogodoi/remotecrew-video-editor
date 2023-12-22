export function VideoEditor() {
  return (
    <div className="video-editor">
      <iframe
        className="video-editor__player"
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/ce5tWoPPRIQ"
        title="How To Get Transcript From YouTube Video - Full Guide"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />

      <div className="video-editor__editor"></div>
    </div>
  )
}
