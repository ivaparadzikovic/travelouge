import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../supabase'
import { profileKeys } from '../queryKeys'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.id) })
      toast.success('Profile updated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }) => {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${id}/avatar-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatar_url = urlData.publicUrl

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.id) })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, avatar_url }) => {
      if (avatar_url) {
        const marker = '/avatars/'
        const idx = avatar_url.indexOf(marker)
        if (idx !== -1) {
          const path = avatar_url.slice(idx + marker.length)
          await supabase.storage.from('avatars').remove([path])
        }
      }
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.id) })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
