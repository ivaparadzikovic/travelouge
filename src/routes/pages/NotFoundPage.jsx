import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../utils/useDocumentTitle'

export default function NotFound() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.title'))
  return (
    <div className="py-20 text-center">
      <h1 className="mb-4 font-display text-6xl font-bold tracking-tight text-ink">404</h1>
      <p className="mb-6 text-muted">{t('notFound.title')}</p>
      <Link to="/" className="text-sm text-accent hover:underline">{t('notFound.goHome')}</Link>
    </div>
  )
}
