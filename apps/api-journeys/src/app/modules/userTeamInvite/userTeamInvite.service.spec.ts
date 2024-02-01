import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { Team } from '.prisma/api-journeys-client'

import { UserTeamInviteModule } from '../userTeamInvite/userTeamInvite.module'

import { UserTeamInviteService } from './userTeamInvite.service'

describe('UserTeamService', () => {
  let service: UserTeamInviteService

  let emailQueue

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserTeamInviteModule]
    })
      .overrideProvider(getQueueToken('api-journeys-email'))
      .useValue(emailQueue)
      .compile()

    service = module.get<UserTeamInviteService>(UserTeamInviteService)
  })

  describe('sendEmail', () => {
    it('should send an email with the correct subject and body', async () => {
      const team = {
        id: 'teamId',
        title: 'Team Title'
      } as unknown as Team
      const email = 'tav@example.com'
      const sender = {
        firstName: 'Johnathan',
        lastName: 'Joeronimo',
        imageUrl:
          'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }

      await service.sendEmail(team, email, sender)

      expect(emailQueue.add).toHaveBeenCalledWith(
        'team-invite',
        {
          email,
          teamName: team.title,
          sender
        },
        {
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })
  })
})
