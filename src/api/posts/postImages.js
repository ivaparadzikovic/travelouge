import { supabase } from '../supabase'

const BUCKET = 'post-images'

// Normalizes a post row into an ordered list of image URLs, tolerating both the
// legacy single `image_url` column and the newer `image_urls` array.
export function postImageList(post) {
  if (post?.image_urls?.length) return post.image_urls
  if (post?.image_url) return [post.image_url]
  return []
}

// Uploads several files to the post-images bucket in parallel and returns their
// public URLs in the same order. Throws on the first upload failure.
export async function uploadPostImages(files, userId) {
  return Promise.all(
    Array.from(files).map(async (file) => {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type })
      if (error) throw error
      return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    }),
  )
}

// Best-effort removal of stored images given their public URLs. Failures are
// swallowed so a save/delete still succeeds even if cleanup can't complete.
export async function removePostImagesByUrl(urls) {
  const paths = (urls ?? [])
    .map((u) => u.split(`/${BUCKET}/`)[1])
    .filter(Boolean)
  if (paths.length === 0) return
  await supabase.storage.from(BUCKET).remove(paths).catch(() => {})
}
