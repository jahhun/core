'use client'

import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { VideoWrapperPaused as VideoWrapper } from '../../../../src/components/VideoWrapperPaused'

export interface JourneyStepPageProps {
  journey: Journey
  locale: string
  rtl: boolean
  stepId: string | string[] | undefined
}

export default function JourneyStepPage({
  journey,
  locale,
  rtl,
  stepId
}: JourneyStepPageProps): ReactElement {
  const blocks: TreeBlock[] = transformer(journey.blocks ?? [])
  const currentStep: TreeBlock | undefined = blocks.find(
    (block) => block.id === stepId
  )

  return (
    <ThemeProvider
      themeName={journey.themeName}
      themeMode={journey.themeMode}
      rtl={rtl}
      locale={locale}
    >
      <Stack
        sx={{
          height: '100vh'
        }}
      >
        <BlockRenderer
          block={currentStep}
          wrappers={{
            VideoWrapper
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}
