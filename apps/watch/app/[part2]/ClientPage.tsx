'use client'

import dynamic from 'next/dynamic'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../src/libs/videoContext'

const DynamicVideoContentPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContentPage" */
      '../../../src/components/VideoContentPage'
    )
)

const DynamicVideoContainerPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContainerPage" */
      '../../../src/components/VideoContainerPage'
    )
)

export default function ClientPage({ content }): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content }}>
          {content.variant?.hls != null ? (
            <DynamicVideoContentPage />
          ) : (
            <DynamicVideoContainerPage />
          )}
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}
