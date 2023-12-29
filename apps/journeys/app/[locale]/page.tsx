import { styled } from '@mui/material/styles'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { GetJourneys } from '../../__generated__/GetJourneys'
import i18nConfig from '../../next-i18next.config'
import { createApolloClient } from '../../src/libs/apolloClient'
import { notFound } from 'next/navigation'
import Index from '../Index'
import { GET_JOURNEYS } from '../queries'

export default async function JourneysPage({ params }): Promise<ReactNode> {
  const { t } = useTranslation('journeys')

  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetJourneys>({
    query: GET_JOURNEYS
  })

  if (data.journeys === null) {
    return notFound()
  }
  const props = {
    ...(await serverSideTranslations(
      params.locale ?? 'en',
      ['apps-journeys', 'libs-journeys-ui'],
      i18nConfig
    )),
    journeys: data.journeys
  }
  // revalidate: 60

  return <Index {...props} />
}

export const dynamic = 'force-dynamic'
