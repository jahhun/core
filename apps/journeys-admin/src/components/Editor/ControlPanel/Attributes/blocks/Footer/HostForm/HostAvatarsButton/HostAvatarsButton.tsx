import { ReactElement, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Stack from '@mui/material/Stack'
import UserProfiledAddIcon from '@core/shared/ui/icons/UserProfileAdd'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ImageLibrary } from '../../../../../../ImageLibrary'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/GetJourney'
import { useHostUpdate } from '../../../../../../../../libs/useHostUpdate'

export function HostAvatarsButton(): ReactElement {
  const [open, setOpen] = useState(false)
  const { updateHost } = useHostUpdate()
  const { journey } = useJourney()
  const host = journey?.host

  const [avatarNumber, setAvatarNumber] = useState<number>(1)

  function handleOpen(avatar: 1 | 2): void {
    setOpen(true)
    setAvatarNumber(avatar)
  }
  function handleClose(): void {
    setOpen(false)
  }

  async function handleChange(avatarImage: ImageBlock): Promise<void> {
    if (host != null) {
      const { id, teamId } = host
      await updateHost({
        id,
        teamId,
        input: { [`src${avatarNumber}`]: avatarImage.src }
      })
    }
  }

  async function handleDelete(): Promise<void> {
    if (host != null) {
      const { id, teamId } = host
      if (avatarNumber === 1) {
        await updateHost({
          id,
          teamId,
          input: { src1: host.src2, src2: null }
        })
      } else {
        await updateHost({
          id,
          teamId,
          input: { src2: null }
        })
      }
    }
  }

  return (
    <Stack direction="row">
      <AvatarGroup
        sx={{
          '.MuiAvatar-root': {
            borderColor: (theme) => theme.palette.grey[400]
          }
        }}
      >
        <Avatar
          data-testid="avatar1"
          alt="avatar1"
          onClick={() => handleOpen(1)}
          sx={{
            color: (theme) => theme.palette.grey[400],
            bgcolor: 'background.paper'
          }}
          src={journey?.host?.src1 ?? undefined}
        >
          {journey?.host?.src1 == null && <UserProfiledAddIcon />}
        </Avatar>
        <Avatar
          data-testid="avatar2"
          alt="avatar2"
          onClick={() => handleOpen(2)}
          sx={{
            color: (theme) => theme.palette.grey[400],
            bgcolor: 'background.paper'
          }}
          src={journey?.host?.src2 ?? undefined}
        >
          {journey?.host?.src2 == null && <UserProfiledAddIcon />}
        </Avatar>
      </AvatarGroup>
      <ImageLibrary
        open={open}
        onClose={handleClose}
        onChange={handleChange}
        onDelete={handleDelete}
        selectedBlock={
          host != null
            ? {
                id: `avatar${avatarNumber}`,
                __typename: 'ImageBlock',
                alt: `avatar${avatarNumber}`,
                src: host[`src${avatarNumber}`],
                parentBlockId: 'none',
                parentOrder: 0,
                width: 44,
                height: 44,
                blurhash: ''
              }
            : null
        }
      />
    </Stack>
  )
}
