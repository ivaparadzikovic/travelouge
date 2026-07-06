import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { RouteSuspenseFallback } from '../RouteSuspenseFallback'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const location = useLocation()

  if (loading) return <RouteSuspenseFallback />
  // Remember where the user was headed so login can send them back there.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return children
}
