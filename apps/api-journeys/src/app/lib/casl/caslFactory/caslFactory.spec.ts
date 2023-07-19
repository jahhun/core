import { Test, TestingModule } from '@nestjs/testing'
import { subject } from '@casl/ability'
import { UserTeamRole, Team, UserTeam } from '.prisma/api-journeys-client'
import { Action, AppAbility, AppCaslFactory } from '.'

describe('AppCaslFactory', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  describe('Team', () => {
    it('should allow create', () => {
      expect(ability.can(Action.Create, 'Team')).toEqual(true)
    })
    it('should not allow read when no matching userTeam', () => {
      expect(
        ability.can(
          Action.Read,
          subject('Team', { id: 'teamId' } as unknown as Team)
        )
      ).toEqual(false)
    })
    it('should allow read when matching userTeam manager', () => {
      expect(
        ability.can(
          Action.Read,
          subject('Team', {
            id: 'teamId',
            userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
          } as unknown as Team)
        )
      ).toEqual(true)
    })
    it('should allow manage when matching userTeam member', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Team', {
            id: 'teamId',
            userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
          } as unknown as Team)
        )
      ).toEqual(true)
    })
    it('should allow read when matching userTeam member', () => {
      expect(
        ability.can(
          Action.Read,
          subject('Team', {
            id: 'teamId',
            userTeams: [{ userId: user.id, role: UserTeamRole.member }]
          } as unknown as Team)
        )
      ).toEqual(true)
    })
    it('should not allow manage when matching userTeam member', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('Team', {
            id: 'teamId',
            userTeams: [{ userId: user.id, role: UserTeamRole.member }]
          } as unknown as Team)
        )
      ).toEqual(false)
    })
  })
  describe('UserTeam', () => {
    it('should not allow read when no matching userTeam', () => {
      expect(
        ability.can(
          Action.Read,
          subject('UserTeam', { id: 'userTeamId' } as unknown as UserTeam)
        )
      ).toEqual(false)
    })
    it('should allow read when matching userTeam manager', () => {
      expect(
        ability.can(
          Action.Read,
          subject('UserTeam', {
            id: 'userTeamId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
            }
          } as unknown as UserTeam)
        )
      ).toEqual(true)
    })
    it('should allow manage when matching userTeam member', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('UserTeam', {
            id: 'userTeamId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
            }
          } as unknown as UserTeam)
        )
      ).toEqual(true)
    })

    it('should allow read when matching userTeam member', () => {
      expect(
        ability.can(
          Action.Read,
          subject('UserTeam', {
            id: 'userTeamId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.member }]
            }
          } as unknown as UserTeam)
        )
      ).toEqual(true)
    })

    it('should not allow manage when matching userTeam member', () => {
      expect(
        ability.can(
          Action.Manage,
          subject('UserTeam', {
            id: 'userTeamId',
            team: {
              userTeams: [{ userId: user.id, role: UserTeamRole.member }]
            }
          } as unknown as UserTeam)
        )
      ).toEqual(false)
    })
  })
})
