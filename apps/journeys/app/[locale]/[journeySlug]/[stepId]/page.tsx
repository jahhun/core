import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'

import { GetJourney } from '../../../../__generated__/GetJourney'
import { GET_JOURNEY } from '../../queries'

import JourneyStepPage from './JourneyStepPage'
import { getApolloClient } from '../../../../src/libs/apolloClient/apolloClient'

interface JourneyStepPageParams {
  journeySlug: string
  locale: string
  stepId: string | string[] | undefined
}

export default async function Page({
  params
}: {
  params: JourneyStepPageParams
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
      rtl,
      stepId: params.stepId
    }
    return <JourneyStepPage {...props} />
  } catch (e) {
    return notFound()
  }
}

export const dynamic = 'force-dynamic'
