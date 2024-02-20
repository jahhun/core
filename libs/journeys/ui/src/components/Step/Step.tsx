import { gql, useMutation } from '@apollo/client'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '../../libs/block'
import { isActiveBlockOrDescendant, useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider/JourneyProvider'
// eslint-disable-next-line import/no-cycle
import { BlockRenderer, WrappersProps } from '../BlockRenderer'

import { StepFields } from './__generated__/StepFields'
import { StepViewEventCreate } from './__generated__/StepViewEventCreate'

export const STEP_VIEW_EVENT_CREATE = gql`
  mutation StepViewEventCreate($input: StepViewEventCreateInput!) {
    stepViewEventCreate(input: $input) {
      id
    }
  }
`

interface StepProps extends TreeBlock<StepFields> {
  wrappers?: WrappersProps
}

export function Step({
  id: blockId,
  children,
  wrappers
}: StepProps): ReactElement {
  const [stepViewEventCreate] = useMutation<StepViewEventCreate>(
    STEP_VIEW_EVENT_CREATE
  )

  const { variant, journey } = useJourney()
  const { treeBlocks, blockHistory } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')

  const activeBlock = blockHistory[blockHistory.length - 1]
  const heading = getStepHeading(blockId, children, treeBlocks, t)
  const activeStep = blockId === activeBlock?.id
  const activeJourneyStep =
    (variant === 'default' || variant === 'embed') && activeStep

  useEffect(() => {
    if (
      activeJourneyStep &&
      isActiveBlockOrDescendant(blockId) &&
      wrappers === undefined
    ) {
      const id = uuidv4()
      void stepViewEventCreate({
        variables: { input: { id, blockId, value: heading } }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'step_view',
          eventId: id,
          blockId,
          stepName: heading
        }
      })
    }
  }, [
    blockId,
    stepViewEventCreate,
    variant,
    heading,
    activeJourneyStep,
    wrappers
  ])

  return (
    <>
      {activeJourneyStep &&
        (treeBlocks[0]?.id !== blockId ? (
          <NextSeo title={`${heading} (${journey?.title ?? ''})`} />
        ) : (
          <NextSeo title={`${journey?.title ?? ''} (${heading})`} />
        ))}
      {children.map((block) => (
        <BlockRenderer
          block={block}
          wrappers={wrappers}
          key={block.id}
          activeStep={activeStep}
        />
      ))}
    </>
  )
}
