import { gql } from '@apollo/client'
import Stack from '@mui/material/Stack'
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

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { AcceptAllInvites } from '../__generated__/AcceptAllInvites'
import { JourneyList } from '../src/components/JourneyList'
import { PageWrapper } from '../src/components/NewPageWrapper'
import { OnboardingPanelContent } from '../src/components/OnboardingPanelContent'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { TeamSelect } from '../src/components/Team/TeamSelect'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

export const ACCEPT_ALL_INVITES = gql`
  mutation AcceptAllInvites {
    userTeamInviteAcceptAll {
      id
    }
    userInviteAcceptAll {
      id
    }
  }
`

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const { teams } = useFlags()
  const router = useRouter()

  return (
    <>
      <NextSeo title={t('Journeys')} />
      <PageWrapper
        title={!teams ? t('Journeys') : undefined}
        user={user}
        mainHeaderChildren={
          teams && (
            <Stack
              direction="row"
              flexGrow={1}
              justifyContent="space-between"
              alignItems="center"
            >
              <TeamSelect onboarding={router.query.onboarding === 'true'} />
              <TeamMenu />
            </Stack>
          )
        }
        sidePanelChildren={<OnboardingPanelContent />}
        sidePanelTitle={t('Create a New Journey')}
      >
        <JourneyList user={user} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
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
})(IndexPage)
