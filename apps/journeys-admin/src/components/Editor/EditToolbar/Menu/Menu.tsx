import { gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import File5Icon from '@core/shared/ui/icons/File5'
import MoreIcon from '@core/shared/ui/icons/More'
import SettingsIcon from '@core/shared/ui/icons/Settings'

import { GetRole } from '../../../../../__generated__/GetRole'
import { Role } from '../../../../../__generated__/globalTypes'
import { DuplicateBlock } from '../../../DuplicateBlock'
import { MenuItem } from '../../../MenuItem'
import { DeleteBlock } from '../DeleteBlock'

import { CopyMenuItem } from './CopyMenuItem'
import { CreateTemplateMenuItem } from './CreateTemplateMenuItem'
import { LanguageMenuItem } from './LanguageMenuItem'
import { ReportMenuItem } from './ReportMenuItem'

const DescriptionDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditToolbar/Menu/DescriptionDialog" */
      './DescriptionDialog'
    ).then((mod) => mod.DescriptionDialog),
  { ssr: false }
)
const TemplateSettingsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditToolbar/Menu/TemplateSettingsDialog" */
      './TemplateSettingsDialog'
    ).then((mod) => mod.TemplateSettingsDialog),
  { ssr: false }
)
const TitleDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditToolbar/Menu/TitleDialog" */
      './TitleDialog'
    ).then((mod) => mod.TitleDialog),
  { ssr: false }
)

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

export function Menu(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useQuery<GetRole>(GET_ROLE)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const [titleDialogOpen, setTitleDialogOpen] = useState<boolean | undefined>()
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState<
    boolean | undefined
  >()
  const [templateSettingsDialogOpen, setTemplateSettingsDialogOpen] = useState<
    boolean | undefined
  >()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }
  function handleOpenTitleDialog(): void {
    setTitleDialogOpen(true)
    setAnchorEl(null)
  }
  function handleCloseTitleDialog(): void {
    setTitleDialogOpen(false)
    setAnchorEl(null)
  }
  function handleOpenDescriptionDialog(): void {
    setDescriptionDialogOpen(true)
    setAnchorEl(null)
  }
  function handleCloseDescriptionDialog(): void {
    setDescriptionDialogOpen(false)
    setAnchorEl(null)
  }
  function handleOpenTemplateSettingsDialog(): void {
    setTemplateSettingsDialogOpen(true)
    setAnchorEl(null)
  }
  function handleCloseTemplateSettingsDialog(): void {
    setTemplateSettingsDialogOpen(false)
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        id="edit-journey-actions"
        edge="end"
        aria-label={t('Edit Journey Actions')}
        aria-controls="edit-journey-actions"
        aria-haspopup="true"
        aria-expanded={anchorEl != null ? 'true' : undefined}
        onClick={handleShowMenu}
        disabled={journey == null}
      >
        <MoreIcon />
      </IconButton>
      <MuiMenu
        id="edit-journey-actions"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'edit-journey-actions'
        }}
      >
        <NextLink
          href={`/api/preview?slug=${journey?.slug ?? ''}`}
          passHref
          legacyBehavior
          prefetch={false}
        >
          <MenuItem
            label={t('Preview')}
            icon={<EyeOpenIcon />}
            openInNew
            onClick={handleCloseMenu}
          />
        </NextLink>
        <DuplicateBlock
          variant="list-item"
          disabled={selectedBlock?.__typename === 'VideoBlock'}
        />
        <DeleteBlock variant="list-item" closeMenu={handleCloseMenu} />
        <Divider />
        {journey?.template === true && (
          <MenuItem
            label={t('Template Settings')}
            icon={<SettingsIcon />}
            onClick={handleOpenTemplateSettingsDialog}
          />
        )}
        {journey?.template !== true && (
          <MenuItem
            label={t('Title')}
            icon={<Edit2Icon />}
            onClick={handleOpenTitleDialog}
          />
        )}
        {journey?.template !== true && (
          <MenuItem
            label={t('Description')}
            icon={<File5Icon />}
            onClick={handleOpenDescriptionDialog}
          />
        )}
        {(journey?.template !== true || isPublisher != null) && (
          <LanguageMenuItem onClose={handleCloseMenu} />
        )}
        {journey != null && <ReportMenuItem journey={journey} />}
        {journey?.template !== true && isPublisher === true && (
          <CreateTemplateMenuItem />
        )}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && <Divider />}
        {journey != null &&
          (journey?.template !== true || isPublisher != null) && (
            <CopyMenuItem journey={journey} onClose={handleCloseMenu} />
          )}
      </MuiMenu>
      {titleDialogOpen != null && (
        <TitleDialog open={titleDialogOpen} onClose={handleCloseTitleDialog} />
      )}
      {descriptionDialogOpen != null && (
        <DescriptionDialog
          open={descriptionDialogOpen}
          onClose={handleCloseDescriptionDialog}
        />
      )}
      {templateSettingsDialogOpen != null && (
        <TemplateSettingsDialog
          open={templateSettingsDialogOpen}
          onClose={handleCloseTemplateSettingsDialog}
        />
      )}
    </>
  )
}
