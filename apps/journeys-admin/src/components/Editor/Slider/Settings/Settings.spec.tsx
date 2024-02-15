import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'

import { Attributes } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('Attributes', () => {
  const card: TreeBlock<CardBlock> = {
    id: 'card0.id',
    __typename: 'CardBlock',
    parentBlockId: 'step0.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: null,
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    fullscreen: true,
    children: []
  }

  const step: TreeBlock<StepBlock> = {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: [card]
  }

  it('should render card properties', async () => {
    const { getByText, queryByText } = render(
      <EditorProvider
        initialState={{ selectedStep: step, selectedBlock: card }}
      >
        <Attributes />
      </EditorProvider>
    )

    expect(queryByText('Unlocked Card')).not.toBeInTheDocument()

    await waitFor(() =>
      expect(getByText('Background Color')).toBeInTheDocument()
    )
  })

  it('should only render step properties only if no children', async () => {
    const stepOnly = { ...step, children: [] }
    const { getByText, getAllByRole } = render(
      <EditorProvider
        initialState={{ selectedStep: stepOnly, selectedBlock: stepOnly }}
      >
        <Attributes />
      </EditorProvider>
    )
    await waitFor(() => expect(getByText('Unlocked Card')).toBeInTheDocument())

    expect(getAllByRole('button')).toHaveLength(1)
  })

  it('should render step properties with card properties', () => {
    const { getByText } = render(
      <EditorProvider
        initialState={{ selectedStep: step, selectedBlock: step }}
      >
        <Attributes />
      </EditorProvider>
    )

    expect(getByText('Unlocked Card')).toBeInTheDocument()
    expect(getByText('Background Color')).toBeInTheDocument()
  })

  const video: TreeBlock = {
    __typename: 'VideoBlock',
    id: 'video0.id',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    autoplay: false,
    startAt: 10,
    endAt: null,
    muted: null,
    fullsize: null,
    action: null,
    posterBlockId: 'posterBlockId',
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'Translation',
          value: 'FallingPlates'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      }
    },
    children: []
  }

  it('should render step properties with video properties', async () => {
    const stepWithVideoOnly: TreeBlock = {
      ...step,
      children: [{ ...video, parentBlockId: 'step0.id' }]
    }
    const { getByText, queryByTestId } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: stepWithVideoOnly,
            selectedBlock: stepWithVideoOnly
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByText('Unlocked Card')).toBeInTheDocument()
    expect(queryByTestId('move-block-buttons')).not.toBeInTheDocument()
    await waitFor(() => expect(getByText('Video Source')).toBeInTheDocument())
  })

  it('should render video properties with move buttons', () => {
    const stepWithVideo: TreeBlock = {
      ...step,
      children: [{ ...card, children: [video] }]
    }
    const { getByText, getByTestId, queryByText } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: stepWithVideo,
            selectedBlock: video
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(queryByText('Unlocked Card')).not.toBeInTheDocument()
    expect(getByTestId('move-block-buttons')).toBeInTheDocument()
    expect(getByText('Video Source')).toBeInTheDocument()
  })

  it('should render typography properties with move buttons', async () => {
    const block: TreeBlock = {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      parentOrder: 0,
      align: null,
      color: null,
      content: 'Text1',
      variant: null,
      children: []
    }
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: {
              ...step,
              children: [{ ...card, children: [block] }]
            },
            selectedBlock: block
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByTestId('move-block-buttons')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Text Variant Body 2' })
      ).toBeInTheDocument()
    )
  })

  it('should render button properties with move buttons', async () => {
    const block: TreeBlock = {
      id: 'button.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'card0.id',
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

    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: {
              ...step,
              children: [{ ...card, children: [block] }]
            },
            selectedBlock: block
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByTestId('move-block-buttons')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Button Size Medium' })
      ).toBeInTheDocument()
    )
  })

  it('should only render move buttons for Radio Question block', () => {
    const block: TreeBlock = {
      __typename: 'RadioQuestionBlock',
      id: 'RadioQuestion1',
      parentBlockId: 'RadioQuestion1',
      parentOrder: 0,
      children: []
    }
    const { getByRole, getAllByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: {
              ...step,
              children: [{ ...card, children: [block] }]
            },
            selectedBlock: block
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'move-block-up' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'move-block-down' })).toBeInTheDocument()
    expect(getAllByRole('button')).toHaveLength(2)
  })

  it('should render Radio Option properties with move buttons', async () => {
    const block: TreeBlock = {
      id: 'radio-option.id',
      __typename: 'RadioOptionBlock',
      parentBlockId: 'card0.id',
      parentOrder: 0,
      label: 'Radio Option',
      action: null,
      children: []
    }
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: {
              ...step,
              children: [{ ...card, children: [block] }]
            },
            selectedBlock: block
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByTestId('move-block-buttons')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    )
  })

  it('should render Sign Up properties with move buttons', async () => {
    const block: TreeBlock = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      action: null,
      submitIconId: null,
      children: []
    }
    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: {
              ...step,
              children: [{ ...card, children: [block] }]
            },
            selectedBlock: block
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByTestId('move-block-buttons')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    )
  })

  it('should render Footer properties', async () => {
    const { queryByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: step,
            selectedComponent: 'Footer'
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(queryByTestId('move-block-buttons')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Chat Widget None' })
      ).toBeInTheDocument()
    )
  })

  it('should render FormBlock properties with move buttons', async () => {
    const block: TreeBlock = {
      __typename: 'FormBlock',
      id: 'formBlock.id',
      parentBlockId: card.id,
      parentOrder: 0,
      form: null,
      action: null,
      children: []
    }

    const { getByTestId, getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: {
              ...step,
              children: [{ ...card, children: [block] }]
            },
            selectedBlock: block
          }}
        >
          <Attributes />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByTestId('move-block-buttons')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    )
    expect(
      getByRole('button', { name: 'Credentials Incomplete' })
    ).toBeInTheDocument()
  })
})
