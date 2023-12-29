import { notFound } from 'next/navigation'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactNode } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'

import { GetJourney } from '../../../__generated__/GetJourney'
import { GetJourneySlugs } from '../../../__generated__/GetJourneySlugs'
import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { GET_JOURNEY, GET_JOURNEY_SLUGS } from '../../queries'

import JourneyPage from './JourneyPage'

interface JourneyPageParams {
  journeySlug: string
  locale: string
}

export async function generateStaticParams(): Promise<
  Array<{ journeySlug: string }>
> {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetJourneySlugs>({
    query: GET_JOURNEY_SLUGS
  })
  return data.journeys.map(({ slug, language }) => ({
    journeySlug: slug,
    locale: language.bcp47 ?? 'en'
  }))
}

export default async function Page({
  params
}: {
  params: JourneyPageParams
}): Promise<ReactNode> {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: params.journeySlug
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)
    const props = {
      ...(await serverSideTranslations(
        params.locale ?? 'en',
        ['apps-journeys', 'libs-journeys-ui'],
        i18nConfig
      )),
      journey: data.journey,
      locale,
      rtl
    }
    // revalidate: 60
    return <JourneyPage {...props} />
  } catch (e) {
    return notFound()
  }
}

export const dynamic = 'force-dynamic'
