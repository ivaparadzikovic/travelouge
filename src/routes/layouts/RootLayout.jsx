import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { useProfile } from '../../api/profile'
import Navbar from './Navbar'
import UsernameSetupModal from '../../features/auth/components/UsernameSetupModal'

const PLACEHOLDER_USERNAME = /^user_[0-9a-f]{16}$/

export default function RootLayout() {
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile(user?.id)
  const needsUsername = profile && PLACEHOLDER_USERNAME.test(profile.username)

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      {needsUsername && <UsernameSetupModal userId={user.id} />}
    </div>
  )
}
