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

function applyLang(lng?: string) {
  if (typeof document !== 'undefined' && lng) {
    document.documentElement.lang = lng
  }
}
applyLang(i18n.resolvedLanguage ?? i18n.language)
i18n.on('languageChanged', applyLang)

export default i18n
