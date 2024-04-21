import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Resource, ResourceStatus, SourceType } from '.prisma/api-nexus-client'

import { BullMQService } from '../../lib/bullMQ/bullMQ.service'
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService'
import { GoogleDriveService } from '../../lib/google/drive.service'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { GoogleSheetsService } from '../../lib/google/sheets.service'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'

import { ResourceResolver } from './resource.resolver'

describe('ResourceResolver', () => {
  let resolver: ResourceResolver
  let prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: GoogleOAuthService,
          useValue: mockDeep<GoogleOAuthService>()
        },
        {
          provide: GoogleDriveService,
          useValue: mockDeep<GoogleDriveService>()
        },
        {
          provide: GoogleSheetsService,
          useValue: mockDeep<GoogleSheetsService>()
        },
        {
          provide: GoogleYoutubeService,
          useValue: mockDeep<GoogleYoutubeService>()
        },
        { provide: CloudFlareService, useValue: mockDeep<CloudFlareService>() },
        { provide: BullMQService, useValue: mockDeep<BullMQService>() }
      ]
    }).compile()

    resolver = module.get<ResourceResolver>(ResourceResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('resources', () => {
    it('should return an array of resources based on the filter', async () => {
      const userId = 'userId'
      const mockResources: Resource[] = [
        {
          id: 'resourceId',
          nexusId: 'nexusId',
          name: 'Resource Name',
          status: ResourceStatus.published,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          category: 'Example Category',
          privacy: null,
          sourceType: SourceType.other
        }
      ]
      prismaService.resource.findMany.mockResolvedValue(mockResources)

      const result = await resolver.resources(userId, {})
      expect(result).toEqual(mockResources)
      expect(prismaService.resource.findMany).toHaveBeenCalled()
    })
  })
})
