// Serves an HTML stub with Open Graph meta tags so social crawlers
// (Facebook, X, WhatsApp, Telegram, LinkedIn, Slack…) can render a
// preview for a post that lives inside a client-rendered SPA.
//
// Deploy:
//   supabase functions deploy share-post --no-verify-jwt
//   supabase secrets set APP_URL=https://your-deployed-frontend
//
// Usage: GET https://<project-ref>.supabase.co/functions/v1/share-post?id=<post_id>
// Real browsers are redirected to ${APP_URL}/post/<id>; crawlers read the og:* tags.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL = (Deno.env.get('APP_URL') ?? 'http://localhost:5173').replace(/\/+$/, '')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncate(input: string, max: number): string {
  const clean = input.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).trimEnd() + '…'
}

function notFound(message: string): Response {
  return new Response(message, {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const id = url.searchParams.get('id') ?? url.pathname.split('/').filter(Boolean).pop()

  if (!id) {
    return new Response('Missing post id', {
      status: 400,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, body, image_url, profiles(username)')
    .eq('id', id)
    .single()

  if (error || !post) return notFound('Post not found')

  const destination = `${APP_URL}/post/${post.id}`
  const title = escapeHtml(post.title ?? 'Putna Platforma')
  const description = escapeHtml(truncate(post.body ?? '', 200))
  const author = post.profiles?.username ? escapeHtml(post.profiles.username) : ''
  const image = post.image_url ? escapeHtml(post.image_url) : ''
  const safeDestination = escapeHtml(destination)

  const html = `<!doctype html>
<html lang="hr">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <link rel="canonical" href="${safeDestination}" />
    <meta name="description" content="${description}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Putna Platforma" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${safeDestination}" />
    ${image ? `<meta property="og:image" content="${image}" />` : ''}
    ${author ? `<meta property="article:author" content="${author}" />` : ''}

    <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${image ? `<meta name="twitter:image" content="${image}" />` : ''}

    <meta http-equiv="refresh" content="0; url=${safeDestination}" />
  </head>
  <body>
    <p>Otvaranje objave… <a href="${safeDestination}">${title}</a></p>
    <script>window.location.replace(${JSON.stringify(destination)});</script>
  </body>
</html>`

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  })
})
