import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { BlockFields as Block } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'

import { FramePortal } from '.'

const FramePortalStory = {
  ...journeysAdminConfig,
  component: FramePortal,
  title: 'Journeys-Admin/FramePortal'
}

const block: TreeBlock<Block> = {
  id: 'step0.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step1.id',
  children: [
    {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      coverBlockId: 'image0.id',
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          id: 'image0.id',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
          width: 1920,
          height: 1080,
          alt: 'random image from unsplash',
          parentBlockId: 'card0.id',
          parentOrder: 0,
          children: [],
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
        },
        {
          id: 'typographyBlockId1',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          parentOrder: 1,
          align: null,
          color: null,
          content: "What's our purpose, and how did we get here?",
          variant: TypographyVariant.h3,
          children: []
        },
        {
          id: 'typographyBlockId2',
          __typename: 'TypographyBlock',
          parentBlockId: 'card0.id',
          parentOrder: 2,
          align: null,
          color: null,
          content:
            'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
          variant: null,
          children: []
        },
        {
          __typename: 'ButtonBlock',
          id: 'button0.id',
          parentBlockId: 'card0.id',
          parentOrder: 3,
          label: 'Watch Now',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.large,
          startIconId: 'icon',
          endIconId: null,
          action: {
            __typename: 'NavigateAction',
            parentBlockId: 'button0.id',
            gtmEventName: 'gtmEventName'
          },
          children: [
            {
              id: 'icon',
              __typename: 'IconBlock',
              parentBlockId: 'button',
              parentOrder: 0,
              iconName: IconName.PlayArrowRounded,
              iconColor: null,
              iconSize: IconSize.md,
              children: []
            }
          ]
        }
      ]
    }
  ]
}

const Template: Story = () => (
  <MockedProvider>
    <JourneyProvider
      value={{
        journey: {
          id: 'journeyId',
          themeMode: ThemeMode.light,
          themeName: ThemeName.base,
          language: {
            __typename: 'Language',
            id: '529',
            bcp47: 'en',
            iso3: 'eng'
          }
        } as unknown as Journey,
        admin: true
      }}
    >
      <FramePortal width={356} height={536} dir="ltr">
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <BlockRenderer block={block} />
        </ThemeProvider>
      </FramePortal>
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default FramePortalStory as Meta
