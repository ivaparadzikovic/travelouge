import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGES } from '../constants'

export interface ImagePickerImage {
  key: string
  src: string
  onRemove: () => void
}

interface ImagePickerProps {
  images: ImagePickerImage[]
  onAdd: (files: FileList) => void
  max?: number
}

export default function ImagePicker({ images, onAdd, max = MAX_IMAGES }: ImagePickerProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const canAdd = images.length < max

  return (
    <div>
      <input
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        ref={inputRef}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) onAdd(e.target.files)
          e.target.value = ''
        }}
        className="sr-only"
      />

      {images.length > 0 && (
        <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.key} className="relative aspect-square">
              <img
                src={img.src}
                alt=""
                className="h-full w-full rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={img.onRemove}
                aria-label={t('post.removeImage')}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-lg leading-none text-white hover:bg-black/80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {canAdd ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center rounded-xl border-[1.5px] border-dashed border-accent bg-surface-2 px-6 py-5 text-center transition-colors hover:border-accent dark:border-border"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-1 text-accent"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-sm text-ink">
            {images.length > 0 ? t('post.addMorePhotos') : t('post.dropzoneHint')}
          </span>
          <span className="mt-0.5 text-xs text-muted">
            {images.length} / {max}
          </span>
        </button>
      ) : (
        <p className="text-xs text-muted">{t('post.imageLimitReached', { count: max })}</p>
      )}
    </div>
  )
}
