import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ProtectedRoute from './guards/ProtectedRoute'
import { RouteSuspenseFallback } from './RouteSuspenseFallback'
import { lazyWithRetry } from '../utils/lazyWithRetry'

const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'))
const HomePage = lazyWithRetry(() => import('../features/posts/HomePage'))
const PostDetailPage = lazyWithRetry(() => import('../features/posts/PostDetailPage'))
const CreatePostPage = lazyWithRetry(() => import('../features/posts/CreatePostPage'))
const BrowsePage = lazyWithRetry(() => import('../features/posts/BrowsePage'))
const ProfilePage = lazyWithRetry(() => import('../features/profile/ProfilePage'))
const LoginPage = lazyWithRetry(() => import('../features/auth/LoginPage'))
const RegisterPage = lazyWithRetry(() => import('../features/auth/RegisterPage'))
const ForgotPasswordPage = lazyWithRetry(() => import('../features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazyWithRetry(() => import('../features/auth/ResetPasswordPage'))

const suspended = (element: ReactNode) => (
  <Suspense fallback={<RouteSuspenseFallback />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: suspended(<HomePage />) },
      { path: 'post/:id', element: suspended(<PostDetailPage />) },
      { path: 'create', element: <ProtectedRoute>{suspended(<CreatePostPage />)}</ProtectedRoute> },
      { path: 'profile/:id', element: suspended(<ProfilePage />) },
      { path: 'login', element: suspended(<LoginPage />) },
      { path: 'register', element: suspended(<RegisterPage />) },
      { path: 'forgot-password', element: suspended(<ForgotPasswordPage />) },
      { path: 'reset-password', element: suspended(<ResetPasswordPage />) },
      { path: 'browse', element: suspended(<BrowsePage />) },
      { path: '*', element: suspended(<NotFoundPage />) },
    ],
  },
])
