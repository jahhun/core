import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  """
  VideoTriggerBlock is a block that indicates the video to navigate
  to the next block at the designated time.
  """
  type VideoTriggerBlock implements Block {
    id: ID!
    parentBlockId: ID

    """
    triggerStart sets the time as to when a video navigates to the next block,
    this is the number of seconds since the start of the video
    """
    triggerStart: Int!
    action: Action!
  }
`

export const videoTriggerModule = createModule({
  id: 'videoTrigger',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
