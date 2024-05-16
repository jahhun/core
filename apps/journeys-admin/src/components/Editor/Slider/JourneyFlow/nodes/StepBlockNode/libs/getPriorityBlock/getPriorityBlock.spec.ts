import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { getPriorityBlock } from '.'

const card: TreeBlock<CardBlock> = {
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: []
}

const button: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  parentOrder: 0,
  label: 'This is a button',
  buttonVariant: null,
  buttonColor: null,
  size: null,
  startIconId: null,
  endIconId: null,
  action: null,
  children: []
}

const image: TreeBlock<ImageBlock> = {
  __typename: 'ImageBlock',
  id: 'image0.id',
  src: 'https://url.com',
  width: 1600,
  height: 1067,
  alt: 'random image from unsplash',
  parentBlockId: 'Image1',
  parentOrder: 0,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
  children: []
}

const radioQuestion: TreeBlock<RadioQuestionBlock> = {
  __typename: 'RadioQuestionBlock',
  id: 'RadioQuestion1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  children: []
}

const signUp: TreeBlock<SignUpBlock> = {
  __typename: 'SignUpBlock',
  id: 'signUp0.id',
  parentBlockId: '0',
  parentOrder: 0,
  submitIconId: null,
  submitLabel: null,
  action: null,
  children: []
}

const textResponse: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  hint: null,
  minRows: null,
  submitIconId: null,
  submitLabel: null,
  action: null,
  children: []
}

const typography: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'heading3',
  parentBlockId: 'question',
  parentOrder: 0,
  content: 'Hello World!',
  variant: null,
  color: null,
  align: null,
  children: []
}

const video: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'video0.id',
  parentBlockId: '',
  parentOrder: 0,
  autoplay: false,
  startAt: 10,
  endAt: null,
  muted: null,
  posterBlockId: 'posterBlockId',
  fullsize: null,
  action: null,
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
    },
    variantLanguages: []
  },
  children: []
}

describe('getPriorityBlock', () => {
  it('should return video block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: [textResponse, button, radioQuestion, typography, image, video]
    })
    expect(priorityBlock).toEqual(video)
  })

  it('should return text response block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: [textResponse, button, radioQuestion, typography, image, signUp]
    })
    expect(priorityBlock).toEqual(textResponse)
  })

  it('should return button block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: [radioQuestion, typography, image, signUp, button]
    })
    expect(priorityBlock).toEqual(button)
  })

  it('should return radio question block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: [typography, image, signUp, radioQuestion]
    })
    expect(priorityBlock).toEqual(radioQuestion)
  })

  it('should return typography block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: [typography, image, signUp]
    })
    expect(priorityBlock).toEqual(typography)
  })

  it('should return any other block block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: [image, signUp]
    })
    expect(priorityBlock).toEqual(image)
  })
})
