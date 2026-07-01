import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { useLogout } from '../../api/auth'
import NotificationsDropdown from '../../features/notifications/components/NotificationsDropdown'

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'text-ink font-medium border-b-2 border-accent pb-0.5'
    : 'text-muted hover:text-ink pb-0.5 border-b-2 border-transparent transition-colors'

const iconBtn =
  'flex h-8 items-center rounded-lg px-2 text-sm text-muted hover:bg-surface-2 hover:text-ink transition-colors'

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
    <nav className="sticky top-0 z-30 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="font-display text-base font-bold tracking-tight text-accent"
          >
            {t('common.appName')}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <NavLink to="/" end className={navLinkClass}>{t('common.home')}</NavLink>
            <NavLink to="/browse" className={navLinkClass}>{t('common.browse')}</NavLink>
            {user && (
              <NavLink to="/create" className={navLinkClass}>{t('common.create')}</NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={t('common.toggleTheme', { defaultValue: 'Toggle theme' })}
            className={iconBtn}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={toggleLang}
            aria-label={t('common.toggleLanguage', { defaultValue: 'Toggle language' })}
            className={`${iconBtn} font-mono`}
          >
            {i18n.language === 'en' ? 'HR' : 'EN'}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <NavLink
                to={`/profile/${user.id}`}
                aria-label={t('common.profile')}
                className={({ isActive }) =>
                  `flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold uppercase transition ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'bg-accent-soft text-accent hover:brightness-95'
                  }`
                }
              >
                {(user.user_metadata?.username || user.email || '?')[0]?.toUpperCase()}
              </NavLink>
              <button
                onClick={() => logout.mutate()}
                className="rounded-lg px-2 py-1 text-sm text-muted hover:text-down transition-colors"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                {t('common.login')}
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
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
