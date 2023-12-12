import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, Resource } from '.prisma/api-nexus-client'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import {
  ResourceCreateInput,
  ResourceFilter,
  ResourceFromGoogleDriveInput,
  ResourceUpdateInput
} from '../../__generated__/graphql'
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleDriveService: GoogleDriveService
  ) {}

  @Query()
  async resources(
    @CurrentUserId() userId: string,
    @Args('where') where?: ResourceFilter
  ): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }

    const resources = await this.prismaService.resource.findMany({
      where: {
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }]
      },
      take: where?.limit ?? undefined
    })

    return resources
  }

  @Query()
  async resource(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<Resource | null> {
    const filter: Prisma.ResourceWhereUniqueInput = { id }
    const resource = await this.prismaService.resource.findUnique({
      where: {
        id,
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }]
      }
    })
    return resource
  }

  @Mutation()
  async resourceCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ResourceCreateInput
  ): Promise<Resource | undefined> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    const resource = await this.prismaService.resource.create({
      data: { ...input, nexusId: nexus.id, id: uuidv4() }
    })

    return resource
  }

  @Mutation()
  async resourceUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input: ResourceUpdateInput
  ): Promise<boolean> {
    await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } }
      },
      data: {
        name: input.name ?? undefined
      }
    })
    return true
  }

  @Mutation()
  async resourceDelete(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } }
      },
      data: {
        status: 'deleted'
      }
    })
    return resource
  }

  @Mutation()
  async resourceFromGoogleDrive(
    @CurrentUserId() userId: string,
    @Args('input') input: ResourceFromGoogleDriveInput
  ): Promise<Resource[]> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
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

      const _googleDriveResource =
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

      const response = await uploadToCloudflareByUrl(
        this.googleDriveService.getFileUrl(fileId),
        userId
      )

      if (!response.success || response.result == null)
        throw new Error(response.errors[0])

      await this.prismaService.googleDriveResource.update({
        where: {
          id: _googleDriveResource.id
        },
        data: {
          cloudFlareId: response.result.uid
        }
      })
    })

    return await this.prismaService.resource.findMany({
      where: { googleDrive: { driveId: { in: input.fileIds } } },
      include: { googleDrive: true }
    })
  }

  @Query()
  async videoDetailsOnCloudflare(
    @Args('input') videoId: string
  ): Promise<CloudflareRetrieveVideoDetailsResponse> {
    return await fetchVideoDetailsFromCloudflare(videoId)
  }
}

interface CloudflareVideoUrlUploadResponse {
  result: {
    uid: string
  } | null
  success: boolean
  errors: string[]
  messages: string[]
}

async function uploadToCloudflareByUrl(
  url: string,
  userId: string
): Promise<CloudflareVideoUrlUploadResponse> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${
      process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
    }/stream/copy`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, creator: userId })
    }
  )
  return await response.json()
}

interface CloudflareRetrieveVideoDetailsResponse {
  result: CloudflareRetrieveVideoDetailsResponseResult | null
  success: boolean
  errors: Array<{ code: number; message: string }>
  messages: Array<{ code: number; message: string }>
}

interface CloudflareRetrieveVideoDetailsResponseResult {
  uid: string
  size: number
  readyToStream: boolean
  thumbnail: string
  duration: number
  preview: string
  input: {
    width: number
    height: number
  }
  playback: {
    hls: string
  }
  meta: {
    [key: string]: string
  }
}

async function fetchVideoDetailsFromCloudflare(
  videoId: string
): Promise<CloudflareRetrieveVideoDetailsResponse> {
  const response = await (
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
        }
      }
    )
  ).json()

  if (response.result == null) {
    throw new GraphQLError('videoId cannot be found on Cloudflare', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  return response
}
