import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Browse from './pages/Browse'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'post/:id', element: <PostDetail /> },
      { path: 'create', element: <CreatePost /> },
      { path: 'profile/:id', element: <Profile /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'browse', element: <Browse /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
