import type { GetServerSidePropsResult } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactNode } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'

import { GetJourney } from '../../../../__generated__/GetJourney'
import i18nConfig from '../../../../next-i18next.config'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { GET_JOURNEY } from '../page'

import JourneyStepPage from './JourneyStepPage'
import { JourneyStepPageProps } from './shared'

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
  const { props } = await getServerSideProps({ params })
  return <JourneyStepPage {...props} />
}

export const getServerSideProps = async ({
  params
}: {
  params: JourneyStepPageParams
}): Promise<GetServerSidePropsResult<JourneyStepPageProps>> => {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: params.journeySlug
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)
    return {
      props: {
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
    }
  } catch (e) {
    if (e.message === 'journey not found') {
      return {
        ...(await serverSideTranslations(
          params.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),

        notFound: true
      }
    }
    throw e
  }
}

export const dynamic = 'force-dynamic'
