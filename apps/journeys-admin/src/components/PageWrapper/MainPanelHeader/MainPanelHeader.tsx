import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode } from 'react'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainPanelHeaderProps {
  title?: string
  backHref?: string
  children?: ReactNode
  backHrefHistory?: boolean
}

export function MainPanelHeader({
  title,
  backHref,
  children,
  backHrefHistory = false
}: MainPanelHeaderProps): ReactElement {
  const { toolbar } = usePageWrapperStyles()
  const router = useRouter()
  const theme = useTheme()

  return (
    <>
      <AppBar
        color="default"
        sx={{
          position: { xs: 'fixed', md: 'sticky' },
          top: { xs: toolbar.height, md: 0 },
          width: 'inherit'
        }}
        data-testid="MainPanelHeader"
      >
        <Toolbar variant={toolbar.variant}>
          {backHrefHistory ? (
            <Box onClick={() => router.back()}>
              <IconButton
                data-testid="backHref-history-button"
                edge="start"
                size="small"
                color="inherit"
                sx={{ mr: 2 }}
              >
                {theme.direction === 'rtl' ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </IconButton>
            </Box>
          ) : (
            backHref != null && (
              <NextLink href={backHref} passHref legacyBehavior>
                <IconButton
                  edge="start"
                  size="small"
                  color="inherit"
                  sx={{ mr: 2 }}
                >
                  {theme.direction === 'rtl' ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </NextLink>
            )
          )}
          {title != null && (
            <Typography variant="subtitle1" component="div" noWrap>
              {title}
            </Typography>
          )}
          {children}
        </Toolbar>
      </AppBar>
      {/* Reserves space beneath MainHeader on mobile - allows us to export MainPanel */}
      <Toolbar variant={toolbar.variant} sx={{ display: { md: 'none' } }} />
    </>
  )
}
