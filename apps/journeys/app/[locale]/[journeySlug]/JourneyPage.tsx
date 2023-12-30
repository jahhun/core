'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { Conductor } from '../../../src/components/Conductor'

export interface JourneyPageProps {
  journey: Journey
  locale: string
  rtl: boolean
}

export default function JourneyPage({
  journey,
  locale,
  rtl
}: JourneyPageProps): ReactElement {
  const router = useRouter()
  const isIframe = typeof window !== 'undefined' && window.self !== window.top
  if (isIframe) {
    void router.push(`/embed/[journeySlug]/embed/${journey.slug}`)
  }

  return (
    <>
      <head>
        <link
          rel="alternate"
          type="application/json+oembed"
          href={`https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/api/oembed?url=https%3A%2F%2F${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }%2F${journey.slug}&format=json`}
          title={journey.seoTitle ?? undefined}
        />
      </head>
      {/* <NextSeo
          nofollow
          noindex
          title={journey.seoTitle ?? undefined}
          description={journey.seoDescription ?? undefined}
          openGraph={{
            type: 'website',
            title: journey.seoTitle ?? undefined,
            url: `https://${
              process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
            }/${journey.slug}`,
            description: journey.seoDescription ?? undefined,
            images:
              journey.primaryImageBlock?.src != null
                ? [
                    {
                      url: journey.primaryImageBlock.src,
                      width: journey.primaryImageBlock.width,
                      height: journey.primaryImageBlock.height,
                      alt: journey.primaryImageBlock.alt,
                      type: 'image/jpeg'
                    }
                  ]
                : []
          }}
          facebook={
            process.env.NEXT_PUBLIC_FACEBOOK_APP_ID != null
              ? {
                  appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
                }
              : undefined
          }
          twitter={{
            site: '@YourNextStepIs',
            cardType: 'summary_large_image'
          }}
        /> */}
      <JourneyProvider value={{ journey }}>
        <ThemeProvider
          themeName={journey.themeName}
          themeMode={journey.themeMode}
          rtl={rtl}
          locale={locale}
        >
          {journey.blocks != null && (
            <Conductor blocks={transformer(journey.blocks)} />
          )}
        </ThemeProvider>
      </JourneyProvider>
    </>
  )
}
