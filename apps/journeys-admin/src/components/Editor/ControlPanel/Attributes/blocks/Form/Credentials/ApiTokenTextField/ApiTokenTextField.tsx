import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FormBlockUpdateCredentials } from '../../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { TextFieldForm } from '../../../../../../../TextFieldForm'

export const FORM_BLOCK_UPDATE = gql`
  mutation FormBlockUpdateCredentials($id: ID!, $input: FormBlockUpdateInput!) {
    formBlockUpdate(id: $id, input: $input) {
      id
      form
      projects {
        id
        name
      }
      forms {
        slug
        name
      }
      projectId
      formSlug
    }
  }
`

interface ApiTokenTextFieldProps {
  id?: string
}

export const placeHolderToken =
  'thisIsAFakeApiTokenTheReaOneIsNeverShowAgainInTheFrontEnd!!!'

export function ApiTokenTextField({
  id
}: ApiTokenTextFieldProps): ReactElement {
  const [formBlockUpdateCredentials] =
    useMutation<FormBlockUpdateCredentials>(FORM_BLOCK_UPDATE)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  async function handleSubmitApiToken(apiToken: string): Promise<void> {
    if (id == null || apiToken === placeHolderToken) return
    try {
      await formBlockUpdateCredentials({
        variables: {
          id,
          input: {
            apiToken: apiToken === '' ? null : apiToken
          }
        }
      })
      enqueueSnackbar(t('API Token updated'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (e) {
      enqueueSnackbar(e.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return (
    <TextFieldForm
      id="apiToken"
      label={t('Api Token')}
      type="password"
      initialValue={placeHolderToken}
      onSubmit={handleSubmitApiToken}
    />
  )
}
