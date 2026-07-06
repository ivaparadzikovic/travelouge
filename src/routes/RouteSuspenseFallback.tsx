import { useTranslation } from 'react-i18next'

export function RouteSuspenseFallback() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center py-16 text-sm text-muted">
      {t('common.loading')}
    </div>
  )
}
