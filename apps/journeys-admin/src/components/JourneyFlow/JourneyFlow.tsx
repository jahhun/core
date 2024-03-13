import Box from '@mui/material/Box'
import { SmartBezierEdge } from '@tisoap/react-flow-smart-edge'
import findIndex from 'lodash/findIndex'
import {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState
} from 'react'
import {
  Background,
  Controls,
  Edge,
  Node,
  MarkerType,
  OnConnectEnd,
  OnConnectStart,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow'
import * as d3 from 'd3'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields,
  BlockFields_CardBlock as CardBlock
} from '../../../__generated__/BlockFields'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_FormBlock as FormBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_SignUpBlock as SignUpBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { useNavigateToBlockActionUpdateMutation } from '../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../libs/useStepAndCardBlockCreateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../libs/useStepBlockNextBlockUpdateMutation'

import {
  ACTION_NODE_HEIGHT_GAP,
  ACTION_NODE_WIDTH,
  ACTION_NODE_WIDTH_GAP
} from './nodes/ActionNode'
import { ButtonBlockNode, ButtonBlockNodeData } from './nodes/ButtonBlockNode'
import { FormBlockNode, FormBlockNodeData } from './nodes/FormBlockNode'
import {
  RadioOptionBlockNode,
  RadioOptionBlockNodeData
} from './nodes/RadioOptionBlockNode'
import { SignUpBlockNode, SignUpBlockNodeData } from './nodes/SignUpBlockNode'
import {
  SocialPreviewNode,
  SocialPreviewNodeData
} from './nodes/SocialPreviewNode'
import {
  STEP_NODE_HEIGHT,
  STEP_NODE_HEIGHT_GAP,
  STEP_NODE_WIDTH,
  STEP_NODE_WIDTH_GAP,
  StepBlockNode,
  StepBlockNodeData
} from './nodes/StepBlockNode'
import {
  TextResponseBlockNode,
  TextResponseBlockNodeData
} from './nodes/TextResponseBlockNode'
import { VideoBlockNode, VideoBlockNodeData } from './nodes/VideoBlockNode'

import 'reactflow/dist/style.css'

type InternalNode =
  | Node<StepBlockNodeData, 'StepBlock'>
  | Node<RadioOptionBlockNodeData, 'RadioOptionBlock'>
  | Node<ButtonBlockNodeData, 'ButtonBlock'>
  | Node<TextResponseBlockNodeData, 'TextResponseBlock'>
  | Node<SignUpBlockNodeData, 'SignUpBlock'>
  | Node<FormBlockNodeData, 'FormBlock'>
  | Node<VideoBlockNodeData, 'VideoBlock'>
  | Node<SocialPreviewNodeData, 'SocialPreview'>

interface Connection<T = BlockFields> {
  block: TreeBlock<T>
  step: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

type ActionBlock =
  | TreeBlock<RadioOptionBlock>
  | TreeBlock<ButtonBlock>
  | TreeBlock<TextResponseBlock>
  | TreeBlock<SignUpBlock>
  | TreeBlock<FormBlock>
  | TreeBlock<VideoBlock>

const isActionBlock = (block): block is ActionBlock => 'action' in block

function filterActionBlocks(step: TreeBlock<StepBlock>): ActionBlock[] {
  const card = step.children[0] as TreeBlock<CardBlock> | undefined
  if (card == null) return []

  return card.children
    .flatMap((block) =>
      block.__typename === 'RadioQuestionBlock' ? block.children : block
    )
    .filter(
      (child) => card.coverBlockId !== child.id && isActionBlock(child)
    ) as ActionBlock[]
}

// DON'T move this inside the ReactFlow Component. It is causing an infine rerendering.
const nodeTypes = {
  RadioOptionBlock: RadioOptionBlockNode,
  StepBlock: StepBlockNode,
  ButtonBlock: ButtonBlockNode,
  TextResponseBlock: TextResponseBlockNode,
  SignUpBlock: SignUpBlockNode,
  FormBlock: FormBlockNode,
  VideoBlock: VideoBlockNode,
  SocialPreview: SocialPreviewNode
}

function transformSteps(steps: Array<TreeBlock<StepBlock>>): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const nodes: InternalNode[] = []
  const edges: Edge[] = []

  let currentY = 0 // Starting Y position for the top level nodes

  // Function to calculate the Y position based on the depth of the node
  const calculateYPosition = (depth: number) => {
    return currentY + depth * (STEP_NODE_HEIGHT + STEP_NODE_HEIGHT_GAP)
  }

  const blocks: Array<Array<TreeBlock<StepBlock>>> = []
  const visitedStepIds: string[] = []

