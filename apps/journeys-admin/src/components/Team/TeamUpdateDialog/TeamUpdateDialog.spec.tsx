import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TeamUpdate } from '../../../../__generated__/TeamUpdate'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { TEAM_UPDATE } from './TeamUpdateDialog'

import { TeamUpdateDialog } from '.'

describe('TeamUpdateDialog', () => {
  const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Jesus Film Project',
            __typename: 'Team'
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }
  const teamUpdateMock: MockedResponse<TeamUpdate> = {
    request: {
      query: TEAM_UPDATE,
      variables: {
        id: 'teamId',
        input: {
          title: 'Team Title'
        }
      }
    },
    result: {
      data: {
        teamUpdate: {
          id: 'teamId',
          title: 'Team Title',
          __typename: 'Team'
        }
      }
    }
  }
  const teamUpdateErrorMock: MockedResponse<TeamUpdate> = {
    request: {
      query: TEAM_UPDATE,
      variables: {
        id: 'teamId',
        input: {
          title: 'Team Title'
        }
      }
    },
    error: new Error('Team Title already exists.')
  }

  it('updates active team and sets it as active', async () => {
    const handleClose = jest.fn()
    const cache = new InMemoryCache()
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getTeamsMock, teamUpdateMock]} cache={cache}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamUpdateDialog open onClose={handleClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('textbox')).toHaveValue('Jesus Film Project')
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
    expect(getByText('Team Title updated.')).toBeInTheDocument()
  })

  it('validates form', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getTeamsMock, teamUpdateErrorMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamUpdateDialog open onClose={jest.fn()} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('textbox')).toHaveValue('Jesus Film Project')
    )
    fireEvent.change(getByRole('textbox'), { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Team Name must be at least one character.')
      ).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: '12345678901234567890123456789012345678901' }
    })
    await waitFor(() =>
      expect(getByText('Max {{ count }} Characters')).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Failed to update the team. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })
})
