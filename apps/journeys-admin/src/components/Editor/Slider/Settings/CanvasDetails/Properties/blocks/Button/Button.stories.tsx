import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { Drawer } from '../../../../Drawer'

import { Button } from '.'

const Demo: Meta<typeof Button> = {
  ...simpleComponentConfig,
  component: Button,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Button'
}

const block: TreeBlock<ButtonBlock> = {
  id: 'button.id',
  __typename: 'ButtonBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  label: 'Button',
  buttonVariant: null,
  buttonColor: null,
  size: null,
  startIconId: null,
  endIconId: null,
  action: null,
  children: []
}

const Template: StoryObj<ComponentProps<typeof Button>> = {
  render: (args) => {
    return (
      <EditorProvider>
        <Drawer title="Button">
          <Button {...args} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...block
  }
}

export const Filled: StoryObj<typeof Button> = {
  render: () => {
    const block: TreeBlock<ButtonBlock> = {
      id: 'button1.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Button',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.secondary,
      size: ButtonSize.large,
      startIconId: 'icon1',
      endIconId: 'icon2',
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'button1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: [
        {
          id: 'icon1',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 0,
          iconName: IconName.ChatBubbleOutlineRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        },
        {
          id: 'icon2',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 1,
          iconName: IconName.ChevronRightRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        }
      ]
    }
    return (
      <EditorProvider initialState={{ selectedBlock: block }}>
        <Drawer title="Button">
          <Button {...block} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export default Demo
