import { useTranslation } from 'react-i18next'
import CountryFlag from '../../../components/CountryFlag'
import type { Country, Category } from '../../../models'


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
