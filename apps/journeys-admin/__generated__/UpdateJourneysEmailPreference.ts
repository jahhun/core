/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneysEmailPreferenceUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateJourneysEmailPreference
// ====================================================

export interface UpdateJourneysEmailPreference_updateJourneysEmailPreference {
  __typename: "JourneysEmailPreference";
  email: string;
  unsubscribeAll: boolean;
  teamInvite: boolean;
  teamRemoved: boolean;
  teamInviteAccepted: boolean;
  journeyEditInvite: boolean;
  journeyRequestApproved: boolean;
  journeyAccessRequest: boolean;
}

export interface UpdateJourneysEmailPreference {
  updateJourneysEmailPreference: UpdateJourneysEmailPreference_updateJourneysEmailPreference | null;
}

export interface UpdateJourneysEmailPreferenceVariables {
  input: JourneysEmailPreferenceUpdateInput;
}
