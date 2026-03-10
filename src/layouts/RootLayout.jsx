import { Outlet } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import Navbar from '../components/Navbar'

export default function RootLayout() {
  useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
