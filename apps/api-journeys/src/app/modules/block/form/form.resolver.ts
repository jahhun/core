import { subject } from '@casl/ability'
import { createClient } from '@formium/client'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { Block } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  FormBlockCreateInput,
  FormBlockUpdateInput,
  JSON
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

@Resolver('FormBlock')
export class FormBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async formBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: FormBlockCreateInput
  ): Promise<Block> {
    const parentOrder = (
      await this.blockService.getSiblings(input.journeyId, input.parentBlockId)
    ).length

    return await this.prismaService.$transaction(async (tx) => {
      const block = await tx.block.create({
        data: {
          ...omit(input, 'parentBlockId', 'journeyId'),
          id: input.id ?? undefined,
          typename: 'FormBlock',
          journey: { connect: { id: input.journeyId } },
          parentBlock: { connect: { id: input.parentBlockId } },
          parentOrder
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })

      if (!ability.can(Action.Update, subject('Journey', block.journey)))
        throw new GraphQLError('user is not allowed to create block', {
          extensions: { code: 'FORBIDDEN' }
        })
      return block
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async formBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: FormBlockUpdateInput
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.blockService.update(id, input)
  }

  @ResolveField('form')
  async form(@Parent() block: Block): Promise<JSON | null> {
    const { projectId, apiToken, formSlug } = block
    if (projectId == null || apiToken == null || formSlug == null) return null
    const formiumClient = createClient(projectId, {
      apiToken
    })
    try {
      return await formiumClient.getFormBySlug(formSlug)
    } catch (e) {
      return null
    }
  }
}
