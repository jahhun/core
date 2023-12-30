import { NextRequest } from 'next/server'

import { GetJourney } from '../../../__generated__/GetJourney'
import { getApolloClient } from '../../../src/libs/apolloClient/apolloClient'
import { GET_JOURNEY } from '../../[locale]/queries'

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const searchParams = req.nextUrl.searchParams
    const journeySlug = searchParams.get('url')?.toString().split('/').pop()
    const { data } = await getApolloClient().query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: journeySlug
      }
    })

    const providerUrl = `https://${
      process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
    }`
    const embedUrl = `${providerUrl}/embed/${data.journey.slug}`

    const oembed = {
      // oembed required fields
      type: 'rich',
      version: '1.0',
      // oembed rich type required fields
      html: `<div style="position:relative;width:100%;overflow:hidden;padding-top:150%"><iframe id="ns-iframe" src="${embedUrl}" style="position:absolute;top:0;left:0;bottom:0;right:0;width:100%;height:100%;border:none" allow="fullscreen; autoplay"></iframe></div><script>window.addEventListener("message",e=>{if("${providerUrl}"===e.origin){let t=document.getElementById("ns-iframe");!0===e.data?(t.style.position="fixed",t.style.zIndex="999999999999999999999"):(t.style.position="absolute",t.style.zIndex="auto")}});</script>`,
      width: 375,
      height: 500,
      // oembed optional fields
      title: data.journey.seoTitle ?? undefined,
      provider_name: 'NextSteps',
      provider_url: providerUrl,
      thumbnail_url: data.journey.primaryImageBlock?.src,
      thumbnail_height: data.journey.primaryImageBlock?.height,
      thumbnail_width: data.journey.primaryImageBlock?.width
    }

    return Response.json(oembed)
  } catch (error) {
    if (error.message === 'journey not found') {
      return Response.json({ error: 'journey not found' }, { status: 404 })
    } else {
      return Response.json({ error: 'server error' }, { status: 500 })
    }
  }
}
