import { createInstance, i18n } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import i18nConfig from '../../../next-i18next.config'

export async function initTranslations(
  locale: string,
  namespaces: string[],
  i18nInstance: i18n | undefined = undefined,
  resources = undefined
) {
  i18nInstance = i18nInstance || createInstance()

  i18nInstance.use(initReactI18next)

  if (!resources) {
    i18nInstance.use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`${i18nConfig.localePath}/${language}/${namespace}.json`)
      )
    )
  }

  await i18nInstance.init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.i18n.defaultLocale,
    supportedLngs: i18nConfig.i18n.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: i18nConfig.i18n.locales
  })

  return {
    i18n: i18nInstance,
    resources: i18nInstance.services.resourceStore.data,
    t: i18nInstance.t
  }
}
