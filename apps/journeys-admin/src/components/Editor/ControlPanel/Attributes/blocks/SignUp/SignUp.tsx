import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Attribute } from '../..'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourney'

export function SignUp({
  id,
  action,
  submitIcon
}: TreeBlock<SignUpBlock>): ReactElement {
  return (
    <>
      <Attribute
        id={`${id}-signup-action`}
        icon={<LinkRoundedIcon />}
        name="Action"
        value={action?.__typename.toString() ?? 'None'}
        description="Form Submission"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-signup-icon`}
        icon={<InfoOutlinedIcon />}
        name="Button Icon"
        value={submitIcon?.name.toString() ?? 'None'}
        description="Button Icon"
        // onClick to open drawer
      />
    </>
  )
}
