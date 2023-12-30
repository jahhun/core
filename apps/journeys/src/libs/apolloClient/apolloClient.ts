import { ApolloClient, createHttpLink } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'
import { cache } from './cache'

// export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
//   return new ApolloClient({
//     ssrMode: typeof window === 'undefined',
//     link: typeof window === 'undefined' ? httpLink : authLink.concat(httpLink),
//     cache: cache(),
//     name: 'journeys',
//     version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
//     connectToDevTools: true
//   })
// }

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL
})

export const { getClient: getApolloClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: cache(),
    link: httpLink
  })
})
