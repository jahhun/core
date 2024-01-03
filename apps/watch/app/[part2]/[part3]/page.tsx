import { gql } from '@apollo/client'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { GetVideoContainerAndVideoContent } from '../../../../__generated__/GetVideoContainerAndVideoContent'
import { getApolloClient } from '../../../../src/libs/apolloClient/apolloClient'
import { VIDEO_CONTENT_FIELDS } from '../../../../src/libs/videoContentFields'

import ClientPage from './ClientPage'

export const GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContainerAndVideoContent(
    $containerId: ID!
    $contentId: ID!
    $languageId: ID
  ) {
    container: video(id: $containerId, idType: slug) {
      ...VideoContentFields
    }
    content: video(id: $contentId, idType: slug) {
      ...VideoContentFields
    }
  }
`

export default async function Part3Page({ params }): Promise<ReactElement> {
  const [containerId, containerIdExtension] = (params.part1 as string).split(
    '.'
  )
  const [contentId, contentIdExtension] = (params.part2 as string).split('.')
  const [languageId, languageIdExtension] = (params.part3 as string).split('.')

  if (
    containerIdExtension !== 'html' ||
    contentIdExtension !== undefined ||
    languageIdExtension !== 'html'
  ) {
    return redirect(`/${containerId}.html/${contentId}/${languageId}.html`)
  }

  const { data } =
    await getApolloClient().query<GetVideoContainerAndVideoContent>({
      query: GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT,
      variables: {
        containerId: `${containerId}/${languageId}`,
        contentId: `${contentId}/${languageId}`
      }
    })
  if (data.container == null || data.content == null) {
    return notFound()
  }

  const props = {
    container: data.container,
    content: data.content
  }

  return <ClientPage {...props} />
}
