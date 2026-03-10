# Project Setup & Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold the Vite + React project with all dependencies, configuration, folder structure, Supabase integration, routing, state management, i18n, and theming — a fully wired foundation ready for feature development.

**Architecture:** Vite + React SPA with Tailwind CSS, React Router v6 for routing, TanStack Query for server state, Zustand for client state, Supabase for auth/DB/storage, react-i18next for translations, React Hook Form for forms, React Hot Toast for notifications. Dark/light mode with system preference detection.

**Tech Stack:** React 18+, Vite, Tailwind CSS, React Router v6, @supabase/supabase-js, @tanstack/react-query, zustand, react-hook-form, react-hot-toast, react-i18next, i18next, vitest, @testing-library/react

---

### Task 1: Scaffold Vite + React Project

**Files:**
- Create: entire project via `npm create vite@latest`

**Step 1: Create Vite project with React template**

```bash
cd D:/Projects/ivin_projekt
npm create vite@latest . -- --template react
```

If prompted about non-empty directory, confirm.

**Step 2: Install base dependencies**

```bash
npm install
```

**Step 3: Verify it runs**

```bash
npm run dev
```

Expected: Dev server starts at `http://localhost:5173`

**Step 4: Clean up boilerplate**

Remove default Vite content:
- Delete `src/App.css` contents (keep file)
- Delete `src/index.css` contents (keep file)
- Simplify `src/App.jsx` to:

```jsx
function App() {
  return (
    <div>
      <h1>Travel Platform</h1>
    </div>
  )
}

export default App
```

- Delete `src/assets/react.svg`
- Delete `public/vite.svg`

**Step 5: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: scaffold Vite + React project"
```

---

### Task 2: Install All Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install production dependencies**

```bash
npm install react-router-dom @supabase/supabase-js @tanstack/react-query zustand react-hook-form react-hot-toast react-i18next i18next i18next-browser-languagedetector
```

**Step 2: Install dev dependencies**

```bash
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Step 3: Verify no install errors**

```bash
npm ls --depth=0
```

Expected: All packages listed without errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install all project dependencies"
```

---

### Task 3: Configure Tailwind CSS

**Files:**
- Modify: `vite.config.js`
- Modify: `src/index.css`

**Step 1: Configure Vite plugin for Tailwind**

Update `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

**Step 2: Add Tailwind to CSS entry**

Replace contents of `src/index.css`:

```css
@import "tailwindcss";
```

**Step 3: Test Tailwind works**

Update `src/App.jsx` temporarily:

```jsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">Travel Platform</h1>
    </div>
  )
}

export default App
```

Run `npm run dev` and verify the styled heading appears.

**Step 4: Commit**

```bash
git add vite.config.js src/index.css src/App.jsx
git commit -m "chore: configure Tailwind CSS with Vite plugin"
```

---

### Task 4: Create Project Folder Structure

**Files:**
- Create: all directories and placeholder files

**Step 1: Create all directories**

```bash
mkdir -p src/components src/pages src/layouts src/lib src/hooks src/stores src/context src/i18n src/assets
```

**Step 2: Create placeholder files for each module**

Create `src/lib/supabase.js`:
```js
// Supabase client — configured in Task 6
```

Create `src/stores/.gitkeep` (empty)

Create `src/hooks/.gitkeep` (empty)

Create `src/context/.gitkeep` (empty)

Create `src/components/.gitkeep` (empty)

Create `src/pages/.gitkeep` (empty)

Create `src/layouts/.gitkeep` (empty)

**Step 3: Commit**

```bash
git add src/
git commit -m "chore: create project folder structure"
```

---

### Task 5: Configure Environment Variables

**Files:**
- Create: `.env.example`
- Create: `.env` (gitignored)
- Modify: `.gitignore`

**Step 1: Add `.env` to `.gitignore`**

Append to `.gitignore`:
```
.env
.env.local
.env.*.local
```

**Step 2: Create `.env.example`**

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Step 3: Create `.env` with placeholder values**

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Note: The user must fill in their actual Supabase credentials.

**Step 4: Commit**

```bash
git add .gitignore .env.example
git commit -m "chore: configure environment variables"
```

---

### Task 6: Configure Supabase Client

**Files:**
- Modify: `src/lib/supabase.js`

**Step 1: Implement Supabase client**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Step 2: Commit**

```bash
git add src/lib/supabase.js
git commit -m "feat: configure Supabase client"
```

---

### Task 7: Configure React Router with Page Shells

