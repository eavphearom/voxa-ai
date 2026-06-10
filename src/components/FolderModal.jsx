import { FolderPlus, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

function FolderModal({
  open,
  mode = 'create',
  initialName = '',
  title,
  description = 'Organize your VOXA meeting history.',
  fieldLabel = 'Folder name',
  submitLabel,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState(initialName)

  if (!open) return null

  const modalTitle = title || (mode === 'rename' ? 'Rename folder' : 'Create new folder')
  const buttonText = submitLabel || (mode === 'rename' ? 'Save Name' : 'Create Folder')

  const submit = (event) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center bg-black/45 p-4 animate-fade-in">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} aria-label="Close folder modal" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAFBF3] text-primary">
              <FolderPlus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{modalTitle}</h2>
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-slate-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-text-secondary">{fieldLabel}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            placeholder="Example: Subject AI"
            className="mt-2 h-12 w-full rounded-xl border border-border-soft px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-border-soft px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A]">
            {buttonText}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}

export default FolderModal
