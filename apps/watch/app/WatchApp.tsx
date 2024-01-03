'use client'

import Script from 'next/script'
import { DefaultSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import 'swiper/css'
import 'swiper/css/a11y'
import 'swiper/css/navigation'
import '../public/fonts/fonts.css'

export default function WatchApp({ children }): ReactElement {
  // useEffect(() => {
  //   if (
  //     process.env.NEXT_PUBLIC_GTM_ID != null &&
  //     process.env.NEXT_PUBLIC_GTM_ID !== ''
  //   )
  //     TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID })

  //   // Remove the server-side injected CSS.
  //   const jssStyles = document.querySelector('#jss-server-side')
  //   if (jssStyles != null) {
  //     jssStyles.parentElement?.removeChild(jssStyles)
  //   }
  // }, [])

  return (
    <>
      {/* <DefaultSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Watch | Jesus Film Project"
        description="Free Gospel Video Streaming Library. Watch, learn and share the gospel in over 2000 languages."
      />
      {process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID != null &&
        process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID !== '' &&
        process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN != null &&
        process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN !== '' && (
          <Script id="datadog-rum">
            {`
             (function(h,o,u,n,d) {
               h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
               d=o.createElement(u);d.async=1;d.src=n
               n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
             })(window,document,'script','https://www.datadoghq-browser-agent.com/us1/v5/datadog-rum.js','DD_RUM')
             window.DD_RUM.onReady(function() {
               window.DD_RUM.init({
                applicationId: '${
                  process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? ''
                }',
                clientToken: '${
                  process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? ''
                }',
                site: 'datadoghq.com',
                service: 'watch',
                env: '${process.env.NEXT_PUBLIC_VERCEL_ENV ?? ''}',
                version: '${
                  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
                }',
                sampleRate: 50,
                sessionReplaySampleRate: 10,
                trackInteractions: true,
                defaultPrivacyLevel: 'mask-user-input'
               });
             })
           `}
          </Script>
        )}
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}> */}
      {children}
      {/* </ThemeProvider> */}
    </>
  )
}
