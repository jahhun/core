import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactNode } from 'react'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { getJourneyRTL } from '@core/journeys/ui/rtl'

import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { GetJourneySlugs } from '../../../__generated__/GetJourneySlugs'
import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../../../src/libs/apolloClient'

import JourneyPage from './JourneyPage'

interface JourneyPageProps {
  journey: Journey
  locale: string
  rtl: boolean
}

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!) {
    journey(id: $id, idType: slug) {
      ...JourneyFields
    }
  }
`

interface JourneyPageParams {
  journeySlug: string
  locale: string
}

export const getStaticProps: GetStaticProps<JourneyPageProps> = async ({
  params
}: {
  params: JourneyPageParams
}) => {
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
        rtl
      },
      revalidate: 60
    }
  } catch (e) {
    if (e.message === 'journey not found') {
      return {
        props: {
          ...(await serverSideTranslations(
            params.locale ?? 'en',
            ['apps-journeys', 'libs-journeys-ui'],
            i18nConfig
          ))
        },
        notFound: true
      }
    }
    throw e
  }
}

export const GET_JOURNEY_SLUGS = gql`
  query GetJourneySlugs {
    journeys {
      slug
    }
  }
`

export const getStaticPaths: GetStaticPaths = async () => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetJourneySlugs>({
    query: GET_JOURNEY_SLUGS
  })

  const paths = data.journeys.map(({ slug: journeySlug }) => ({
    params: { journeySlug }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function generateStaticParams() {
  const staticPaths = await getStaticPaths()
  return staticPaths.paths.map((x) => x.params)
}

export default async function Page({
  params
}: {
  params: JourneyPageParams
}): Promise<ReactNode> {
  const { props } = await getStaticProps({ params })
  return <JourneyPage {...props} />
}

export const dynamic = 'force-dynamic'
