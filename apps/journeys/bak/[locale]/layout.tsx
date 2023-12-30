import React from 'react'

import { getLocaleRTL } from '@core/shared/ui/rtl'

import Html from '../Html'

export default function RootLayout({ params, children }) {
  const rtl = getLocaleRTL(params.locale)
  return (
    <Html locale={params.locale} rtl={rtl}>
      {children}
    </Html>
  )
}
