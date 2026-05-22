import { Outlet } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useAuthStore } from '../stores/authStore'
import { useProfile } from '../hooks/useProfile'
import Navbar from '../components/Navbar'
import UsernameSetupModal from '../components/UsernameSetupModal'

const PLACEHOLDER_USERNAME = /^user_[0-9a-f]{16}$/

export default function RootLayout() {
  useTheme()
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile(user?.id)
  const needsUsername = profile && PLACEHOLDER_USERNAME.test(profile.username)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      {needsUsername && <UsernameSetupModal userId={user.id} />}
    </div>
  )
}
