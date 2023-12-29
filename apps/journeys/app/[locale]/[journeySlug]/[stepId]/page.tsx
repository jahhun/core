import { notFound } from 'next/navigation'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactNode } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'

import { GetJourney } from '../../../../__generated__/GetJourney'
import i18nConfig from '../../../../next-i18next.config'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { GET_JOURNEY } from '../../../queries'

import JourneyStepPage from './JourneyStepPage'

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
      rtl,
      stepId: params.stepId
    }
    return <JourneyStepPage {...props} />
  } catch (e) {
    return notFound()
  }
}

export const dynamic = 'force-dynamic'
