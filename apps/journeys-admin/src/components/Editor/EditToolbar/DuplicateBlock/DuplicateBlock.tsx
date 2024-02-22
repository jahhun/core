import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import last from 'lodash/last'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { BlockDuplicate } from '../../../../../__generated__/BlockDuplicate'
import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import { MenuItem } from '../../../MenuItem'

interface DuplicateBlockProps {
  variant: 'button' | 'list-item'
  handleClick?: () => void
  disabled?: boolean
}

export const BLOCK_DUPLICATE = gql`
  mutation BlockDuplicate($id: ID!, $journeyId: ID!, $parentOrder: Int) {
    blockDuplicate(id: $id, journeyId: $journeyId, parentOrder: $parentOrder) {
      id
    }
  }
`

export function DuplicateBlock({
  variant,
  handleClick,
  disabled = false
}: DuplicateBlockProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [blockDuplicate] = useMutation<BlockDuplicate>(BLOCK_DUPLICATE)

  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const blockType = selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
  const disableAction = selectedBlock == null || disabled

  const handleDuplicateBlock = async (): Promise<void> => {
    if (selectedBlock != null && journey != null) {
      const { id, parentOrder } = selectedBlock
      if (parentOrder == null) return

      const { data } = await blockDuplicate({
        variables: {
          id,
          journeyId: journey.id,
          parentOrder:
            selectedBlock.__typename === 'StepBlock' ? null : parentOrder + 1
        },
        update(cache, { data }) {
          if (data?.blockDuplicate != null) {
            handleClick?.()
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const nextBlock = data.blockDuplicate[parentOrder + 1]
                  const lastStep = last(
                    data.blockDuplicate.filter(
                      (block) => block.__typename === 'StepBlock'
                    )
                  )
                  const duplicatedBlockRef = cache.writeFragment({
                    data:
                      selectedBlock.__typename === 'StepBlock'
                        ? lastStep
                        : nextBlock,
                    fragment: gql`
                      fragment DuplicatedBlock on Block {
                        id
                      }
                    `
                  })
                  return [...existingBlockRefs, duplicatedBlockRef]
                }
              }
            })
          }
        }
      })
      if (data?.blockDuplicate != null) {
        if (selectedBlock.__typename === 'StepBlock') {
          const stepBlocks = transformer(
            data?.blockDuplicate as BlockFields[]
          ) as Array<TreeBlock<StepBlock>>
          const steps = stepBlocks.filter(
            (block) => block.__typename === 'StepBlock'
          )
          const duplicatedStep = last(steps)
          dispatch({
            type: 'SetStepsAction',
            steps
          })
          dispatch({
            type: 'SetSelectedStepAction',
            step: duplicatedStep
          })
        } else {
          const block = transformer(data.blockDuplicate as BlockFields[])
          const duplicatedBlock = block[parentOrder + 1]
          dispatch({
            type: 'SetSelectedBlockAction',
            block: duplicatedBlock
          })
        }
      }
    }
    enqueueSnackbar(
      t('{{ blockLabel }} Duplicated', {
        blockLabel: blockType === 'Card' ? t('Card') : t('Block')
      }),
      {
        variant: 'success',
        preventDuplicate: true
      }
    )
  }

  return (
    <>
      {variant === 'button' ? (
        <IconButton
          id={`duplicate-${blockType}-actions`}
          aria-label={`Duplicate ${blockType} Actions`}
          disabled={disableAction}
          onClick={handleDuplicateBlock}
          data-testId={`Duplicate-${blockType}`}
        >
          <CopyLeftIcon />
        </IconButton>
      ) : (
        <MenuItem
          label={t('Duplicate {{ blockLabel }}', {
            blockLabel: blockType === 'Card' ? t('Card') : t('Block')
          })}
          icon={<CopyLeftIcon color="inherit" />}
          disabled={disableAction}
          onClick={handleDuplicateBlock}
          testId={`Duplicate-${blockType}`}
        />
      )}
    </>
  )
}
