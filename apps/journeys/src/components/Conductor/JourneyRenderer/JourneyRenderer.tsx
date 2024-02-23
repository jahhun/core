import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { SxProps } from '@mui/material/styles'
import { ReactElement, useEffect } from 'react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

import { StepFields } from '../../../../__generated__/StepFields'

export function JourneyRenderer(): ReactElement {
  const {
    blockHistory,
    treeBlocks,
    getNextBlock,
    setShowNavigation,
    setShowHeaderFooter
  } = useBlocks()

  const currentBlock = blockHistory[blockHistory.length - 1] as
    | TreeBlock<StepFields>
    | undefined
  const previousBlock = blockHistory[blockHistory.length - 2] as
    | TreeBlock<StepFields>
    | undefined
  const nextBlock = getNextBlock({ activeBlock: currentBlock })

  useEffect(() => {
    setShowHeaderFooter(true)
  }, [currentBlock, setShowHeaderFooter])

  return (
    <>
      {treeBlocks.map((block) => {
        const cardSx: SxProps = {
          height: 'inherit',
          width: '-webkit-fill-available;',
          position: 'absolute',
          top: 0,
          left: 0
        }

        const isCurrent = block.id === currentBlock?.id
        // test via e2e: navigation to and from non-pre-rendered cards
        const isPreRender =
          block.id === nextBlock?.id || block.id === previousBlock?.id

        if (isCurrent) {
          cardSx.height = '100%'
          cardSx.width = 'inherit'
          cardSx.position = 'relative'
          cardSx.display = 'block'
        }

        return (
          <Fade
            key={block.id}
            in={isCurrent}
            timeout={{ appear: 0, enter: 200, exit: 0 }}
          >
            <Box
              className={isCurrent ? 'active-card' : ''}
              onClick={() => setShowNavigation(true)}
              sx={{
                ...cardSx
              }}
            >
              {isCurrent || isPreRender ? (
                <Box
                  data-testid={`journey-card-${block.id}`}
                  sx={{
                    height: '100%'
                  }}
                >
                  <BlockRenderer block={block} />
                </Box>
              ) : (
                <></>
              )}
            </Box>
          </Fade>
        )
      })}
    </>
  )
}
