import { Check, ChevronDown, FileAudio, UploadCloud, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { importMeeting } from '../services/authApi'

const allowedExtensions = new Set(['mp3', 'wav', 'm4a', 'mp4', 'mov'])

function ImportModal({ open, onClose, onImported }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  if (!open) return null

  const resetAndClose = () => {
    if (loading) return
    setFile(null)
    setTitle('')
    setLanguage('')
    setError('')
    setDragging(false)
    setProgress(0)
    onClose()
  }

  const selectFile = (nextFile) => {
    if (!nextFile) return

    const extension = nextFile.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.has(extension)) {
      setError('Please choose an MP3, WAV, M4A, MP4, or MOV file.')
      return
    }

    setFile(nextFile)
    setTitle((currentTitle) => currentTitle || nextFile.name.replace(/\.[^.]+$/, ''))
    setError('')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    selectFile(event.dataTransfer.files?.[0])
  }

  const startImport = async () => {
    if (!file) {
      setError('Choose a meeting audio or video file first.')
      return
    }

    setLoading(true)
    setProgress(0)
    setError('')
    try {
      const data = await importMeeting({
        file,
        title: title.trim(),
        language,
        onProgress: setProgress,
      })
      await onImported?.(data)
      setFile(null)
      setTitle('')
      setLanguage('')
      onClose()
    } catch (requestError) {
      console.error('Import meeting failed:', requestError)
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center bg-black/45 p-4 animate-fade-in">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={resetAndClose} aria-label="Close import modal overlay" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-in-out">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Import meeting</h2>
            <p className="mt-1 text-sm text-text-secondary">Upload audio or video to generate a transcript.</p>
          </div>
          <button type="button" onClick={resetAndClose} disabled={loading} className="rounded-lg p-2 transition hover:bg-slate-100 disabled:opacity-50" aria-label="Close import modal">
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            dragging ? 'border-primary bg-emerald-100' : 'border-primary/40 bg-[#EAFBF3] hover:border-primary'
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            <UploadCloud size={28} />
          </div>
          <p className="mt-4 text-base font-semibold text-text-primary">
            {file ? file.name : 'Drop your meeting file here'}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse from your computer'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {['MP3', 'WAV', 'M4A', 'MP4', 'MOV'].map((format) => (
              <span key={format} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-secondary">
                <FileAudio size={13} />
                {format}
              </span>
            ))}
          </div>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.m4a,.mp4,.mov,audio/*,video/mp4,video/quicktime"
          className="hidden"
          onChange={(event) => {
            selectFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_160px]">
          <label>
            <span className="text-xs font-semibold text-text-secondary">Meeting title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Meeting title"
              className="mt-2 h-11 w-full rounded-xl border border-border-soft px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <LanguageDropdown value={language} onChange={setLanguage} disabled={loading} />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>{progress < 100 ? 'Uploading meeting...' : 'Preparing processing...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={resetAndClose} disabled={loading} className="rounded-xl border border-border-soft px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={startImport} disabled={loading || !file} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#25A86A] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const languageOptions = [
  { label: 'Auto detect', value: '' },
  { label: 'English', value: 'en' },
  { label: 'Khmer', value: 'km' },
  { label: 'Chinese', value: 'zh' },
]

function LanguageDropdown({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const selectedOption = languageOptions.find((option) => option.value === value) || languageOptions[0]

  useEffect(() => {
    if (!open) return undefined

    const closeOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={dropdownRef} className="relative">
      <span className="text-xs font-semibold text-text-secondary">Language</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={`mt-2 flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${open ? 'border-primary ring-4 ring-primary/10' : 'border-[#E5E7EB] hover:border-primary/60'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={17} className={`text-text-secondary transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`} />
      </button>

      <div
        role="listbox"
        className={`absolute left-0 right-0 top-full z-30 mt-2 origin-top rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg transition-all duration-200 ${open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible pointer-events-none -translate-y-1 scale-[0.98] opacity-0'}`}
      >
        {languageOptions.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value || 'auto'}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${selected ? 'bg-[#EAFBF3] font-semibold text-primary' : 'text-text-primary hover:bg-slate-50'}`}
            >
              {option.label}
              {selected && <Check size={16} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ImportModal
