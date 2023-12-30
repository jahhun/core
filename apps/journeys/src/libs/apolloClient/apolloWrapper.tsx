'use client'

import { createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloNextAppProvider,
  NextSSRApolloClient
} from '@apollo/experimental-nextjs-app-support/ssr'
import { UserCredential, getAuth, signInAnonymously } from 'firebase/auth'

import { cache } from './cache'
import { firebaseClient } from '../firebaseClient'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL
})

let signInPromise: Promise<UserCredential>

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth(firebaseClient)
  if (signInPromise == null) signInPromise = signInAnonymously(auth)
  const userCredential = await signInPromise

  const token = await userCredential.user.getIdToken()

  return {
    headers: {
      ...headers,
      Authorization: token ?? ''
    }
  }
})

// have a function to create a client for you
function makeClient() {
  return new NextSSRApolloClient({
    cache: cache(),
    link: typeof window === 'undefined' ? httpLink : authLink.concat(httpLink),
    name: 'journeys',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true
  })
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
