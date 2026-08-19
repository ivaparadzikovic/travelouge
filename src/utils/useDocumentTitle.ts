import { useEffect } from 'react'

const APP_NAME = ' Travelouge'

export function useDocumentTitle(title?: string | null): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
