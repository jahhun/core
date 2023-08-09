import { ReactElement, useEffect, useRef, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import sortBy from 'lodash/sortBy'

import ConnectWithoutContactOutlinedIcon from '@mui/icons-material/ConnectWithoutContactOutlined'
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import Box from '@mui/material/Box'

import ClickAwayListener from '@mui/base/ClickAwayListener'
import { useTeam } from '../TeamProvider'

import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { TeamUpdateDialog } from '../TeamUpdateDialog'
import { TeamCreateDialog } from '../TeamCreateDialog'
import { TeamManageDialog } from '../TeamManageDialog'

export const UPDATE_LAST_ACTIVE_TEAM_ID = gql`
  mutation UpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`

interface TeamSelectProps {
  onboarding?: boolean
}
export function TeamSelect({ onboarding }: TeamSelectProps): ReactElement {
  const theme = useTheme()
  const { query, activeTeam, setActiveTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')

  const [open, setOpen] = useState(onboarding ?? false)
  const [teamManageOpen, setTeamManageOpen] = useState(false)
  const [teamCreateOpen, setTeamCreateOpen] = useState(false)
  const [teamUpdateOpen, setTeamUpdateOpen] = useState(false)
  const [keepDropdownOpen, setKeepDropdownOpen] = useState(false)
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false)

  const anchorRef = useRef(null)
  const listItemRefs = useRef<Array<HTMLDivElement | null>>([])
  const activeItemRef = useRef<HTMLDivElement | null>(null)

  const [updateLastActiveTeamId] = useMutation<UpdateLastActiveTeamId>(
    UPDATE_LAST_ACTIVE_TEAM_ID
  )

  function handleChange(newTeamId: string): void {
    const team = query?.data?.teams.find((team) => team.id === newTeamId)
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: team?.id ?? null
        }
      }
    })
    setActiveTeam(team ?? null)
    setOpenTeamDropdown(false)
  }

  useEffect(() => {
    const handleActiveItemChange = (): void => {
      if (openTeamDropdown) {
        // Delay to ensure the modal content is rendered
        setTimeout(() => {
          const activeItem = activeItemRef?.current

          if (activeItem != null) {
            activeItem.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            })

            activeItem.focus()
          }
        }, 100)
      }
    }

    handleActiveItemChange()
  }, [openTeamDropdown])

  const focusNextListItem = (currentIndex: number): void => {
    const nextItem = listItemRefs.current[currentIndex + 1]
    if (nextItem !== null && nextItem !== undefined) {
      nextItem.focus()
    }
  }

  const focusPreviousListItem = (currentIndex: number): void => {
    const peviousItem = listItemRefs.current[currentIndex - 1]
    if (peviousItem !== null && peviousItem !== undefined) {
      peviousItem.focus()
    }
  }

  // Keyboard navigation between list items
  const handleKeyDown = (event: React.KeyboardEvent, index: number): void => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        focusPreviousListItem(index)
        break
      case 'ArrowDown':
        event.preventDefault()
        focusNextListItem(index)
        break
      case 'Escape':
        event.preventDefault()
        setOpenTeamDropdown(false)
        break
      default:
        break
    }
  }

  return (
    <>
      <TeamCreateDialog
        open={teamCreateOpen}
        onCreate={() => {
          setKeepDropdownOpen(true)
          setOpenTeamDropdown(false)
          setTeamManageOpen(true)
        }}
        onClose={() => {
          setKeepDropdownOpen(true)
          setTeamCreateOpen(false)
        }}
      />
      <TeamUpdateDialog
        open={teamUpdateOpen}
        onClose={() => {
          setKeepDropdownOpen(true)
          setTeamUpdateOpen(false)
        }}
      />
      <TeamManageDialog
        open={teamManageOpen}
        onClose={() => {
          setKeepDropdownOpen(true)
          setTeamManageOpen(false)
        }}
      />

      <Button
        onClick={() => {
          setOpenTeamDropdown(true)
        }}
        color="secondary"
        size="large"
        sx={{
          textAlign: 'left',
          pl: theme.spacing(6),
          pr: theme.spacing(6),
          fontFamily: theme.typography.subtitle1.fontFamily,
          fontSize: theme.typography.subtitle1.fontSize,
          fontWeight: theme.typography.subtitle1.fontWeight,
          borderRadius: 0
        }}
        startIcon={
          activeTeam != null ? (
            <GroupsOutlinedIcon ref={anchorRef} />
          ) : (
            <ConnectWithoutContactOutlinedIcon ref={anchorRef} />
          )
        }
        endIcon={<KeyboardArrowDownRoundedIcon />}
      >
        {activeTeam?.title ?? t('Shared With Me')}
      </Button>
      <Chip
        variant="outlined"
        icon={
          activeTeam != null ? <GroupAddOutlinedIcon fontSize='small' /> : <InfoOutlinedIcon fontSize='small' />
        }
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setTeamManageOpen(true)
        }}
        disabled={activeTeam == null}
        label={
          <Typography variant="body2">
            {activeTeam != null
              ? t('Manage Members')
              : t('Single journeys shared with you')}
          </Typography>
        }
        sx={{
          ml: theme.spacing(4)
        }}
      />

      {/* Team Selection Dropdown */}
      <Popover
        open={openTeamDropdown}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        elevation={0}
        sx={{
          mt: theme.spacing(5),
          '&> .MuiPopover-paper': {
            background: 'none',
            overflow: 'visible',
            borderRadius: 0
          },
          '&> .MuiPopover-paper::before': {
            backgroundColor: theme.palette.background.paper,
            content: '""',
            display: 'block',
            position: 'absolute',
            width: 12,
            height: 12,
            top: -6,
            transform: 'rotate(45deg)',
            left: theme.spacing(10)
          }
        }}
      >
        <ClickAwayListener
          onClickAway={(e) => {
            if (
              !keepDropdownOpen &&
              !teamManageOpen &&
              !teamUpdateOpen &&
              !teamCreateOpen
            ) {
              setOpenTeamDropdown(false)
            }
            setKeepDropdownOpen(false)
          }}
        >
          <Paper elevation={3} sx={{ overflow: 'hidden' }}>
            <Box sx={{}}>
              <List
                sx={{
                  width: '100%',
                  bgcolor: 'background.paper',
                  overflow: 'auto',
                  maxHeight: { xs: '60vh', sm: '50vh' },
                  mt: '1px'
                }}
                subheader={<li />}
              >
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleChange('')
                  }}
                  ref={(el) => {
                    listItemRefs.current[0] = el
                    if (activeTeam === null) {
                      activeItemRef.current = el
                    }
                  }}
                  key="shared_with_me"
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  tabIndex={-1}
                >
                  <ListItem>
                    <ListItemIcon
                      sx={{
                        minWidth: theme.spacing(10)
                      }}
                    >
                      {activeTeam === null ? (
                        <CheckCircleIcon color="primary" />
                      ) : (
                        <RadioButtonUncheckedOutlinedIcon
                          sx={{ opacity: 0.5 }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={t('Shared With Me')}
                      secondary={t('Single journeys shared with you')}
                    />
                  </ListItem>
                </ListItemButton>
              </List>

              <Divider>
                <Typography variant="overline">
                  {/* {t('Teams With Access')} */}
                  {t('Your Teams ')}
                </Typography>
              </Divider>

              <List
                sx={{
                  width: '100%',
                  bgcolor: 'background.paper',
                  overflow: 'auto',
                  maxHeight: { xs: '60vh', sm: '50vh' }
                }}
                subheader={<li />}
              >
                {(query?.data?.teams != null
                  ? sortBy(query.data?.teams, 'title')
                  : []
                ).map((team, index) => (
                  <ListItemButton
                    role={undefined}
                    onClick={() => {
                      handleChange(team.id)
                    }}
                    selected={team.id === activeTeam?.id}
                    // ref={team.id === activeTeam?.id ? activeItemRef : null}
                    ref={(el) => {
                      listItemRefs.current[index + 1] = el
                      if (team.id === activeTeam?.id) {
                        activeItemRef.current = el
                      }
                    }}
                    key={team.id}
                    onKeyDown={(e) => handleKeyDown(e, index + 1)}
                    tabIndex={-1}
                  >
                    <ListItem
                      secondaryAction={
                        team.id === activeTeam?.id && (
                          <Tooltip title={t('Rename')}>
                            <IconButton
                              edge="end"
                              aria-label="rename"
                              onClick={(e) => {
                                e.stopPropagation()
                                setTeamUpdateOpen(true)
                              }}
                            >
                              <CreateOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: theme.spacing(10)
                        }}
                      >
                        {activeTeam?.id === team.id ? (
                          <CheckCircleIcon color="primary" />
                        ) : (
                          <RadioButtonUncheckedOutlinedIcon
                            sx={{ opacity: 0.5 }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={team.title} />
                    </ListItem>
                  </ListItemButton>
                ))}
              </List>

              <Box textAlign="right" sx={{ pr: 4, pb: 4 }}>
                <Button
                  onClick={() => {
                    setTeamCreateOpen(true)
                  }}
                >
                  {t('Create Team')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popover>

      {/* Onboarding popover */}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        PaperProps={{
          sx: {
            maxWidth: { xs: 'calc(100% - 30px)', sm: 300 },
            mt: 4,
            position: 'relative',
            overflow: 'visible',
            '&::before': {
              backgroundColor: 'white',
              content: '""',
              display: 'block',
              position: 'absolute',
              width: 12,
              height: 12,
              top: -6,
              transform: 'rotate(45deg)',
              left: { xs: 20, sm: 10 },
              zIndex: 1
            }
          }
        }}
      >
        <Stack spacing={1} p={6}>
          <Typography variant="h6" gutterBottom>
            {t('More journeys here')}
          </Typography>
          <Typography>
            {t(
              'Journeys are grouped by teams. You can switch between teams by using this dropdown.'
            )}
          </Typography>
          <Box textAlign="right">
            <Button onClick={() => setOpen(false)}>{t('Dismiss')}</Button>
          </Box>
        </Stack>
      </Popover>
    </>
  )
}
