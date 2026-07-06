import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { router } from './routes'
import { useAuthLifecycle } from './api/auth'

const TOAST_DURATION_MS = 4000

export default function App() {
  useAuthLifecycle()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: TOAST_DURATION_MS,
          style: {
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
          },
        }}
      />
    </>
  )
}
