import { Image, Mic, Send } from 'lucide-react'
import { useState } from 'react'

function ChatInput({ onSend, placeholder = 'Ask anything about your conversation' }) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl items-end gap-3 rounded-2xl border border-border-soft bg-white p-3 transition-all duration-200">
      <button type="button" onClick={() => console.log('Attach placeholder')} className="rounded-lg p-2 text-text-secondary transition hover:bg-sidebar" aria-label="Attach file">
        <Image size={18} />
      </button>
      <textarea
        rows="1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        className="max-h-32 min-h-10 flex-1 resize-none py-2 text-sm outline-none placeholder:text-slate-300"
      />
      <button type="button" onClick={() => console.log('Mic placeholder')} className="rounded-lg p-2 text-text-secondary transition hover:bg-sidebar" aria-label="Record message">
        <Mic size={18} />
      </button>
      <button type="button" onClick={submit} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:scale-[1.05] hover:bg-[#25A86A]" aria-label="Send message">
        <Send size={17} />
      </button>
    </div>
  )
}

export default ChatInput
