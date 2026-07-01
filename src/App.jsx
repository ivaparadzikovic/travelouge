import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { router } from './routes'
import { useAuthLifecycle } from './api/auth'

export default function App() {
  useAuthLifecycle()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#333', color: '#fff' },
        }}
      />
    </>
  )
}