  function getStepFromId(id): TreeBlock<StepBlock> | undefined {
    if (visitedStepIds.includes(id)) return
    visitedStepIds.push(id)
    return steps.find((step) => step.id === id)
  }

  function getNextStep(
    step: TreeBlock<StepBlock>
  ): TreeBlock<StepBlock> | undefined {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null) {
      return getStepFromId(steps[index + 1].id)
    }
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      return getStepFromId(step.nextBlockId)
    }
  }

  function connectBlockToNextBlock({ block, step, steps }: Connection): void {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null) {
      edges.push({
        id: `${block.id}->${steps[index + 1].id}`,
        source: block.id,
        target: steps[index + 1].id,
        markerEnd: {
          type: MarkerType.Arrow
        },
        style: {
          strokeWidth: 2,
          strokeDasharray: 8
        },
        type: 'bezier' //'smart'
      })
    }
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      edges.push({
        id: `${block.id}->${step.nextBlockId}`,
        source: block.id,
        target: step.nextBlockId,
        markerEnd: {
          type: MarkerType.Arrow
        },
        style: {
          strokeWidth: 2
          // strokeDasharray: 4
        },
        type: 'bezier' //'smart'
      })
    }
  }

  function getDecendantStepsOfStep(
    step: TreeBlock<StepBlock>
  ): Array<TreeBlock<StepBlock>> {
    const descendants: Array<TreeBlock<StepBlock>> = []
    const nextStep = getNextStep(step)
    if (nextStep != null) descendants.push(nextStep)

    const blocks = filterActionBlocks(step)

    blocks.forEach((child) => {
      if (child.action?.__typename === 'NavigateToBlockAction') {
        const nextStep = getStepFromId(child.action?.blockId)
        if (nextStep != null && step.orphan) {
          nextStep['orphan'] = true
        }
        if (nextStep != null) descendants.push(nextStep)
      }
    })
    return descendants
  }

  function processSteps(steps: Array<TreeBlock<StepBlock>>): void {
    console.log('%c- processSteps - steps', 'color: red', steps)

    // for (const step of steps) {
    //   const actions = filterActionBlocks(step)

    //   const descendants = getDecendantStepsOfStep(step)
    //   if (actions.length > 0) {
    //     blocks.push([step])

    //     actions.forEach((child) => {
    //       if (child.action?.__typename === 'NavigateToBlockAction') {
    //         const nextStep = getStepFromId(child.action?.blockId)

    //         if (nextStep != null) descendants.push(nextStep)
    //       }
    //     })
    //     // console.log('processSteps - blocks', blocks)
    //     // processSteps(descendants)
    //   }
    // }

    blocks.push(steps)
    // console.log('processSteps - blocks', blocks)
    const descendants = steps.flatMap((step) => {
      return getDecendantStepsOfStep(step)
    })
    if (descendants.length > 0) processSteps(descendants)
  }

  function processBlock(block, step, steps, position): void {
    const node = {
      id: block.id,
      selectable: false,
      position
    }
    switch (block.__typename) {
      case 'RadioOptionBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'ButtonBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'TextResponseBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'SignUpBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'FormBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'VideoBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
    }
    if (block.action != null) {
      if (block.action.__typename === 'NavigateToBlockAction') {
        // Solid connection from an option to a card
        edges.push({
          id: `${block.id}->${block.action.blockId}`,
          source: block.id,
          target: block.action.blockId,
          type: 'bezier', //'smart',
          markerEnd: {
            type: MarkerType.Arrow
          },
          style: {
            strokeWidth: 2
          }
        })
      }
      if (block.action.__typename === 'NavigateAction') {
        connectBlockToNextBlock({ block, step, steps })
      }
    }
  }

  const step = getStepFromId(steps[0].id)
  if (step != null) processSteps([step])

  // compare arrays blocks and steps for each step that is not in blocks (use property id to compare) output in console
  steps.forEach((step) => {
    const existsInBlocks = blocks.some((row) =>
      row.some((block) => block.id === step.id)
    )
    if (!existsInBlocks) {
      // step['orphan'] = true
      processSteps([step])
      // console.log('- Step not in blocks:', step)
    }
  })

  blocks.forEach((row, index) => {
    // Calculate the depth of the step here, replace `depth` with actual calculation
    let depth = 0 // Placeholder for depth calculation

    const yPosition = calculateYPosition(depth)

    // Adjust currentY to place nodes at different levels vertically
    if (index === steps.length - 1 || steps[index + 1].depth > depth) {
      currentY += STEP_NODE_HEIGHT + STEP_NODE_HEIGHT_GAP
    }
    const stepY = index * (STEP_NODE_HEIGHT + STEP_NODE_HEIGHT_GAP)
    row.forEach((step, index) => {
      connectBlockToNextBlock({ block: step, step, steps })
      const stepX =
        index * (STEP_NODE_WIDTH + STEP_NODE_WIDTH_GAP) -
        (row.length / 2) * (STEP_NODE_WIDTH + STEP_NODE_WIDTH_GAP)

      // console.log('nodes[step.id]?.position?.x', nodes[step.id]?.position?.x)

      nodes.push({
        id: step.id,
        type: 'StepBlock',
        data: { ...step, steps },
        draggable: true
        // position: {
        //   x: stepX,
        //   y: stepY
        // }
        // position: {
        //   x: 0, // You should calculate X based on the number of nodes at the same level to spread them out
        //   y: yPosition
        // }
      })
      const blockY = stepY + STEP_NODE_HEIGHT + ACTION_NODE_HEIGHT_GAP
      const blocks = filterActionBlocks(step)
      blocks.forEach((block, index) => {
        const blockX =
          stepX +
          index * (ACTION_NODE_WIDTH + ACTION_NODE_WIDTH_GAP) -
          (blocks.length / 2) * (ACTION_NODE_WIDTH + ACTION_NODE_WIDTH_GAP) +
          STEP_NODE_WIDTH / 2 +
          ACTION_NODE_WIDTH_GAP / 2
        processBlock(block, step, steps, {
          x: blockX,
          y: blockY
        })
      })
    })
  })

  nodes.push({
    type: 'SocialPreview',
    id: 'SocialPreview',
    // position: { x: -165, y: -195 },
    data: { __typename: 'SocialPreview' }
  })

  simulation.nodes(nodes)
  console.log('simulation.nodes', simulation.nodes())
  console.log('edges', edges)
  simulation.force(
    'link',
    d3
      .forceLink(JSON.parse(JSON.stringify(edges)))
      .id((d) => d.id)
      .distance(1500)
      .strength(1)
  )

  nodes.forEach((node, index) => {
    // console.log('🇲🇩 node', node)
    // node.position = { x: 0, y: 0 }
    node.position = { x: node?.x || 0, y: node?.y || (index + 1) * 100 }
  })

  return { nodes, edges }
}

