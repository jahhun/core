import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Trans, useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement } from 'react'

import type { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Card } from '@core/journeys/ui/Card'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

export function CardWrapper({ block, children }: WrapperProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const openCardTemplates = (e: MouseEvent): void => {
    e.stopPropagation()
    dispatch({
      type: 'SetSelectedBlockAction',
      selectedBlock: selectedStep
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: undefined
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Drawer
    })
  }

  if (block.__typename === 'CardBlock') {
    const blocks = block.children.map((child) => {
      if (
        child.id === block.coverBlockId &&
        child.__typename === 'VideoBlock'
      ) {
        if (child?.videoId == null) {
          return child
        }
        return {
          ...child,
          videoId: null
        }
      }
      return child
    })
    return (
      <>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: 5
          }}
          data-testid="CardWrapper"
        >
          <Card
            {...{ ...block, children: blocks }}
            wrappers={children.props.wrappers}
          />
          {blocks.length === 0 && !smUp && (
            <Stack
              sx={{
                position: 'absolute',
                top: 60,
                bottom: 130,
                right: 20,
                left: 20
              }}
              alignItems="center"
              justifyContent="center"
              spacing={5}
            >
              <Typography>{t('Fill this card with content')}</Typography>
              <Trans t={t}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={openCardTemplates}
                  fullWidth
                >
                  Select Card Template
                </Button>
                <Typography variant="body2">
                  or add blocks from the list below ⤵
                </Typography>
              </Trans>
            </Stack>
          )}
        </Box>
      </>
    )
  }
  return <></>
}
