import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../utils/useDocumentTitle'

export default function NotFound() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.title'))
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-500 mb-6">{t('notFound.title')}</p>
      <Link to="/" className="text-teal-600 hover:underline">{t('notFound.goHome')}</Link>
    </div>
  )
}
