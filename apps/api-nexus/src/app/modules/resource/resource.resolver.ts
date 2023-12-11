import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, Resource } from '.prisma/api-nexus-client'

import {
  ResourceCreateInput,
  ResourceFilter,
  ResourceUpdateInput
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Resource')
export class ResourceResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async resources(@Args('where') where?: ResourceFilter): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }

    const resources = await this.prismaService.resource.findMany({
      where: filter,
      take: where?.limit ?? undefined
    })

    return resources
  }

  @Query()
  async resource(@Args('id') id: string): Promise<Resource | null> {
    const filter: Prisma.ResourceWhereUniqueInput = { id }
    const resource = await this.prismaService.resource.findUnique({
      where: filter
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    return resource
  }

  @Mutation()
  async resourceCreate(
    @Args('input') input: ResourceCreateInput
  ): Promise<Resource | undefined> {
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const resource = await tx.resource.create({
          data: {
            id: uuidv4(),
            ...input
          }
        })
        return resource
      })
    } catch (err) {
      throw err
    }
  }

  @Mutation()
  async resourceUpdate(
    @Args('id') id: string,
    @Args('input') input: ResourceUpdateInput
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.findUnique({
      where: { id }
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const updatedResource = await tx.resource.update({
          where: { id },
          data: {
            name: input.name ?? undefined,
            refLink: input.refLink ?? undefined,
            videoId: input.videoId ?? undefined
          }
        })
        return updatedResource
      })
    } catch (err) {
      throw err
    }
  }

  @Mutation()
  async resourceFromGoogleDrive(
    @CurrentUserId() userId: string,
    @Args('input') input: ResourceFromGoogleDriveInput
  ): Promise<Resource[]> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } }
    })

    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await input.fileIds.forEach(async (fileId) => {
      const driveFile = await this.googleDriveService.getFile({
        fileId,
        accessToken: input.authCode ?? ''
      })
      if (driveFile == null)
        throw new GraphQLError('file not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: driveFile.name,
          nexusId: nexus.id,
          status: 'published',
          createdAt: new Date()
        }
      })
      await this.prismaService.googleDriveResource.create({
        data: {
          id: uuidv4(),
          resourceId: resource.id,
          driveId: driveFile.id,
          title: driveFile.name,
          mimeType: driveFile.mimeType,
          refreshToken: input.authCode ?? ''
        }
      })
    })
    return await this.prismaService.resource.findMany({
      where: { googleDrive: { driveId: { in: input.fileIds } } },
      include: { googleDrive: true }
    })
  }
}
