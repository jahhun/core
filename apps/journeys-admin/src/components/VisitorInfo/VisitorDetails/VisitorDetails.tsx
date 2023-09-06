import { gql, useQuery } from '@apollo/client'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, parseISO } from 'date-fns'
import { ReactElement } from 'react'

import { GetVisitorForDetails } from '../../../../__generated__/GetVisitorForDetails'

export const GET_VISITOR_FOR_DETAILS = gql`
  query GetVisitorForDetails($id: ID!) {
    visitor(id: $id) {
      id
      lastChatStartedAt
      countryCode
      userAgent {
        os {
          name
        }
      }
    }
  }
`

interface Props {
  id: string
}

export function VisitorDetails({ id }: Props): ReactElement {
  const { data } = useQuery<GetVisitorForDetails>(GET_VISITOR_FOR_DETAILS, {
    variables: { id }
  })
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="flex-end"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={8}
      sx={{ pb: 5, px: 6, mx: { xs: -6, sm: '-30px', md: 0 } }}
    >
      {data?.visitor.lastChatStartedAt != null && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ flexGrow: 1 }}
        >
          <ChatBubbleOutlineRoundedIcon />
          <Typography>
            {intlFormat(parseISO(data?.visitor.lastChatStartedAt), {
              hour: 'numeric',
              minute: 'numeric',
              month: 'short',
              day: 'numeric',
              hour12: true
            })}
          </Typography>
        </Stack>
      )}

      {data?.visitor.countryCode != null && (
        <Stack direction="row" alignItems="center" spacing={2}>
          <LocationOnOutlinedIcon />
          <Typography>{data?.visitor.countryCode}</Typography>
        </Stack>
      )}

      {data?.visitor.userAgent?.os.name != null && (
        <Stack direction="row" alignItems="center" spacing={2}>
          <PhoneIphoneOutlinedIcon />
          <Typography>{data?.visitor.userAgent?.os.name}</Typography>
        </Stack>
      )}

      {data?.visitor.id != null && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <PersonOutlinedIcon />
          <Typography>{`#${data?.visitor.id.slice(-12)}`}</Typography>
        </Stack>
      )}
    </Stack>
  )
}
