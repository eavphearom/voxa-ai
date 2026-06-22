import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

function ImagePreviewModal({ images = [], currentIndex = 0, onClose, onNext, onPrevious }) {
  const image = images[currentIndex]
  const hasManyImages = images.length > 1

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
      if (event.key === 'ArrowLeft' && hasManyImages) {
        onPrevious()
      }
      if (event.key === 'ArrowRight' && hasManyImages) {
        onNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hasManyImages, onClose, onNext, onPrevious])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  if (!image) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close image preview"
      >
        <X size={24} />
      </button>

      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
        {currentIndex + 1} / {images.length}
      </div>

      {hasManyImages && (
        <button
          type="button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onPrevious}
          className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          aria-label="Previous image"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      <img
        src={image.previewUrl || image.url}
        alt={image.name || 'Preview'}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl animate-fade-in"
      />

      {hasManyImages && (
        <button
          type="button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={onNext}
          className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          aria-label="Next image"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>,
    document.body,
  )
}

export default ImagePreviewModal