**Files:**
- Create: `src/pages/Home.jsx`
- Create: `src/pages/PostDetail.jsx`
- Create: `src/pages/CreatePost.jsx`
- Create: `src/pages/Profile.jsx`
- Create: `src/pages/Login.jsx`
- Create: `src/pages/Register.jsx`
- Create: `src/pages/Browse.jsx`
- Create: `src/pages/NotFound.jsx`
- Create: `src/layouts/RootLayout.jsx`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

**Step 1: Create page shell components**

Each page is a minimal placeholder, e.g. `src/pages/Home.jsx`:

```jsx
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  )
}
```

Create the same pattern for: `PostDetail.jsx`, `CreatePost.jsx`, `Profile.jsx`, `Login.jsx`, `Register.jsx`, `Browse.jsx`, `NotFound.jsx`.

**Step 2: Create RootLayout with Outlet**

`src/layouts/RootLayout.jsx`:

```jsx
import { Outlet } from 'react-router-dom'

export default function RootLayout() {
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
```

**Step 3: Configure router in App.jsx**

```jsx
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
```

**Step 4: Verify routing works**

Run `npm run dev`, navigate to `/`, `/login`, `/browse` — each should show its placeholder heading.

**Step 5: Commit**

```bash
git add src/pages/ src/layouts/ src/App.jsx
git commit -m "feat: configure React Router with page shells and root layout"
```

---

### Task 8: Configure TanStack Query

**Files:**
- Modify: `src/main.jsx`

**Step 1: Wrap app with QueryClientProvider**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**Step 2: Commit**

```bash
git add src/main.jsx
git commit -m "feat: configure TanStack Query with QueryClientProvider"
```

---

### Task 9: Configure Zustand Auth Store

**Files:**
- Create: `src/stores/authStore.js`

**Step 1: Create auth store**

```js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ user: null, session: null, loading: false }),
}))
```

**Step 2: Commit**

```bash
git add src/stores/authStore.js
git commit -m "feat: create Zustand auth store"
```

---

### Task 10: Configure Supabase Auth Listener

**Files:**
- Create: `src/context/AuthProvider.jsx`
- Modify: `src/main.jsx`

**Step 1: Create AuthProvider that syncs Supabase auth with Zustand**

```jsx
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export default function AuthProvider({ children }) {
  const { setUser, setSession, setLoading, clear } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading, clear])

  return children
}
```

**Step 2: Wrap app with AuthProvider in main.jsx**

Add `AuthProvider` wrapping `<App />` inside `QueryClientProvider`:

```jsx
import AuthProvider from './context/AuthProvider.jsx'

// Inside render:
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <App />
  </AuthProvider>
</QueryClientProvider>
```

**Step 3: Commit**

```bash
git add src/context/AuthProvider.jsx src/main.jsx
git commit -m "feat: configure Supabase auth listener with AuthProvider"
```

---

### Task 11: Configure Dark/Light Mode with Zustand

**Files:**
- Create: `src/stores/themeStore.js`
- Create: `src/hooks/useTheme.js`

**Step 1: Create theme store**

```js
import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  // 'light' | 'dark' | 'system'
  theme: localStorage.getItem('theme') || 'system',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
}))
```

**Step 2: Create useTheme hook that applies the theme**

```js
import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)

      const listener = (e) => root.classList.toggle('dark', e.matches)
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return { theme, setTheme }
}
```

**Step 3: Use the hook in RootLayout**

Add to `src/layouts/RootLayout.jsx`:

```jsx
import { useTheme } from '../hooks/useTheme'

export default function RootLayout() {
  useTheme() // Applies theme on mount

  return (
    // ... existing JSX
  )
}
```

**Step 4: Enable Tailwind dark mode**

Add to `src/index.css` (before or after the tailwind import):

```css
@custom-variant dark (&:where(.dark, .dark *));
```

**Step 5: Commit**

```bash
git add src/stores/themeStore.js src/hooks/useTheme.js src/layouts/RootLayout.jsx src/index.css
git commit -m "feat: configure dark/light mode with system preference detection"
```

---

### Task 12: Configure react-i18next

**Files:**
- Create: `src/i18n/en.json`
- Create: `src/i18n/hr.json`
- Create: `src/i18n/index.js`
- Modify: `src/main.jsx`

**Step 1: Create English translations**

`src/i18n/en.json`:

```json
{
  "common": {
    "appName": "Travel Platform",
    "home": "Home",
    "browse": "Browse",
    "create": "Create Post",
    "profile": "Profile",
    "login": "Log In",
    "register": "Register",
    "logout": "Log Out",
    "search": "Search",
    "loading": "Loading...",
    "error": "Something went wrong",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "submit": "Submit"
  },
  "post": {
    "upvote": "Upvote",
    "downvote": "Downvote",
    "comments": "Comments",
    "share": "Share",
    "edited": "edited",
    "noResults": "No posts found"
  },
  "auth": {
    "email": "Email",
    "password": "Password",
    "loginTitle": "Log In",
    "registerTitle": "Create Account",
    "googleLogin": "Continue with Google",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?"
  }
}
```

