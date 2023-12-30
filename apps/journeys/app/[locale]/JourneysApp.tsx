'use client'

import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Head from 'next/head'
import Script from 'next/script'
import { SnackbarProvider } from 'notistack'
import { ReactNode, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'

import { firebaseClient } from '../../src/libs/firebaseClient'

import 'swiper/css'
import 'swiper/css/pagination'

export default function JourneysApp({ children }): ReactNode {
  const { t } = useTranslation('apps-journeys')
  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_GTM_ID != null &&
      process.env.NEXT_PUBLIC_GTM_ID !== ''
    )
      TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID })

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles != null) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
    const auth = getAuth(firebaseClient)
    return onAuthStateChanged(auth, (user) => {
      if (user != null) {
        TagManager.dataLayer({ dataLayer: { userId: user.uid } })
      } else {
        TagManager.dataLayer({ dataLayer: { userId: undefined } })
      }
    })
  }, [])

  return (
    <>
      {/* <DefaultSeo
        titleTemplate={t('%s | Next Steps')}
        defaultTitle={t('Next Steps')}
      /> */}
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, viewport-fit=cover"
        />
      </Head>
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
                service: 'journeys',
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
      <SnackbarProvider
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        {children}
      </SnackbarProvider>
    </>
  )
}
