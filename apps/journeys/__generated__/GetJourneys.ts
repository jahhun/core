/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneys
// ====================================================

export interface GetJourneys_journeys {
  __typename: "Journey";
  id: string;
  title: string;
  slug: string;
}

export interface GetJourneys {
  journeys: GetJourneys_journeys[];
}

export interface GetJourneysVariables {
  featured?: boolean | null;
  hostname?: string | null;
}
