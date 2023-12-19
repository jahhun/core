import { v4 as uuidv4 } from 'uuid'

import { PrismaClient } from '.prisma/api-journeys-client'

import {
  JourneyStatus,
  Role,
  ThemeMode,
  ThemeName,
  UserTeamRole
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

// Locally: Get userId for 'playwrightUser@example.com' and replace empty string
// Staging/Prod: Will use env variable
const USER_ID_LOCAL = 'eSOfygik80gVvom4j1SAGqj6b3v2'
const TEAM_ID = 'playwright-team'
const JOURNEY_SLUG = 'playwright-testing-journey'

export async function playwrightUserAccess(): Promise<void> {
  const userId = process.env.userId ?? USER_ID_LOCAL

  const journeyProfileId = uuidv4()
  const userTeamId = uuidv4()
  const journeyId = uuidv4()

  console.log('giving playwright user access started')

  const journeyData = {
    id: journeyId,
    title: 'Playwright Journey',
    seoTitle: 'Playwright',
    languageId: '529',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    slug: JOURNEY_SLUG,
    status: JourneyStatus.published,
    teamId: TEAM_ID,
    createdAt: new Date(),
    publishedAt: new Date()
  }

  const teamData = {
    id: TEAM_ID,
    title: 'Playwright'
  }

  const userTeamData = {
    id: userTeamId,
    userId,
    role: UserTeamRole.manager,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const journeyProfileData = {
    id: journeyProfileId,
    userId,
    acceptedTermsAt: new Date(),
    lastActiveTeamId: TEAM_ID,
    onboardingFormCompletedAt: new Date()
  }

  const userRoleData = {
    userId,
    roles: [Role.publisher]
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.team.upsert({
        where: { id: TEAM_ID },
        update: teamData,
        create: teamData
      })

      const existingJourney = await tx.journey.findUnique({
        where: { slug: JOURNEY_SLUG }
      })

      if (existingJourney != null && existingJourney.id !== journeyData.id) {
        await tx.journey.delete({
          where: { slug: JOURNEY_SLUG }
        })
      }

      await tx.journey.upsert({
        where: { id: journeyId },
        update: journeyData,
        create: journeyData
      })

      await tx.team.upsert({
        where: { id: TEAM_ID },
        update: teamData,
        create: {
          ...teamData,
          journeys: { connect: { id: journeyId } }
        }
      })

      const existingUserTeam = await tx.userTeam.findUnique({
        where: { teamId_userId: { teamId: TEAM_ID, userId } }
      })

      if (existingUserTeam != null) {
        await tx.userTeam.delete({
          where: { teamId_userId: { teamId: TEAM_ID, userId } }
        })
      }

      await tx.userTeam.upsert({
        where: { id: userTeamId },
        update: userTeamData,
        create: {
          ...userTeamData,
          team: { connect: { id: TEAM_ID } }
        }
      })

      const existingJourneyProfile = await tx.journeyProfile.findUnique({
        where: { userId }
      })

      if (
        existingJourneyProfile != null &&
        existingJourneyProfile.id !== journeyProfileData.id
      ) {
        await tx.journeyProfile.delete({ where: { userId } })
      }

      await tx.journeyProfile.upsert({
        where: { userId },
        update: journeyProfileData,
        create: journeyProfileData
      })

      await tx.userRole.upsert({
        where: { userId },
        update: userRoleData,
        create: userRoleData
      })
    },
    {
      timeout: 10000
    }
  )

  console.log('giving playwright user access ended')
}
