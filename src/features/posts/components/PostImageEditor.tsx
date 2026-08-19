import { useTranslation } from 'react-i18next'
import ImagePicker from './ImagePicker'
import type { PostEditorState } from '../hooks/usePostEditor'

type PostImageEditorProps = Pick<
  PostEditorState,
  'existingImages' | 'newFiles' | 'newPreviews' | 'addFiles' | 'removeExisting' | 'removeNewFile'
>

export default function PostImageEditor({
  existingImages,
  newFiles,
  newPreviews,
  addFiles,
  removeExisting,
  removeNewFile,
}: PostImageEditorProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-ink">{t('post.photosLabel')}</div>
      <ImagePicker
        images={[
          ...existingImages.map((url) => ({
            key: url,
            src: url,
            onRemove: () => removeExisting(url),
          })),
          ...newFiles.map((file, i) => ({
            key: `new-${i}-${file.name}`,
            src: newPreviews[i],
            onRemove: () => removeNewFile(i),
          })),
        ]}
        onAdd={addFiles}
      />
    </div>
  )
}
