import { supabase } from '../supabase'

const BUCKET = 'post-images'

interface PostImageSource {
  image_urls?: string[] | null
  image_url?: string | null
}

export function postImageList(post: PostImageSource | null | undefined): string[] {
  if (post?.image_urls?.length) return post.image_urls
  if (post?.image_url) return [post.image_url]
  return []
}

export async function uploadPostImages(files: FileList | File[], userId: string): Promise<string[]> {
  return Promise.all(
    Array.from(files).map(async (file) => {
      const ext = file.name.split('.').pop()!.toLowerCase()
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type })
      if (error) throw error
      return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    }),
  )
}


export async function removePostImagesByUrl(urls: string[] | null | undefined): Promise<void> {
  const paths = (urls ?? [])
    .map((u) => u.split(`/${BUCKET}/`)[1])
    .filter((p): p is string => Boolean(p))
  if (paths.length === 0) return
  await supabase.storage.from(BUCKET).remove(paths).catch(() => {})
}
