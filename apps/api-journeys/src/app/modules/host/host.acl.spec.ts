import { Test, TestingModule } from '@nestjs/testing'
import { subject } from '@casl/ability'
import { Host, UserTeamRole } from '.prisma/api-journeys-client'
import { Action, AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'

describe('hostAcl', () => {
  let factory: AppCaslFactory, ability: AppAbility
  const user = { id: 'userId' }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCaslFactory]
    }).compile()
    factory = module.get<AppCaslFactory>(AppCaslFactory)
    ability = await factory.createAbility(user)
  })
  const hostUserTeamManager = subject('Host', {
    id: 'hostId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.manager }]
    }
  } as unknown as Host)
  const hostUserTeamMember = subject('Host', {
    id: 'hostId',
    team: {
      userTeams: [{ userId: user.id, role: UserTeamRole.member }]
    }
  } as unknown as Host)
  const hostEmpty = subject('Host', {
    id: 'hostId'
  } as unknown as Host)
  // TODO: remove when teams is released
  const hostJfpTeam = subject('Host', {
    id: 'hostId',
    teamId: 'jfp-team'
  } as unknown as Host)
  describe('read', () => {
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Read, hostUserTeamManager)).toEqual(true)
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Read, hostUserTeamMember)).toEqual(true)
    })
    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Read, hostEmpty)).toEqual(false)
    })
  })
  describe('manage', () => {
    // TODO: remove when teams is released
    it('allow when host belongs to jfp-team', () => {
      expect(ability.can(Action.Create, hostJfpTeam)).toEqual(true)
    })
    it('allow when user is team manager', () => {
      expect(ability.can(Action.Manage, hostUserTeamManager)).toEqual(true)
    })
    it('allow when user is team member', () => {
      expect(ability.can(Action.Manage, hostUserTeamMember)).toEqual(true)
    })
    it('deny when user has no userTeam', () => {
      expect(ability.can(Action.Manage, hostEmpty)).toEqual(false)
    })
  })
})
