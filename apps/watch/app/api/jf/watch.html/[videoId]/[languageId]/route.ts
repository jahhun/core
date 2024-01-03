import { gql } from '@apollo/client'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { GetVideo } from '../../../../../../__generated__/GetVideo'
import { getApolloClient } from '../../../../../../src/libs/apolloClient/apolloClient'

export const GET_VIDEO = gql`
  query GetVideo($videoId: ID!, $languageId: ID) {
    video(id: $videoId) {
      id
      variant(languageId: $languageId) {
        id
        slug
      }
    }
  }
`

export default async function GET(req: NextRequest): Promise<Response> {
  const searchParams = req.nextUrl.searchParams
  const videoId = searchParams.get('videoId')
  const languageId = searchParams.get('languageId')
  const { data } = await getApolloClient().query<GetVideo>({
    query: GET_VIDEO,
    variables: {
      videoId: (videoId as string).replace(/\.html?/, ''),
      languageId: (languageId as string).replace(/\.html?/, '')
    }
  })
  if (data.video?.variant?.slug != null) {
    const [videoId, languageId] = data.video.variant.slug.split('/')
    return redirect(`/watch/${videoId}.html/${languageId}.html`)
  } else {
    return Response.json({ error: 'video could not be found' }, { status: 404 })
  }
}
