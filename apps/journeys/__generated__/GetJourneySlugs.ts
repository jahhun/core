/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneySlugs
// ====================================================

export interface GetJourneySlugs_journeys_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface GetJourneySlugs_journeys {
  __typename: "Journey";
  slug: string;
  language: GetJourneySlugs_journeys_language;
}

export interface GetJourneySlugs {
  journeys: GetJourneySlugs_journeys[];
}
