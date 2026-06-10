import { Pause, Play, RotateCcw, RotateCw, Square } from 'lucide-react'

function AudioPlayer({ recording = false, paused = false, elapsed = '1:33', onPause, onStop }) {
  return (
    <div className="mx-auto flex w-full max-w-xl items-center gap-4 rounded-2xl border border-border-soft bg-white px-5 py-4">
      {recording ? (
        <>
          <button
            className="rounded-full border border-slate-300 p-1.5 transition hover:bg-slate-100"
            type="button"
            onClick={onPause}
            aria-label={paused ? 'Resume recording' : 'Pause recording'}
          >
            {paused ? <Play size={17} fill="currentColor" /> : <Pause size={17} />}
          </button>
          <button
            className="rounded-full border border-slate-300 p-1.5 text-red-500 transition hover:bg-red-50"
            type="button"
            onClick={onStop}
            aria-label="Stop recording"
          >
            <Square size={16} />
          </button>
          <span className={`h-2 w-2 rounded-full ${paused ? 'bg-slate-400' : 'bg-red-500'}`} />
        </>
      ) : (
        <>
          <span className="text-xs text-slate-300">0:00</span>
          <button type="button" aria-label="Back 5 seconds"><RotateCcw size={16} /></button>
          <button type="button" aria-label="Play"><Play size={20} fill="currentColor" /></button>
          <button type="button" aria-label="Forward 5 seconds"><RotateCw size={16} /></button>
          <span className="text-xs font-semibold text-slate-500">1x</span>
        </>
      )}
      <div className="h-1 flex-1 rounded-full bg-slate-200">
        <div className="h-full w-[74%] rounded-full bg-blue-500" />
      </div>
      <span className="text-xs text-slate-500">{elapsed}</span>
    </div>
  )
}

export default AudioPlayer
