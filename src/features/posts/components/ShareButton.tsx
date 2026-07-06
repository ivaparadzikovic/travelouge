import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

interface ShareButtonProps {
  url: string
  shareUrl?: string
  title: string
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.55l.38-2.96h-2.93V8.66c0-.86.24-1.44 1.47-1.44h1.57V4.57c-.27-.04-1.2-.12-2.29-.12-2.27 0-3.82 1.39-3.82 3.93v2.19H7.88v2.96h2.55V21h3.07Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M17.53 3H20l-6.21 7.1L21 21h-5.78l-4.52-5.91L5.5 21H3l6.65-7.6L3 3h5.9l4.08 5.4L17.53 3Zm-.88 16.2h1.42L7.43 4.7H5.92L16.65 19.2Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A10 10 0 0 0 4.07 15.83L3 21l5.32-1.04A10 10 0 1 0 20.5 3.5Zm-8.49 16.18a8.18 8.18 0 0 1-4.17-1.14l-.3-.18-3.16.62.63-3.08-.2-.32a8.18 8.18 0 1 1 7.2 4.1Zm4.7-6.13c-.26-.13-1.53-.76-1.76-.85-.24-.09-.4-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.2-.55.07-.26-.13-1.1-.4-2.1-1.3-.78-.7-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.11-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.58-1.4-.8-1.92-.21-.5-.42-.43-.58-.44h-.49a.94.94 0 0 0-.68.32c-.24.26-.9.88-.9 2.14 0 1.26.92 2.47 1.05 2.64.13.17 1.83 2.8 4.44 3.93.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.53-.62 1.74-1.23.21-.6.21-1.12.15-1.23-.06-.11-.24-.17-.5-.3Z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M9.78 15.36 9.6 18.5c.26 0 .37-.11.51-.25l1.22-1.17 2.54 1.86c.47.26.8.13.92-.43l1.67-7.86c.16-.7-.25-.97-.7-.81L5.9 13.36c-.68.27-.67.66-.12.83l2.62.82 6.08-3.83c.29-.18.56-.08.34.13" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.69 9.86 12.02m-1.86 4.99a3.75 3.75 0 0 1-5.3-5.3l3.18-3.18a3.75 3.75 0 0 1 5.3 0M10 7.99a3.75 3.75 0 0 1 5.3 5.3l-3.18 3.18a3.75 3.75 0 0 1-5.3 0" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  )
}

export default function ShareButton({ url, shareUrl, title }: ShareButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Crawler-targeted networks (FB/X/WhatsApp/Telegram) unfurl previews
  // server-side, so they must point at the OG-tagged share endpoint when
  // available. Copy-link and native share give users the direct URL.
  const unfurlUrl = shareUrl ?? url
  const encodedUrl = encodeURIComponent(unfurlUrl)
  const encodedText = encodeURIComponent(title)
  const networks = [
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <FacebookIcon />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: 'x',
      label: 'X',
      icon: <XIcon />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon />,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: <TelegramIcon />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ]

  const openIntent = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=600')
    setOpen(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('post.linkCopied'))
    } catch {
      toast.error(t('common.error'))
    }
    setOpen(false)
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url })
    } catch {
      // User cancelled or share unavailable; nothing to do.
    }
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
        {t('post.share')}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-border bg-surface py-1 shadow-xl"
        >
          {networks.map((n) => (
            <button
              key={n.key}
              type="button"
              role="menuitem"
              onClick={() => openIntent(n.href)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2 transition-colors"
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2 transition-colors"
          >
            <LinkIcon />
            <span>{t('post.copyLink')}</span>
          </button>
          {canNativeShare && (
            <button
              type="button"
              role="menuitem"
              onClick={handleNativeShare}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2 transition-colors"
            >
              <MoreIcon />
              <span>{t('post.moreOptions')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
