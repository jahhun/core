import { Test, TestingModule } from '@nestjs/testing'
import algoliasearch from 'algoliasearch'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import { VideoVariant } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

import { AlgoliaService } from './algolia.service'

const saveObjectsSpy = jest
  .fn()
  .mockReturnValue({ wait: jest.fn().mockResolvedValue({}) })

const initIndexSpy = jest.fn().mockReturnValue({
  saveObjects: saveObjectsSpy
})

jest.mock('algoliasearch', () => {
  return jest.fn().mockImplementation(() => {
    return {
      initIndex: initIndexSpy
    }
  })
})

const mockAlgoliaSearch = algoliasearch as jest.MockedFunction<
  typeof algoliasearch
>

describe('AlgoliaService', () => {
  let service: AlgoliaService
  let prismaService: DeepMockProxy<PrismaService>

  const originalEnv = clone(process.env)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlgoliaService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<AlgoliaService>(AlgoliaService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('syncVideosToAlgolia', () => {
    it('should throw if no API key', async () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(service.syncVideosToAlgolia()).rejects.toThrow(
        'algolia environment variables not set'
      )
    })

    it('should sync videos to Algolia', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      prismaService.videoVariant.findMany
        .mockResolvedValue([])
        .mockResolvedValueOnce([
          {
            id: 'id',
            videoId: 'videoId',
            video: {
              title: [{ value: 'title' }],
              description: [{ value: 'description' }],
              label: 'label',
              image: 'image',
              imageAlt: [{ value: 'imageAlt' }],
              childIds: ['childId']
            },
            duration: 100,
            languageId: 'languageId',
            subtitle: [{ languageId: 'subtitle' }],
            slug: 'slug'
          } as unknown as VideoVariant
        ])

      await service.syncVideosToAlgolia()
      expect(prismaService.videoVariant.findMany).toHaveBeenCalledWith({
        take: 1000,
        skip: 0,
        include: {
          video: { include: { title: true } },
          subtitle: true
        }
      })
      expect(mockAlgoliaSearch).toHaveBeenCalledWith('id', 'key')
      expect(initIndexSpy).toHaveBeenCalledWith('video-variants')
      expect(saveObjectsSpy).toHaveBeenCalledWith([
        {
          childrenCount: 1,
          description: ['description'],
          duration: 100,
          image: 'image',
          imageAlt: 'imageAlt',
          label: 'label',
          languageId: 'languageId',
          objectID: 'id',
          slug: 'slug',
          subtitles: ['subtitle'],
          titles: ['title'],
          videoId: 'videoId'
        }
      ])
    })
  })
})
