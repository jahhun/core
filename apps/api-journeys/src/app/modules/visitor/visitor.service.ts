import { Injectable } from '@nestjs/common'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { v4 as uuidv4 } from 'uuid'
import { Visitor } from '.prisma/api-journeys-client'
import { PageInfo } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

interface ListParams {
  after?: string | null
  first: number
  filter: {
    teamId: string | undefined
  }
  sortOrder?: 'ASC' | 'DESC'
}

export interface VisitorsConnection {
  edges: Array<{
    node: Visitor
    cursor: Date
  }>
  pageInfo: PageInfo
}

@Injectable()
export class VisitorService {
  constructor(private readonly prismaService: PrismaService) {}

  @KeyAsId()
  async getList({
    after,
    first,
    filter
  }: ListParams): Promise<VisitorsConnection> {
    const result = await this.prismaService.visitor.findMany({
      where: filter,
      cursor:
        after != null
          ? {
              createdAt: new Date(after)
            }
          : undefined,
      orderBy: {
        createdAt: 'desc'
      },
      skip: after == null ? 0 : 1,
      take: first + 1
    })
    const sendResult = result.length > first ? result.slice(0, -1) : result
    return {
      edges: sendResult.map((visitor) => ({
        node: visitor,
        cursor: visitor.createdAt
      })),
      pageInfo: {
        hasNextPage: result.length > first,
        startCursor:
          result.length > 0 ? result[0].createdAt.toISOString() : null,
        endCursor:
          result.length > 0
            ? sendResult[sendResult.length - 1].createdAt.toISOString()
            : null
      }
    }
  }

  async getByUserIdAndJourneyId(
    userId: string,
    journeyId: string
  ): Promise<Visitor> {
    const journey = await this.prismaService.journey.findUnique({
      where: {
        id: journeyId
      }
    })

    if (journey == null) throw new Error('Journey not found')

    let visitor = await this.prismaService.visitor.findFirst({
      where: { userId, teamId: journey.teamId }
    })

    if (visitor == null) {
      const id = uuidv4()
      const createdAt = new Date()
      visitor = await this.prismaService.visitor.create({
        data: {
          id,
          teamId: journey.teamId,
          userId,
          createdAt
        }
      })
    }

    return visitor
  }

  async update(id: string, data: Partial<Visitor>): Promise<Visitor> {
    return await this.prismaService.visitor.update({
      where: { id },
      data: {
        ...data,
        createdAt:
          data.createdAt != null ? new Date(data.createdAt) : undefined,
        userAgent: data.userAgent ?? undefined
      }
    })
  }
}
