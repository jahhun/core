import { ReactNode } from 'react'

import { GetJourneys } from '../../__generated__/GetJourneys'
import { notFound } from 'next/navigation'
import Index from './Index'
import { GET_JOURNEYS } from './queries'
import { getApolloClient } from '../../src/libs/apolloClient/apolloClient'

export default async function JourneysPage(): Promise<ReactNode> {
  const { data } = await getApolloClient().query<GetJourneys>({ query: GET_JOURNEYS })

  if (data.journeys === null) {
    return notFound()
  }

  const props = {
    journeys: data.journeys
  }
  // revalidate: 60

  return <Index {...props} />
}

export const dynamic = 'force-dynamic'
