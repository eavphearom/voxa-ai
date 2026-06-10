import { Mic, Radio, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'

function RecordModal({ open, onClose }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!recording) return undefined
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [recording])

  if (!open) return null

  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-in-out">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Start recording</h2>
            <p className="mt-1 text-sm text-text-secondary">Capture audio and prepare an AI transcript.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-slate-100" aria-label="Close record modal">
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-text-secondary">Recording title</span>
          <input
            defaultValue="New VOXA meeting"
            className="mt-2 h-12 w-full rounded-xl border border-border-soft px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EAFBF3] px-3 py-1.5 text-xs font-semibold text-primary">
            <Radio size={14} />
            Auto-detect language
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-text-secondary">
            <ShieldCheck size={14} />
            Noise reduction enabled
          </span>
        </div>

        {recording && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-center">
            <div className="mx-auto mb-3 h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <p className="text-3xl font-semibold text-text-primary">{time}</p>
            <p className="mt-1 text-xs text-text-secondary">Recording locally in demo mode</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-border-soft px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setRecording(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A]"
          >
            <Mic size={16} />
            {recording ? 'Recording...' : 'Start Recording'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordModal
