import algoliasearch from 'algoliasearch'

import { PrismaClient } from '.prisma/api-videos-client'

import { Translation } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID ?? '',
  process.env.ALGOLIA_API_KEY ?? ''
)

export async function syncVideosWithAlgolia(): Promise<void> {
  console.log('syncing videos to algolia...')

  let offset = 0
  let nextPage = true

  const startTime = new Date().getTime()

  while (nextPage) {
    // const videos = await prisma.video.findMany({
    //   take: 11,
    //   skip: offset,
    //   include: { variants: { take: 5 }, title: true }
    // })

    const videoVariants = await prisma.videoVariant.findMany({
      take: 11,
      skip: offset,
      include: {
        video: { include: { title: true } },
        subtitle: true
      }
    })

    // const videoVariants = await prisma.videoVariant.findFirst({
    //   where: { videoId: '1_jf-0-0' },
    //   include: {
    //     video: { include: { title: true } },
    //     subtitle: true
    //   }
    // })
    // console.log(videoVariants)

    const transformedVideos = videoVariants.map((videoVariant) => {
      return {
        objectID: videoVariant.id,
        videoId: videoVariant.videoId,
        titles: videoVariant.video?.title[0].value,
        description: (
          videoVariant.video?.description as unknown as Translation
        )[0].value,
        duration: videoVariant.duration,
        languageId: videoVariant.languageId,
        subtitles: videoVariant.subtitle.map((subtitle) => subtitle.languageId),
        slug: videoVariant.slug,
        label: videoVariant.video?.label,
        image: videoVariant.video?.image,
        imageAlt: (videoVariant.video?.imageAlt as unknown as Translation)[0]
          .value,
        childrenCount: videoVariant.video?.childIds.length
      }
    })

    // console.log('transformedVideos:', transformedVideos)

    const duration = new Date().getTime() - startTime
    console.log('syncVideosWithAlgolia duration(s):', duration * 0.001)
    console.log('syncVideosWithAlgolia page:', offset)

    // const index = client.initIndex('video-variants')
    // await index.saveObjects(transformedVideos).wait()

    if (videoVariants.length === 11) offset += 10
    else nextPage = false
  }

  console.log('synced videos to algolia')
}
