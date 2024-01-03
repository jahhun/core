import { gql } from '@apollo/client'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { GetVideoContent } from '../../../__generated__/GetVideoContent'
import { getApolloClient } from '../../../src/libs/apolloClient/apolloClient'
import { VIDEO_CONTENT_FIELDS } from '../../../src/libs/videoContentFields'

import ClientPage from './ClientPage'

export const GET_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContent($id: ID!, $languageId: ID) {
    content: video(id: $id, idType: slug) {
      ...VideoContentFields
    }
  }
`

export default async function Part2Page({ params }): Promise<ReactElement> {
  const [contentId, contentIdExtension] = (params.part1 as string).split('.')
  const [languageId, languageIdExtension] = (params.part2 as string).split('.')

  if (contentIdExtension !== 'html' || languageIdExtension !== 'html') {
    return redirect(`/${contentId}.html/${languageId}.html`)
  }

  const { data } = await getApolloClient().query<GetVideoContent>({
    query: GET_VIDEO_CONTENT,
    variables: {
      id: `${contentId}/${languageId}`
    }
  })

  if (data.content == null) {
    return notFound()
  }

  const props = {
    content: data.content
  }
  return <ClientPage {...props} />
}

export function generateStaticParams(): Array<{
  part1: string
  part2: string
}> {
  return [
    { part1: 'jesus.html', part2: 'english.html' },
    {
      part1: 'life-of-jesus-gospel-of-john.html',
      part2: 'english.html'
    },
    {
      part1: 'jesus-calms-the-storm.html',
      part2: 'english.html'
    },
    { part1: 'magdalena.html', part2: 'english.html' },
    { part1: 'reflections-of-hope.html', part2: 'english.html' },
    {
      part1: 'day-6-jesus-died-for-me.html',
      part2: 'english.html'
    },
    { part1: 'book-of-acts.html', part2: 'english.html' },
    { part1: 'wedding-in-cana.html', part2: 'english.html' },
    { part1: 'lumo.html', part2: 'english.html' },
    {
      part1: 'peter-miraculous-escape-from-prison.html',
      part2: 'english.html'
    },
    {
      part1: '8-days-with-jesus-who-is-jesus.html',
      part2: 'english.html'
    },
    { part1: 'chosen-witness.html', part2: 'english.html' },
    {
      part1: 'lumo-the-gospel-of-luke.html',
      part2: 'english.html'
    },
    {
      part1: 'storyclubs-jesus-and-zacchaeus.html',
      part2: 'english.html'
    },
    { part1: 'birth-of-jesus.html', part2: 'english.html' },
    { part1: 'fallingplates.html', part2: 'english.html' },
    {
      part1: 'paul-and-silas-in-prison.html',
      part2: 'english.html'
    },
    { part1: 'my-last-day.html', part2: 'english.html' },
    { part1: 'the-beginning.html', part2: 'english.html' }
  ]
}
