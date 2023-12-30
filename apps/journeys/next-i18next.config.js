let localePath
if (typeof window !== 'undefined') {
  // browser
  localePath = './public/locales'
} else if (process.env.VERCEL == null || process.env.CI != null) {
  // not vercel or vercel build time
  localePath = '../../libs/locales'
} else {
  // vercel run time
  localePath = './public/locales'
}

const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  localePath
}

module.exports = i18nConfig
