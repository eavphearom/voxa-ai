import { FileAudio, UploadCloud, X } from 'lucide-react'
import { createPortal } from 'react-dom'

function ImportModal({ open, onClose }) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center bg-black/45 p-4 animate-fade-in">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} aria-label="Close import modal overlay" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-in-out">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Import meeting</h2>
            <p className="mt-1 text-sm text-text-secondary">Upload audio or video to generate a transcript.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-slate-100" aria-label="Close import modal">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-[#EAFBF3] px-6 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            <UploadCloud size={28} />
          </div>
          <p className="mt-4 text-base font-semibold text-text-primary">Drop your meeting file here</p>
          <p className="mt-2 text-sm text-text-secondary">or click to browse from your computer</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {['MP3', 'WAV', 'MP4', 'M4A'].map((format) => (
              <span key={format} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-secondary">
                <FileAudio size={13} />
                {format}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-border-soft px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onClose} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A]">
            Start Import
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ImportModal
