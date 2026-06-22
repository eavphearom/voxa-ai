import { Check, Copy, FileText } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ImagePreviewModal from './ImagePreviewModal'

function MarkdownCodeBlock({ className = '', children, ...props }) {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')
  const language = className.replace('language-', '') || 'code'

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy code failed:', error)
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-2.5">
        <span className="font-mono text-xs font-semibold uppercase tracking-wide text-slate-400">
          {language}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <code
        className={`${className} block overflow-x-auto whitespace-pre p-4 font-mono text-sm leading-7 text-slate-100`}
        {...props}
      >
        {code}
      </code>
    </div>
  )
}

const markdownComponents = {
  h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold leading-tight text-text-primary">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-bold leading-tight text-text-primary">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2.5 mt-4 text-lg font-bold leading-snug text-text-primary">{children}</h3>,
  p: ({ children }) => <p className="my-3 whitespace-pre-wrap leading-8">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-3 ml-6 list-disc space-y-2">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 ml-6 list-decimal space-y-2">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-8">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-primary underline underline-offset-4 hover:text-emerald-700"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-border-soft">
      <table className="min-w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-sidebar text-text-primary">{children}</thead>,
  th: ({ children }) => <th className="border-b border-border-soft px-4 py-3 font-bold">{children}</th>,
  td: ({ children }) => <td className="border-t border-border-soft px-4 py-3 align-top">{children}</td>,
  code: ({ inline, className, children, ...props }) => {
    const code = String(children).replace(/\n$/, '')

    if (inline) {
      return (
        <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.92em] text-text-primary" {...props}>
          {children}
        </code>
      )
    }

    return <MarkdownCodeBlock className={className} {...props}>{code}</MarkdownCodeBlock>
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary/50 pl-4 text-text-secondary">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border-soft" />,
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const text = message.message || message.text
  const attachments = message.attachments || []
  const hasAttachments = attachments.length > 0
  const imageAttachments = attachments.filter(isImageAttachment)
  const fileAttachments = attachments.filter((attachment) => !isImageAttachment(attachment))
  const [previewIndex, setPreviewIndex] = useState(null)

  const openImagePreview = (attachment) => {
    const index = imageAttachments.findIndex((image) => (image.id || image.name) === (attachment.id || attachment.name))
    setPreviewIndex(index >= 0 ? index : 0)
  }

  const closeImagePreview = () => setPreviewIndex(null)
  const showPreviousImage = () =>
    setPreviewIndex((index) => (index === null ? null : (index - 1 + imageAttachments.length) % imageAttachments.length))
  const showNextImage = () =>
    setPreviewIndex((index) => (index === null ? null : (index + 1) % imageAttachments.length))

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          isUser
            ? `max-w-[76%] bg-slate-100 px-7 py-3.5 text-base font-semibold leading-7 text-text-primary ${
                hasAttachments ? 'rounded-2xl' : 'rounded-full'
              }`
            : `max-w-3xl text-base leading-8 ${
                message.error
                  ? 'rounded-2xl border border-red-100 bg-red-50 px-5 py-3.5 text-red-600'
                  : message.pending
                    ? 'rounded-2xl bg-slate-50 px-5 py-3.5 text-text-secondary'
                    : 'text-text-primary'
              }`
        }
      >
        {hasAttachments && (
          <div className="mb-3 space-y-3">
            {imageAttachments.length > 0 && (
              <div className="flex max-w-full flex-nowrap gap-2 overflow-x-auto pb-1">
                {imageAttachments.map((attachment) => (
                  <ImageAttachmentPreview
                    key={attachment.id || attachment.name}
                    attachment={attachment}
                    onImageClick={openImagePreview}
                  />
                ))}
              </div>
            )}
            {fileAttachments.length > 0 && (
              <div className="space-y-2">
                {fileAttachments.map((attachment) => (
                  <FileAttachmentPreview key={attachment.id || attachment.name} attachment={attachment} />
                ))}
              </div>
            )}
          </div>
        )}
        {!isUser && !message.pending && !message.error && (
          <div className="markdown-body max-w-none break-words text-base leading-8 text-text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {text}
            </ReactMarkdown>
          </div>
        )}
        {(isUser || message.pending || message.error) && text}
      </div>
      {previewIndex !== null && (
        <ImagePreviewModal
          images={imageAttachments}
          currentIndex={previewIndex}
          onClose={closeImagePreview}
          onPrevious={showPreviousImage}
          onNext={showNextImage}
        />
      )}
    </div>
  )
}

function isImageAttachment(attachment) {
  const previewUrl = attachment.previewUrl || attachment.url
  const name = attachment.name || previewUrl?.split('/').pop() || 'Attachment'
  const type = String(attachment.type || '').toLowerCase()

  return Boolean(
    previewUrl &&
      (attachment.isImage ||
        type.startsWith('image/') ||
        type === 'image' ||
        /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(name || previewUrl || '')),
  )
}

function ImageAttachmentPreview({ attachment, onImageClick }) {
  const previewUrl = attachment.previewUrl || attachment.url
  const name = attachment.name || previewUrl?.split('/').pop() || 'Attachment'

  return (
    <button
      type="button"
      onClick={() => onImageClick(attachment)}
      className="group block shrink-0 cursor-pointer overflow-hidden rounded-xl"
      aria-label={`Preview ${name}`}
    >
      <img
        src={previewUrl}
        alt={name}
        className="h-auto max-h-[220px] w-auto max-w-[280px] rounded-xl object-cover transition duration-300 group-hover:scale-[1.03]"
      />
    </button>
  )
}

function FileAttachmentPreview({ attachment }) {
  const previewUrl = attachment.previewUrl || attachment.url
  const name = attachment.name || previewUrl?.split('/').pop() || 'Attachment'

  return (
    <a
      href={attachment.url || undefined}
      target={attachment.url ? '_blank' : undefined}
      rel={attachment.url ? 'noreferrer' : undefined}
      className="flex max-w-sm items-center gap-3 rounded-xl border border-border-soft bg-white/80 p-3 text-left transition hover:bg-white"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar text-text-secondary">
        <FileText size={20} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-text-primary">{name}</span>
        <span className="block text-xs font-medium text-text-secondary">Attached file</span>
      </span>
    </a>
  )
}

export default ChatMessage
