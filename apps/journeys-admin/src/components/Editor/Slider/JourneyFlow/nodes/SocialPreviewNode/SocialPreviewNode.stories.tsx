import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreate'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation'

import { SocialPreviewNode } from './SocialPreviewNode'

const SocialPreviewNodeStory = {
  ...simpleComponentConfig,
  component: SocialPreviewNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/SocialPreviewNode'
}

const stepAndCardBlockCreateMock: MockedResponse<
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
> = {
  request: {
    query: STEP_AND_CARD_BLOCK_CREATE,
    variables: {
      stepBlockCreateInput: {
        id: 'stepId',
        journeyId: 'journeyId'
      },
      cardBlockCreateInput: {
        id: 'cardId',
        journeyId: 'journeyId',
        parentBlockId: 'stepId',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      }
    }
  },
  result: {
    data: {
      stepBlockCreate: {
        id: 'stepId',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        __typename: 'StepBlock',
        x: null,
        y: null
      },
      cardBlockCreate: {
        id: 'cardId',
        parentBlockId: 'stepId',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        __typename: 'CardBlock'
      }
    }
  }
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: null,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1649866725673-16dc15de5c29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1009&q=80',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  title: 'my journey',
  strategySlug: null,
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: image,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: 'Test Title Social Preview',
  seoDescription: 'Test Description Social Preview',
  chatButtons: [],
  host: null,
  team: null,
  tags: []
}

const blankSeoJourney: Journey = {
  ...defaultJourney,
  seoTitle: null,
  seoDescription: null,
  primaryImageBlock: null
}

const Template: StoryObj<typeof SocialPreviewNode> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={[stepAndCardBlockCreateMock]}>
      <SnackbarProvider>
        <JourneyProvider value={{ journey: args.journey }}>
          <SocialPreviewNode />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: blankSeoJourney
  }
}

export const Filled = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export default SocialPreviewNodeStory
