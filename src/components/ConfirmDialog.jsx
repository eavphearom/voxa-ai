import { AlertTriangle } from 'lucide-react'
import { createPortal } from 'react-dom'

function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onCancel, onConfirm }) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center bg-black/45 p-4 animate-fade-in">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={onCancel} aria-label="Close confirmation" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-red-600">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmDialog
