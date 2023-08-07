import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { steps } from '../data'

import { NavigateToBlockAction } from '.'

const NavigateToBlockActionStory = {
  ...simpleComponentConfig,
  component: NavigateToBlockAction,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Action/ActionStates'
}

const journeyTheme = {
  id: 'journeyId',
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng'
  }
} as unknown as Journey

export const NavigateToBlock: Story = () => {
  const selectedBlock = steps[4].children[0].children[4]

  return (
    <Stack spacing={10}>
      <Box>
        <Typography>Default</Typography>
        <MockedProvider>
          <JourneyProvider value={{ journey: journeyTheme, admin: true }}>
            <EditorProvider initialState={{ steps }}>
              <NavigateToBlockAction />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </Box>

      <Box>
        <Typography>Selected card</Typography>
        <MockedProvider>
          <JourneyProvider value={{ journey: journeyTheme, admin: true }}>
            <EditorProvider initialState={{ selectedBlock, steps }}>
              <NavigateToBlockAction />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </Box>
    </Stack>
  )
}

export default NavigateToBlockActionStory as Meta
