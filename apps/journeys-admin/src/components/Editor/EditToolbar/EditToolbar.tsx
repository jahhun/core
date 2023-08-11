import { gql, useMutation, useQuery } from '@apollo/client'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import TranslateIcon from '@mui/icons-material/Translate'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetRole } from '../../../../__generated__/GetRole'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../__generated__/globalTypes'
import { AccessAvatars } from '../../AccessAvatars'
import { DuplicateBlock } from '../../DuplicateBlock'

import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

const DynamicLanguageDialog = dynamic<{
  open: boolean
  onClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "MenuLanguageDialog" */
      '../../JourneyView/Menu/LanguageDialog'
    ).then((mod) => mod.LanguageDialog)
)

export function EditToolbar(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { state } = useEditor()
  const { data } = useQuery<GetRole>(GET_ROLE)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)

  const handleUpdateLanguage = (): void => {
    setShowLanguageDialog(true)
    setAnchorEl(null)
  }

  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <AccessAvatars
        journeyId={journey?.id}
        userJourneys={journey?.userJourneys ?? undefined}
        size="small"
        xsMax={5}
        showManageButton
      />
      {(journey?.template !== true || isPublisher) && (
        <Button
          // variant="outlined"
          startIcon={<TranslateIcon fontSize="small" />}
          color='secondary'
          onClick={handleUpdateLanguage}
          size='small'
          sx={{
            fontWeight:600
          }}
        >{journey?.language.iso3}</Button>
      )}

      {/* bcp47: string | null; */}
      {/* iso3: string | null; */}
      {/* name: JourneyFields_language_name[]; */}
      {journey?.template !== true && (
        <NextLink href={`/journeys/${journey?.id}/reports`} passHref>
          <Button
            startIcon={<AssessmentOutlinedIcon fontSize="small" />}
            color='secondary'
            size='small'
            sx={{
              fontWeight:600
            }}
          >{t('Visitors')}</Button>
        </NextLink>
      )}
      {(journey?.template !== true || isPublisher) && (
        <Button
        variant="contained"
          // variant="outlined"
          startIcon={<LinkOutlinedIcon fontSize="small" />}
          onClick={handleUpdateLanguage}
          color='secondary'
          sx={{
            fontWeight:600
          }}
        >{t('Share')}</Button>
      )}
      <IconButton
        aria-label="Preview"
        href={`/api/preview?slug=${journey?.slug ?? ''}`}
        target="_blank"
      >
        <PlayArrowOutlinedIcon />
      </IconButton>
      <Menu />
      {showLanguageDialog && (
        <DynamicLanguageDialog
          open={showLanguageDialog}
          onClose={() => setShowLanguageDialog(false)}
        />
      )}
    </Stack>
  )
}
