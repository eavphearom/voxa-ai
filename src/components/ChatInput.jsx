import { FileText, Image, Plus, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function ChatInput({ onSend, placeholder = 'Ask anything about your conversation' }) {
  const [value, setValue] = useState('')
  const [attachOpen, setAttachOpen] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [sending, setSending] = useState(false)
  const attachmentsRef = useRef([])

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl)
        }
      })
    }
  }, [])

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setAttachments((items) => [
      ...items,
      {
        id: `${file.name}-${file.lastModified}`,
        file,
        name: file.name,
        type: file.type,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      },
    ])
    setAttachOpen(false)
  }

  const removeAttachment = (id) => {
    setAttachments((items) => {
      const target = items.find((item) => item.id === id)
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return items.filter((item) => item.id !== id)
    })
  }

  const submit = async () => {
    const trimmed = value.trim()
    if (!trimmed && attachments.length === 0) return

    setSending(true)
    try {
      await onSend({
        message: trimmed,
        attachments: attachments.map((attachment) => attachment.file),
      })
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl)
        }
      })
      setValue('')
      setAttachments([])
    } catch (error) {
      console.error('Send message failed:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border-soft bg-white p-3.5 transition-all duration-200">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group flex max-w-full items-center gap-3 rounded-xl border border-border-soft bg-sidebar p-2 pr-2.5"
            >
              {attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={attachment.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-text-secondary">
                  <FileText size={20} />
                </span>
              )}
              <span className="max-w-52 truncate text-sm font-semibold text-text-primary">
                {attachment.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="rounded-md p-1 text-text-secondary transition hover:bg-white hover:text-red-500"
                aria-label={`Remove ${attachment.name}`}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setAttachOpen((open) => !open)}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-sidebar hover:text-primary"
            aria-label="Open attachments"
            disabled={sending}
          >
            <Plus size={20} />
          </button>

          {attachOpen && (
            <div className="absolute bottom-12 left-0 z-30 w-44 rounded-2xl border border-border-soft bg-white p-2 shadow-xl animate-fade-in">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-[#EAFBF3] hover:text-primary">
                <Image size={18} />
                Choose image
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-[#EAFBF3] hover:text-primary">
                <FileText size={18} />
                Choose file
                <input type="file" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          )}
        </div>
        <textarea
          rows="1"
          value={value}
          disabled={sending}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder={placeholder}
          className="max-h-32 min-h-11 flex-1 resize-none py-2 text-base outline-none placeholder:text-slate-300 disabled:opacity-70"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || (!value.trim() && attachments.length === 0)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:scale-[1.05] hover:bg-[#25A86A] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send message"
        >
          <Send size={18} className={sending ? 'animate-pulse' : ''} />
        </button>
      </div>
    </div>
  )
}

export default ChatInput
