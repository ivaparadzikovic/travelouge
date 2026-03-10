import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { Link } from 'react-router-dom'

export default function Home() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('common.home')}</h1>
        {user && (
          <Link
            to="/create"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('common.create')}
          </Link>
        )}
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-medium">
          Newest
        </button>
        <button className="pb-2 text-gray-500 hover:text-gray-700">
          Popular
        </button>
        <button className="pb-2 text-gray-500 hover:text-gray-700">
          Top Rated
        </button>
      </div>

      <p className="text-gray-500">Post feed will appear here once connected to Supabase.</p>
    </div>
  )
}
