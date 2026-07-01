import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return children
}
