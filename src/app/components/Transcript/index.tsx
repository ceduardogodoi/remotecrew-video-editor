import { Avatar } from '@/app/components/Avatar';

export function Transcript() {
  return (
    <div className="transcript-sentence">
      <header className="transcript-sentence__header">
        <Avatar />

        <span className="transcript-sentence__name">
          Carlos Eduardo
        </span>

        <time className="transcript-sentence__time">
          00:01
        </time>
      </header>

      <div className="transcript-sentence__text-container">
        <p className="transcript-sentence__text">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          Dolores magni labore assumenda aliquid quaerat modi rem hic quis natus doloribus.
        </p>
      </div>
    </div>
  )
}
