import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { User } from 'next-firebase-auth'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_primaryImageBlock as PrimaryImageBlock } from '../../../__generated__/GetJourney'
import { GetJourneys } from '../../../__generated__/GetJourneys'
import { GetTags } from '../../../__generated__/GetTags'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { Role } from '../../../__generated__/globalTypes'
import {
  JourneyFields as Journey,
  JourneyFields_tags as Tag
} from '../../../__generated__/JourneyFields'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'
import { GET_TAGS } from '../../libs/useTagsQuery/useTagsQuery'
import { GET_USER_ROLE } from '../../libs/useUserRoleQuery/useUserRoleQuery'
import { defaultJourney, publishedJourney } from '../Editor/data'

import { journeyVideoBlocks } from './TemplatePreviewTabs/data'
import { parentTags, tags } from './TemplateTags/data'
import { TemplateView } from './TemplateView'

const TemplateViewStory: Meta<typeof TemplateView> = {
  ...journeysAdminConfig,
  component: TemplateView,
  title: 'Journeys-Admin/TemplateView',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const tag: Tag = {
  __typename: 'Tag',
  id: 'tag1.id',
  parentId: 'parentTag.id',
  name: [
    {
      __typename: 'Translation',
      primary: true,
      value: 'tag.name',
      language: { __typename: 'Language', id: 'language.id' }
    }
  ]
}

const getTagsMockEmpty: MockedResponse<GetTags> = {
  request: {
    query: GET_TAGS
  },
  result: {
    data: {
      tags: []
    }
  }
}

const getTagsMock: MockedResponse<GetTags> = {
  request: {
    query: GET_TAGS
  },
  result: {
    data: {
      tags: [...parentTags, ...tags.map((tag) => ({ ...tag, service: null }))]
    }
  }
}

const primaryImageBlock: PrimaryImageBlock = {
  parentBlockId: '1',
  id: 'pImage.id',
  __typename: 'ImageBlock' as const,
  src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
  alt: 'onboarding primary',
  width: 1152,
  height: 768,
  blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
  parentOrder: 1
}

const getJourneysMockEmpty: MockedResponse<GetJourneys> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: []
      }
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const getJourneysMock: MockedResponse<GetJourneys> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: [...tags].map((tag) => tag.id)
      }
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
          trashedAt: null,
          primaryImageBlock
        }
      ]
    }
  }
}

const journey = {
  ...publishedJourney,
  blocks: journeyVideoBlocks,
  tags: [],
  primaryImageBlock
}

const getUserRoleMockEmpty: MockedResponse<GetUserRole> = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: 'user.id',
        roles: []
      }
    }
  }
}
const getUserRoleMock: MockedResponse<GetUserRole> = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: 'user.id',
        roles: [Role.publisher]
      }
    }
  }
}

const Template: StoryObj<
  ComponentProps<typeof TemplateView> & {
    getJourneysMock: MockedResponse<GetJourneys>
    getUserRoleMock: MockedResponse<GetUserRole>
    journey: Journey
    getTagsMock: MockedResponse<GetTags>
  }
> = {
  render: (args) => {
    return (
      <MockedProvider
        mocks={[
          args?.getJourneysMock,
          args?.getUserRoleMock,
          args?.getTagsMock
        ]}
      >
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <TemplateView authUser={args.authUser as unknown as User} />
          </Box>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journey,
    authUser: 'user.id',
    getJourneysMock: getJourneysMockEmpty,
    getUserRoleMock: getUserRoleMockEmpty,
    getTagsMock: getTagsMockEmpty
  }
}

export const Complete = {
  ...Template,
  args: {
    journey: {
      ...journey,
      strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
      tags,
      creatorDescription:
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries',
      creatorImageBlock: {
        id: 'creatorImageBlock.id',
        parentBlockId: null,
        parentOrder: 3,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'photo-1552410260-0fd9b577afa6',
        width: 6000,
        height: 4000,
        blurhash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
        __typename: 'ImageBlock'
      }
    },
    authUser: 'user.id',
    getJourneysMock,
    getUserRoleMock,
    getTagsMock
  }
}

export const Loading = {
  ...Template,
  args: {
    ...Default.args,
    journey: undefined
  }
}

export default TemplateViewStory