**Step 2: Create Croatian translations**

`src/i18n/hr.json`:

```json
{
  "common": {
    "appName": "Putna Platforma",
    "home": "Početna",
    "browse": "Pregledaj",
    "create": "Kreiraj objavu",
    "profile": "Profil",
    "login": "Prijava",
    "register": "Registracija",
    "logout": "Odjava",
    "search": "Pretraži",
    "loading": "Učitavanje...",
    "error": "Nešto je pošlo po krivu",
    "save": "Spremi",
    "cancel": "Odustani",
    "delete": "Obriši",
    "edit": "Uredi",
    "submit": "Pošalji"
  },
  "post": {
    "upvote": "Glasaj za",
    "downvote": "Glasaj protiv",
    "comments": "Komentari",
    "share": "Podijeli",
    "edited": "uređeno",
    "noResults": "Nema pronađenih objava"
  },
  "auth": {
    "email": "Email",
    "password": "Lozinka",
    "loginTitle": "Prijava",
    "registerTitle": "Kreiraj račun",
    "googleLogin": "Nastavi s Googleom",
    "noAccount": "Nemaš račun?",
    "hasAccount": "Već imaš račun?"
  }
}
```

**Step 3: Configure i18next**

`src/i18n/index.js`:

```js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en.json'
import hr from './hr.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hr: { translation: hr },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
```

**Step 4: Import i18n in main.jsx**

Add at the top of `src/main.jsx`:

```js
import './i18n'
```

**Step 5: Commit**

```bash
git add src/i18n/ src/main.jsx
git commit -m "feat: configure react-i18next with English and Croatian translations"
```

---

### Task 13: Configure React Hot Toast

**Files:**
- Modify: `src/main.jsx`

**Step 1: Add Toaster component**

Add inside the render, after `<App />`:

```jsx
import { Toaster } from 'react-hot-toast'

// Inside render, after <App />:
<AuthProvider>
  <App />
  <Toaster
    position="bottom-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: '#333',
        color: '#fff',
      },
    }}
  />
</AuthProvider>
```

**Step 2: Commit**

```bash
git add src/main.jsx
git commit -m "feat: configure React Hot Toast"
```

---

### Task 14: Configure Vitest

**Files:**
- Create: `vitest.config.js`
- Create: `src/tests/setup.js`
- Modify: `package.json`

**Step 1: Create Vitest config**

`vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
  },
})
```

**Step 2: Create test setup file**

`src/tests/setup.js`:

```js
import '@testing-library/jest-dom'
```

**Step 3: Add test script to package.json**

Add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 4: Write a smoke test**

Create `src/tests/smoke.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest'

describe('Smoke test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
})
```

**Step 5: Run the test**

```bash
npm run test:run
```

Expected: 1 test passes.

**Step 6: Commit**

```bash
git add vitest.config.js src/tests/ package.json
git commit -m "chore: configure Vitest with testing setup"
```

---

### Task 15: Final Verification & Cleanup

**Files:**
- Modify: various cleanup

**Step 1: Clean up .gitkeep files**

Remove any `.gitkeep` files from directories that now have real files in them.

**Step 2: Verify the full app starts**

```bash
npm run dev
```

Expected: App starts, shows "Home" page, no console errors.

**Step 3: Verify tests pass**

```bash
npm run test:run
```

Expected: All tests pass.

**Step 4: Review final main.jsx structure**

`src/main.jsx` should look like:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import AuthProvider from './context/AuthProvider.jsx'
import App from './App.jsx'
import './i18n'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: final cleanup and verification of project setup"
```

---

## Summary

After completing all 15 tasks, the project will have:

- ✅ Vite + React scaffolded and running
- ✅ Tailwind CSS configured with dark mode
- ✅ React Router v6 with all page shells
- ✅ Supabase client configured (needs credentials)
- ✅ TanStack Query provider set up
- ✅ Zustand stores (auth + theme)
- ✅ Auth listener syncing Supabase ↔ Zustand
- ✅ Dark/light mode with system preference
- ✅ react-i18next with EN + HR translations
- ✅ React Hook Form ready to use
- ✅ React Hot Toast configured
- ✅ Vitest configured with smoke test
- ✅ Full folder structure in place
- ✅ Environment variables configured
- ✅ Git initialized with clean commit history

**Next phase:** Database schema design + Supabase table setup
