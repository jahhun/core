import { ReactElement } from 'react'

// import {
//   GetHomeVideos,
//   GetHomeVideos_videos as Video
// } from '../__generated__/GetHomeVideos'
// import { HomePage as VideoHomePage } from '../src/components/HomePage'
// import { getApolloClient } from '../src/libs/apolloClient/apolloClient'

// import { GET_HOME_VIDEOS } from './queries'

// const videoIds = [
//   '1_jf-0-0',
//   '2_GOJ-0-0',
//   '1_jf6119-0-0',
//   '1_wl604423-0-0',
//   'MAG1',
//   '1_wl7-0-0',
//   '3_0-8DWJ-WIJ_06-0-0',
//   '2_Acts-0-0',
//   '2_GOJ4904-0-0',
//   '2_Acts7331-0-0',
//   '3_0-8DWJ-WIJ',
//   '2_ChosenWitness',
//   'GOMattCollection',
//   'GOMarkCollection',
//   'GOLukeCollection',
//   'GOJohnCollection',
//   '1_cl1309-0-0',
//   '1_jf6102-0-0',
//   '2_0-FallingPlates',
//   '2_Acts7345-0-0',
//   '1_mld-0-0',
//   '1_jf6101-0-0'
// ]

export default async function HomePage(): Promise<ReactElement> {
  // const { data } = await getApolloClient().query<GetHomeVideos>({
  //   query: GET_HOME_VIDEOS,
  //   variables: {
  //     ids: videoIds,
  //     languageId: '529'
  //   }
  // })
  // const videos: Video[] = []
  // data.videos.forEach((video) => {
  //   videos[videoIds.indexOf(video.id)] = video
  // })
  return <>a</> // <VideoHomePage videos={videos} />
}

export const dynamic = 'force-static'
