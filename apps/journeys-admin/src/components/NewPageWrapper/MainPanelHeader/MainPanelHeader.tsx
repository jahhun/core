import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode } from 'react'

import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainPanelHeaderProps {
  title: string | ReactNode
  backHref?: string
  menu?: ReactNode
  backHrefHistory?: boolean
}

export function MainPanelHeader({
  title,
  backHref,
  menu,
  backHrefHistory
}: MainPanelHeaderProps): ReactElement {
  const { toolbar } = usePageWrapperStyles()
  const router = useRouter()

  return (
    <>
      <AppBar
        color="default"
        sx={{
          position: { xs: 'fixed', sm: 'sticky' },
          top: { xs: toolbar.height, sm: 0 }
        }}
      >
        <Toolbar variant={toolbar.variant}>
          {backHrefHistory === true ? (
            <Box onClick={() => router.back()}>
              <IconButton
                data-testid="backHref-history-button"
                edge="start"
                size="small"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <ChevronLeftRounded />
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
                  <ChevronLeftRounded />
                </IconButton>
              </NextLink>
            )
          )}
          {typeof title === 'string' ? (
            <Typography
              variant="subtitle1"
              component="div"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}
          {menu}
        </Toolbar>
      </AppBar>
      {/* Reserves space beneath MainHeader on mobile - allows us to export MainPanel */}
      <Toolbar variant={toolbar.variant} sx={{ display: { sm: 'none' } }} />
    </>
  )
}
