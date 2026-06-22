import { Pause, Play, RotateCcw, RotateCw, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const playbackRates = [1, 1.25, 1.5, 2, 0.75]

function AudioPlayer({
  src = '',
  fileName = '',
  recording = false,
  paused = false,
  elapsed = '0:00',
  onPause,
  onStop,
}) {
  const mediaRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [mediaError, setMediaError] = useState('')
  const isVideo = /\.(mp4|mov)(\?.*)?$/i.test(fileName || src)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    media.pause()
    media.load()
  }, [src])

  const togglePlayback = async () => {
    const media = mediaRef.current
    if (!media) return

    try {
      if (media.paused) {
        await media.play()
      } else {
        media.pause()
      }
    } catch (error) {
      console.error('Media playback failed:', error)
      setMediaError('Unable to play this media file.')
    }
  }

  const seek = (value) => {
    const media = mediaRef.current
    if (!media) return
    media.currentTime = Number(value)
    setCurrentTime(Number(value))
  }

  const skip = (seconds) => {
    const media = mediaRef.current
    if (!media) return
    seek(Math.min(Math.max(media.currentTime + seconds, 0), duration || 0))
  }

  const changePlaybackRate = () => {
    const currentIndex = playbackRates.indexOf(playbackRate)
    const nextRate = playbackRates[(currentIndex + 1) % playbackRates.length]
    const media = mediaRef.current
    if (media) {
      media.playbackRate = nextRate
    }
    setPlaybackRate(nextRate)
  }

  if (!recording && !src) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-border-soft bg-white px-5 py-4 text-center text-sm font-medium text-text-secondary">
        No media available
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border-soft bg-white p-3">
      {!recording && (
        isVideo ? (
          <video
            ref={mediaRef}
            src={src}
            preload="metadata"
            playsInline
            onLoadedMetadata={(event) => {
              setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)
              setMediaError('')
            }}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setMediaError('Unable to load this media file.')}
            className="mb-3 max-h-52 w-full rounded-xl bg-black object-contain hidden"
          />
        ) : (
          <audio
            ref={mediaRef}
            src={src}
            preload="metadata"
            onLoadedMetadata={(event) => {
              setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)
              setMediaError('')
            }}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setMediaError('Unable to load this media file.')}
            className="hidden"
          />
        )
      )}

      <div className="flex items-center gap-3 px-2 py-1">
        {recording ? (
          <>
            <button className="rounded-full border border-slate-300 p-1.5 transition hover:bg-slate-100" type="button" onClick={onPause} aria-label={paused ? 'Resume recording' : 'Pause recording'}>
              {paused ? <Play size={17} fill="currentColor" /> : <Pause size={17} />}
            </button>
            <button className="rounded-full border border-slate-300 p-1.5 text-red-500 transition hover:bg-red-50" type="button" onClick={onStop} aria-label="Stop recording">
              <Square size={16} />
            </button>
            <span className={`h-2 w-2 rounded-full ${paused ? 'bg-slate-400' : 'bg-red-500'}`} />
            <span className="w-10 text-xs font-medium text-slate-500">{elapsed}</span>
          </>
        ) : (
          <>
            <span className="w-10 text-xs text-slate-500">{formatTime(currentTime)}</span>
            <button type="button" onClick={() => skip(-10)} className="rounded-lg p-1.5 transition hover:bg-slate-100" aria-label="Back 10 seconds">
              <RotateCcw size={17} />
            </button>
            <button type="button" onClick={togglePlayback} className="rounded-full p-1.5 transition hover:bg-slate-100" aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button type="button" onClick={() => skip(10)} className="rounded-lg p-1.5 transition hover:bg-slate-100" aria-label="Forward 10 seconds">
              <RotateCw size={17} />
            </button>
            <button type="button" onClick={changePlaybackRate} className="w-9 rounded-lg py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100" aria-label="Change playback speed">
              {playbackRate}x
            </button>
          </>
        )}

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => seek(event.target.value)}
          disabled={recording || !duration}
          className="h-1 min-w-0 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed"
          aria-label="Media progress"
        />
        {!recording && <span className="w-10 text-right text-xs text-slate-500">{formatTime(duration)}</span>}
      </div>

      {mediaError && <p className="px-2 pt-2 text-xs font-medium text-red-500">{mediaError}</p>}
    </div>
  )
}

function formatTime(value) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainingSeconds}` : `${minutes}:${remainingSeconds}`
}

export default AudioPlayer
