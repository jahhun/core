import { offsetLimitPagination } from '@apollo/client/utilities'
import { NextSSRInMemoryCache } from '@apollo/experimental-nextjs-app-support/ssr'

export const cache = (): NextSSRInMemoryCache =>
  new NextSSRInMemoryCache({
    /* https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually
   * The client needs to understand the polymorphic relationship between the
     interfaces and the types that implement it. To inform the client about
     these relationships, we need to pass a possibleTypes option when
     initializing InMemoryCache.
   */
    possibleTypes: {},
    typePolicies: {
      Query: {
        fields: {
          videos: {
            ...offsetLimitPagination(),
            keyArgs: [
              'where',
              ['labels', 'availableVariantLanguageIds', 'title']
            ]
          }
        }
      }
    }
  })
