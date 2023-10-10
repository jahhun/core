import { gql } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'

import { ACCEPT_ALL_INVITES } from '..'
import { AcceptAllInvites } from '../../__generated__/AcceptAllInvites'
import { GetAdminJourney_adminJourney as Journey } from '../../__generated__/GetAdminJourney'
import { UserJourneyOpen } from '../../__generated__/UserJourneyOpen'
import { Editor } from '../../src/components/Editor'
import { EditToolbar } from '../../src/components/Editor/EditToolbar'
import { JourneyEdit } from '../../src/components/Editor/JourneyEdit'
import { PageWrapper } from '../../src/components/PageWrapper'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { journeyAdminExists } from '../../src/libs/journeyAdminExists'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect/useInvalidJourneyRedirect'
import { useJourneyAdminQuery } from '../../src/libs/useJourneyAdminQuery'

export const USER_JOURNEY_OPEN = gql`
  mutation UserJourneyOpen($id: ID!) {
    userJourneyOpen(id: $id) {
      id
    }
  }
`

function JourneyEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
  const { data } = useJourneyAdminQuery({
    id: router.query.journeyId as string
  })
  useInvalidJourneyRedirect(data)

  return (
    <>
      <NextSeo
        title={
          data?.journey?.title != null
            ? t('Edit {{title}}', { title: data.journey.title })
            : t('Edit Journey')
        }
        description={data?.journey?.description ?? undefined}
      />
      <Editor
        journey={data?.journey ?? undefined}
        selectedStepId={router.query.stepId as string | undefined}
        view={router.query.view as ActiveJourneyEditContent | undefined}
      >
        <PageWrapper
          title={data?.journey?.title ?? t('Edit Journey')}
          showDrawer
          backHref="/"
          menu={<EditToolbar />}
          user={user}
        >
          <JourneyEdit />
        </PageWrapper>
      </Editor>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale
  })

  if (redirect != null) return { redirect }

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
  })

  let journey: Journey | null
  try {
    journey = await journeyAdminExists(apolloClient, query?.journeyId as string)
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    }
  }

  if (journey?.template === true) {
    return {
      redirect: {
        permanent: false,
        destination: `/publisher/${journey?.id}/edit`
      }
    }
  }

  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: query?.journeyId }
  })

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyEditPage)
