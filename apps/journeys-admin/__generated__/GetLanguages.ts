/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguages
// ====================================================

export interface GetLanguages_languages_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetLanguages_languages {
  __typename: "Language";
  id: string;
  name: (GetLanguages_languages_name | null)[];
}

export interface GetLanguages {
  languages: GetLanguages_languages[];
}

export interface GetLanguagesVariables {
  languageId?: string | null;
}
