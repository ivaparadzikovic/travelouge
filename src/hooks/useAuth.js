import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function useLogin() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async ({ identifier, password }) => {
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
      navigate('/')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async ({ email, password, username }) => {
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
