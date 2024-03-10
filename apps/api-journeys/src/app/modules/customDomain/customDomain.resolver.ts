import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'

import { CustomDomain } from '.prisma/api-journeys-client'

import {
  CustomDomainCreateInput,
  CustomDomainVerification
} from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { CustomDomainService } from './customDomain.service'

@Resolver('CustomDomain')
export class CustomDomainResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly customDomainService: CustomDomainService
  ) {}

  @Query()
  async customDomain(@Args('id') id: string): Promise<CustomDomain | null> {
    return await this.prismaService.customDomain.findUnique({
      where: { id }
    })
  }

  @Query()
  async customDomains(@Args('teamId') teamId: string): Promise<CustomDomain[]> {
    return (
      (await this.prismaService.customDomain.findMany({
        where: { teamId }
      })) ?? []
    )
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainCreate(
    @Args('input') input: CustomDomainCreateInput
  ): Promise<CustomDomain & { verification: CustomDomainVerification }> {
    return await this.customDomainService.customDomainCreate(input)
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainDelete(@Args('id') id: string): Promise<CustomDomain> {
    const customDomain = await this.prismaService.customDomain.delete({
      where: { id }
    })
    await this.customDomainService.deleteVercelDomain(customDomain.name)
    return customDomain
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'CustomDomain'
    id: string
  }): Promise<CustomDomain | null> {
    return await this.customDomain(reference.id)
  }

  @ResolveField()
  journeyCollection(
    @Parent() customDomain: CustomDomain
  ): null | { __typename: 'JourneyCollection'; id: string } {
    return customDomain.journeyCollectionId == null
      ? null
      : {
          __typename: 'JourneyCollection',
          id: customDomain.journeyCollectionId
        }
  }

  @ResolveField()
  async verification(
    @Parent() customDomain: CustomDomain
  ): Promise<CustomDomainVerification> {
    const vercelResult = await this.customDomainService.verifyVercelDomain(
      customDomain.name
    )
    return {
      verified: vercelResult.verified,
      verification: vercelResult.verification
    }
  }
}