export const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', label: 'this is an edge label' },
  { id: 'e1-3', source: '1', target: '3' },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    animated: true,
    label: 'animated edge'
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    label: 'edge with arrow head',
    markerEnd: {
      type: MarkerType.ArrowClosed
    }
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    type: 'smoothstep',
    label: 'smooth step edge'
  },
  {
    id: 'e5-7',
    source: '5',
    target: '7',
    type: 'step',
    style: { stroke: '#f6ab6c' },
    label: 'a step edge',
    animated: true,
    labelStyle: { fill: '#f6ab6c', fontWeight: 700 }
  }
]

// Compute the graph and start the force simulation.
// const root = d3.hierarchy({
//   name: 'Eve',
//   children: [
//     { name: 'Cain' },
//     { name: 'Seth', children: [{ name: 'Enos' }, { name: 'Noam' }] },
//     { name: 'Abel' },
//     { name: 'Awan', children: [{ name: 'Enoch' }] },
//     { name: 'Azura' }
//   ]
// })
// const links = root.links()
// const d3nodes = root.descendants()

// console.log('d3nodes', d3nodes)
// const simulation = d3
//   .forceSimulation(d3nodes)
//   .force(
//     'link',
//     d3
//       .forceLink(links)
//       .id((d) => d.id)
//       .distance(500)
//       .strength(1)
//   )
//   .force('charge', d3.forceManyBody().strength(-50))
//   .force('x', d3.forceX())
//   .force('y', d3.forceY())

// const simulation = d3
//   .forceSimulation([])
//   .force(
//     'link',
//     d3
//       .forceLink([])
//       .id((d) => d.id)
//       .distance(500)
//       .strength(1)
//   )
//   .force('charge', d3.forceManyBody().strength(-50))
//   .force('x', d3.forceX())
//   .force('y', d3.forceY())

// simulation.on('tick', () => {
//   console.log('simulation tick')
// })

// const simulation = d3.forceSimulation([])
// simulation.stop()

// console.log(d3nodes)

// export const STEP_NODE_WIDTH = 200
// export const STEP_NODE_HEIGHT = 76
// export const STEP_NODE_WIDTH_GAP = 200
// export const STEP_NODE_HEIGHT_GAP =

const simulation = d3
  .forceSimulation([])
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(STEP_NODE_WIDTH, STEP_NODE_HEIGHT))
  .force('collide', d3.forceCollide(STEP_NODE_WIDTH * 1.2))

  // .force(
  //   'link',
  //   d3
  //     .forceLink([])
  //     .id((d) => d.id)
  //     .distance(300)
  //     .strength(1)
  // )

  .force('x', d3.forceX())
  .force('y', d3.forceY())

