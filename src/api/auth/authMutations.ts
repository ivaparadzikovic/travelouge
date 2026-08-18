import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../supabase'

interface LoginVariables {
  identifier?: string
  password: string
}

interface RegisterVariables {
  email: string
  password: string
  username: string
}

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  return useMutation({
    mutationFn: async ({ identifier, password }: LoginVariables) => {
      const trimmed = (identifier ?? '').trim()
      let email = trimmed
      if (!trimmed.includes('@')) {
        const { data: resolved, error: lookupError } = await supabase.rpc(
          'email_for_username',
          { p_username: trimmed },
        )
        if (lookupError) throw lookupError
        if (!resolved) throw new Error('Invalid login credentials')
        email = resolved
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Logged in successfully')
      const from = location.state?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    },
  })
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email?: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail((email ?? '').trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async ({ email, password, username }: RegisterVariables) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: username },
        },
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data.session) {
        toast.success('Welcome!')
        navigate('/')
      } else {
        toast.success('Account created! Check your email to verify.')
        navigate('/login')
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
      return data
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logged out')
      navigate('/')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
