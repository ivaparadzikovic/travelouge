import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { useLogout } from '../../api/auth'
import NotificationsDropdown from '../../features/notifications/components/NotificationsDropdown'

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'text-teal-600 dark:text-teal-400 font-medium border-b-2 border-teal-600 dark:border-teal-400 pb-0.5'
    : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 pb-0.5 border-b-2 border-transparent'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const logout = useLogout()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hr' : 'en')
  }

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-teal-600 dark:text-teal-400">
            {t('common.appName')}
          </Link>
          <div className="flex items-center gap-4">
            <NavLink to="/" end className={navLinkClass}>{t('common.home')}</NavLink>
            <NavLink to="/browse" className={navLinkClass}>{t('common.browse')}</NavLink>
            {user && (
              <NavLink to="/create" className={navLinkClass}>{t('common.create')}</NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={t('common.toggleTheme', { defaultValue: 'Toggle theme' })}
            className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={toggleLang}
            aria-label={t('common.toggleLanguage', { defaultValue: 'Toggle language' })}
            className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {i18n.language === 'en' ? 'HR' : 'EN'}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <NotificationsDropdown />
              <NavLink to={`/profile/${user.id}`} className={navLinkClass}>
                {t('common.profile')}
              </NavLink>
              <button
                onClick={() => logout.mutate()}
                className="text-red-500 hover:text-red-700"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm text-teal-600 hover:text-teal-800"
              >
                {t('common.login')}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
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
