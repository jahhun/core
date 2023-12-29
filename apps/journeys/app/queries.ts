import { gql } from '@apollo/client'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

export const GET_JOURNEY_SLUGS = gql`
  query GetJourneySlugs {
    journeys {
      slug
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
