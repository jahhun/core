import { Test, TestingModule } from '@nestjs/testing'
import { omit } from 'lodash'

import { CardBlock, ThemeMode, ThemeName } from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { CardBlockResolver } from './card.resolver'

describe('CardBlockResolver', () => {
  let resolver: CardBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService,
    prismaService: PrismaService

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockUpdate = {
    typename: '',
    journeyId: '2',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockCreateResponse = {
    id: undefined,
    journeyId: '2',
    typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 2,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        CardBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<CardBlockResolver>(CardBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.block.findMany = jest.fn().mockResolvedValue([block, block])
  })

  describe('CardBlock', () => {
    it('returns CardBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('cardBlockCreate', () => {
    it('creates a CardBlock', async () => {
      await resolver.cardBlockCreate(blockUpdate)
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockUpdate.journeyId,
        blockUpdate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith({
        ...omit(blockCreateResponse, ['__typename']),
        typename: 'CardBlock',
        journey: { connect: { id: blockUpdate.journeyId } }
      })
    })
  })

  describe('cardBlockUpdate', () => {
    it('updates a CardBlock', async () => {
      await resolver.cardBlockUpdate(block.id, block.journeyId, blockUpdate)
      expect(service.update).toHaveBeenCalledWith(block.id, blockUpdate)
    })
  })

  describe('fullscreen', () => {
    it('returns fullscreen when true', () => {
      expect(
        resolver.fullscreen({ fullscreen: true } as unknown as CardBlock)
      ).toEqual(true)
    })

    it('returns fullscreen when false', () => {
      expect(
        resolver.fullscreen({ fullscreen: false } as unknown as CardBlock)
      ).toEqual(false)
    })

    it('returns false when fullscreen is not set', () => {
      expect(resolver.fullscreen({} as unknown as CardBlock)).toEqual(false)
    })
  })
})
