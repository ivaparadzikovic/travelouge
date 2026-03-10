import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '../hooks/useTheme'
import { useLogout } from '../hooks/useAuth'
import { useUnreadCount } from '../hooks/useNotifications'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { theme, setTheme } = useTheme()
  const logout = useLogout()
  const { data: unreadCount } = useUnreadCount()

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setTheme(next)
  }

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hr' : 'en')
  }

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {t('common.appName')}
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              {t('common.home')}
            </Link>
            <Link to="/browse" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              {t('common.browse')}
            </Link>
            {user && (
              <Link to="/create" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
                {t('common.create')}
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : '💻'}
          </button>

          <button
            onClick={toggleLang}
            className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {i18n.language === 'en' ? 'HR' : 'EN'}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              <Link
                to={`/profile/${user.id}`}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
              >
                {t('common.profile')}
              </Link>
              <button
                onClick={() => logout.mutate()}
                className="text-sm text-red-500 hover:text-red-700"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
              >
                {t('common.login')}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('common.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
