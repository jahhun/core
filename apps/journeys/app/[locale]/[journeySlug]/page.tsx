import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'

import { GetJourney } from '../../../__generated__/GetJourney'
import { GetJourneySlugs } from '../../../__generated__/GetJourneySlugs'
import { GET_JOURNEY, GET_JOURNEY_SLUGS } from '../queries'

import JourneyPage from './JourneyPage'
import { getApolloClient } from '../../../src/libs/apolloClient/apolloClient'

interface JourneyPageParams {
  journeySlug: string
  locale: string
}

export async function generateStaticParams(): Promise<
  Array<{ journeySlug: string }>
> {
  const { data } = await getApolloClient().query<GetJourneySlugs>({
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
  try {
    const { data } = await getApolloClient().query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: params.journeySlug
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)
    const props = {
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
