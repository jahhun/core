import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../test/mockReactFlow'
import '../../../../../test/i18n'

import { JourneyFlow } from './JourneyFlow'

jest.mock('@core/journeys/ui/EditorProvider', () => ({
  __esModule: true,
  ...jest.requireActual('@core/journeys/ui/EditorProvider'),
  useEditor: jest.fn()
}))

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('JourneyFlow', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockStep = {
    __typename: 'StepBlock',
    id: 'StepBlock.id',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 0,
    children: [
      {
        __typename: 'CardBlock',
        id: 'CardBlock.id',
        parentBlockId: 'StepBlock.id',
        backgroundColor: null,
        coverBlockId: null,
        fullscreen: false,
        parentOrder: 0,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        children: []
      }
    ]
  } satisfies TreeBlock<StepBlock>

  const mockUseEditorState = {
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
    activeContent: ActiveContent.Canvas,
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    selectedBlock: mockStep,
    selectedStep: mockStep,
    steps: [mockStep]
  } satisfies EditorState

  it('should render with default nodes', () => {
    mockUseEditor.mockReturnValue({
      state: mockUseEditorState,
      dispatch: jest.fn()
    })

    render(
      <ReactFlowProvider>
        <MockedProvider>
          <JourneyFlow />
        </MockedProvider>
      </ReactFlowProvider>
    )

    // ReactFlow components
    expect(screen.getByTestId('rf__wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('rf__controls')).toBeInTheDocument()
    expect(screen.getByTestId('rf__background')).toBeInTheDocument()

    // Default Nodes
    expect(screen.getByTestId('rf__node-SocialPreview')).toBeInTheDocument()
    expect(screen.getByTestId(`rf__node-${mockStep.id}`)).toBeInTheDocument()
  })

  it('should render with all nodes', () => {})

  it('should create nodes on click', () => {})

  it('should connect nodes on drag', () => {})
})
