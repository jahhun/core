import { gql } from '@apollo/client'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

export const GET_JOURNEY_SLUGS = gql`
  query GetJourneySlugs {
    journeys {
      slug
      language {
        bcp47
      }
    }
  }
`

export const GET_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetJourney($id: ID!) {
    journey(id: $id, idType: slug) {
      ...JourneyFields
    }
  }
`

export const GET_JOURNEYS = gql`
  query GetJourneys {
    journeys(where: { featured: true, template: false }) {
      id
      title
      slug
    }
  }
`
