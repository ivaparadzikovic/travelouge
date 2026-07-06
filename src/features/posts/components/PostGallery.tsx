import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

interface PostGalleryProps {
  images: string[]
  alt?: string
}

// Renders a post's images. A single image shows at its natural aspect ratio
// (so tall/vertical photos aren't cropped); multiple images form a responsive
// grid of square tiles that open a full-size lightbox on click.
export default function PostGallery({ images, alt = '' }: PostGalleryProps) {
  const { t } = useTranslation()
  const [openAt, setOpenAt] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  const single = images.length === 1

  return (
    <>
      {single ? (
        <button
          type="button"
          onClick={() => setOpenAt(0)}
          className="mb-6 block w-fit max-w-full cursor-zoom-in"
        >
          <img
            src={images[0]}
            alt={alt}
            className="max-h-[70vh] w-auto max-w-full rounded-xl border border-border object-contain"
          />
        </button>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpenAt(i)}
              className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      )}

      {openAt !== null && (
        <Lightbox
          images={images}
          index={openAt}
          alt={alt}
          onClose={() => setOpenAt(null)}
          onNavigate={setOpenAt}
          t={t}
        />
      )}
    </>
  )
}

interface LightboxProps {
  images: string[]
  index: number
  alt: string
  onClose: () => void
  onNavigate: (index: number) => void
  t: TFunction
}

function Lightbox({ images, index, alt, onClose, onNavigate, t }: LightboxProps) {
  const many = images.length > 1
  const go = (delta: number) => onNavigate((index + delta + images.length) % images.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && images.length > 1) onNavigate((index + 1) % images.length)
      else if (e.key === 'ArrowLeft' && images.length > 1) onNavigate((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, images.length, onClose, onNavigate])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('post.closePhoto')}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white hover:bg-white/20"
      >
        ×
      </button>

      {many && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            go(-1)
          }}
          aria-label={t('post.prevPhoto')}
          className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
        >
          ‹
        </button>
      )}

      <img
        src={images[index]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
      />

      {many && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
            aria-label={t('post.nextPhoto')}
            className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          >
            ›
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums text-white">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  )
}
