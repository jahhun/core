'use client'

import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { VideoContentPage } from '../../../../src/components/VideoContentPage'
import { LanguageProvider } from '../../../../src/libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../../src/libs/videoContext'

export default function Part3ClientPage({ content, container }): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content, container }}>
          <VideoContentPage />
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}