simulation.on('tick', () => {
  console.log('- simulation tick')
})

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance)

function Flow(props) {
  const edgeTypes = {
    smart: SmartBezierEdge
  }

  // you can access the internal state here
  const reactFlowInstance = useReactFlow()

  const {
    state: { steps }
  } = useEditor()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [previousNodeId, setPreviousNodeId] = useState<string | null>(null)
  const [nodeUpdateTick, setNodeUpdateTick] = useState(0)

  // Calculate the initial layout on mount.
  // useLayoutEffect(() => {
  //   console.log('useLayoutEffect')
  //   // onLayout({ direction: 'DOWN', useInitialNodes: true })
  // }, [])

  // console.log('%cnodes', 'color: green', nodes)

  const updatedNodesPosition = (nodes) => {
    nodes.forEach((node) => {
      node.position = { x: node?.x || 0, y: node?.y || 0 }
    })

    return nodes
  }

  useEffect(() => {
    // Subscribe to the d3 tick event
    simulation.on('tick', () => {
      // simulation.stop()
      // console.log('⏰ simulation tick', nodes)
      setNodeUpdateTick((prev) => prev + 1)

      // setNodes(nodes)
      // nodes.forEach((node) => {
      //   console.log('%ctick - node update A', 'color: yellow', {
      //     x: node?.x,
      //     y: node?.y
      //   })
      //   // node.position = { x: node?.x || 0, y: node?.y || 0 }
      //   node.position = { x: 0, y: 0 }
      //   console.log('%ctick - node update B', 'color: orange', node.position)
      // })
    })
  }, []) // Empty dependency array means this effect runs once on mount and cleanup on unmount

  useEffect(() => {
    console.log('⏰ useEffect - nodeUpdateTick')
    setNodes(updatedNodesPosition(nodes))
  }, [nodeUpdateTick])

  useEffect(() => {
    // console.log('useEffect - steps ', steps)
    const { nodes, edges } = transformSteps(steps ?? [])

    console.log('useEffect - nodes ', { nodes, edges })

    setEdges(edges)
    setNodes(updatedNodesPosition(nodes))
  }, [])

  // const onConnectStart: OnConnectStart = (_, { nodeId }) => {
  //   setPreviousNodeId(nodeId)
  // }

  // const onConnectEnd: OnConnectEnd = (event) => {
  //   if (
  //     (event.target as HTMLElement | undefined)?.className ===
  //       'react-flow__pane' &&
  //     previousNodeId != null
  //   ) {
  //     const nodeData = nodes.find((node) => node.id === previousNodeId)?.data
  //     void createNewStepAndConnectBlock(nodeData)
  //   }
  // }

  const { journey } = useJourney()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()

  async function createNewStepAndConnectBlock(
    block?: TreeBlock
  ): Promise<void> {
    if (journey == null || block == null) return
    const newStepId = uuidv4()
    const newCardId = uuidv4()

    await stepAndCardBlockCreate({
      variables: {
        stepBlockCreateInput: {
          id: newStepId,
          journeyId: journey.id
        },
        cardBlockCreateInput: {
          id: newCardId,
          journeyId: journey.id,
          parentBlockId: newStepId,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }
      }
    })
    if (block.__typename === 'StepBlock') {
      await stepBlockNextBlockUpdate({
        variables: {
          id: block.id,
          journeyId: journey.id,
          input: {
            nextBlockId: newStepId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: block.id,
            __typename: 'StepBlock',
            nextBlockId: newStepId
          }
        }
      })
    } else if (isActionBlock(block)) {
      await navigateToBlockActionUpdate(block, newStepId)
    }
  }

  // useEffect(() => {
  //   console.log('useEffect - nodes ', nodes)
  //   nodes.forEach((node) => {
  //     console.log('⚡️ ⚡️ ⚡️ ⚡️  node', node)
  //     node.position = { x: node?.x || 0, y: node?.y || 0 }
  //   })

  //   // const { nodes, edges } = transformSteps(steps ?? [])
  //   // setEdges(edges)
  //   // setNodes(nodes)
  // }, [nodes])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgeTypes={edgeTypes}
      // onConnectEnd={onConnectEnd}
      // onConnectStart={onConnectStart}
      onNodesChange={onNodesChange}
      // onEdgesChange={onEdgesChange}

      nodeTypes={nodeTypes}
      onInit={onInit}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Controls showInteractive={false} />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  )
}

export function JourneyFlow(): ReactElement {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </Box>
  )
}
