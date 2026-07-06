import { useTranslation } from 'react-i18next'
import CountryFlag from '../../../components/CountryFlag'
import type { Country, Category } from '../../../models'

/**
 * Builds the locale-sorted country/category option lists (the shape SelectMenu
 * expects) shared by the create and browse pages, so the Intl.Collator + i18n
 * label mapping isn't duplicated across them. Returns undefined for a list
 * while its source data is still loading (callers fall back to []).
 */
export function useLocalizedOptions(
  countries: Country[] | undefined,
  categories: Category[] | undefined,
) {
  const { t, i18n } = useTranslation()
  const collator = new Intl.Collator(i18n.language)

  const localizedCountries = countries
    ?.map((c) => ({
      id: c.id,
      label: t(`countries.${c.code}`, { defaultValue: c.name }),
      icon: <CountryFlag code={c.code} />,
    }))
    .sort((a, b) => collator.compare(a.label, b.label))

  const localizedCategories = categories
    ?.map((c) => ({ id: c.id, label: t(`categories.${c.slug}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))

  return { localizedCountries, localizedCategories }
}
