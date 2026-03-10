import { Outlet } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

export default function RootLayout() {
  useTheme() // Applies theme on mount

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navbar will go here */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      {/* Footer will go here */}
    </div>
  )
}
