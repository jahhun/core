import OtaClient from '@crowdin/ota-client'
import { Injectable } from '@nestjs/common'
import map from 'lodash/map'
import { xliff12ToJs } from 'xliff'

import { PrismaService } from '../../lib/prisma.service'

const ISO_CODE_WESS_ID_MAP = {
  ar: '22658',
  bn: '139081',
  'zh-CN': '21754', // simplified
  'zh-TW': '21753', // chinese-traditional
  fr: '496',
  de: '1106',
  he: '6930',
  hi: '6464',
  id: '16639', // there are two indonesian langauges, pick Bahasa for now
  ja: '7083',
  ko: '3804',
  fa: '6788',
  'pt-BR': '584',
  ru: '3934',
  'es-MX': '21028',
  tl: '', // missing Tagalog in api-languages
  th: '13169',
  tr: '1942',
  'ur-PK': '407', // urdu
  vi: '3887'
}

type CrowdinFileName =
  | '/Arclight/collection_title.csv'
  | '/Arclight/collection_long_description.csv'
  | '/Arclight/media_metadata_tile.csv'
  | '/Arclight/media_metadata_description.csv'
  | string
// '/Arclight/Bible_books.csv',
// '/Arclight/study_questions.csv'

interface CrowdinData {
  resources: {
    source: string
    target: string
    additionalAttributes: {
      resname: string
      translate?: string
    }
  }
}

interface VideoDescription {
  value: string
  primary: boolean
  languageId: string
}

@Injectable()
export class CrowdinService {
  constructor(private readonly prisma: PrismaService) {}

  async getCrowdinTranslations(): Promise<void> {
    const hash = process.env.CROWDIN_DISTRIBUTION_HASH ?? ''
    const client = new OtaClient(hash, {
      disableManifestCache: true,
      disableStringsCache: true
    })

    const Alllanguages = await client.getTranslations()
    const languages = { ko: Alllanguages.ko }

    await Promise.all(
      map(languages, async (files, languageCode) => {
        await Promise.all(
          files.map(async ({ content }) => {
            const data: CrowdinData = await xliff12ToJs(content)
            await this.storeTranslations(languageCode, data)
          })
        )
      })
    )
  }

  private async storeTranslations(
    bcp47: string,
    data: CrowdinData
  ): Promise<void> {
    await Promise.all(
      map(data.resources, async (translations, fileName) => {
        await Promise.all(
          map(
            translations,
            async ({ source, target, additionalAttributes }) => {
              if (
                source.localeCompare(target) === 0 ||
                additionalAttributes?.translate === 'no' ||
                additionalAttributes?.resname == null
              )
                return
              await this.storeTranslation(
                ISO_CODE_WESS_ID_MAP[bcp47],
                target,
                additionalAttributes.resname,
                fileName
              )
            }
          )
        )
      })
    )
  }

  private async storeTranslation(
    languageId: string,
    value: string,
    videoId: string,
    fileName: CrowdinFileName
  ): Promise<void> {
    const videos = await this.prisma.video.findMany({
      select: { id: true },
      where: {
        id: { endsWith: videoId }
      }
    })
    if (videos.length !== 1)
      throw new Error(`no matching videoId found for ${videoId}`)

    switch (fileName) {
      case '/Arclight/media_metadata_tile.csv':
      case '/Arclight/collection_title.csv':
        // await this.prisma.videoTitle.upsert({
        //   where: {
        //     videoId_languageId: {
        //       videoId: videos[0].id,
        //       languageId
        //     }
        //   },
        //   update: {
        //     value
        //   },
        //   create: {
        //     value,
        //     languageId,
        //     primary: false,
        //     videoId: videos[0].id
        //   }
        // })
        break
      case '/Arclight/collection_long_description.csv':
      case '/Arclight/media_metadata_description.csv': {
        // get the record
        // get the descritions
        // if langaugeId exists, edit the value
        // else spread the array and add an entry
        // update the record description field
        const records = await this.prisma.video.findMany({
          select: {
            description: true
          },
          where: {
            id: videos[0].id
          }
        })

        const descriptions = records[0].description

        const updatedDescriptions: VideoDescription[] = []÷

        map(descriptions, (description: VideoDescription) => {
          description.languageId === languageId
            ? updatedDescriptions.push({ ...description, value })
            : updatedDescriptions.push({ value, primary: false, languageId })
        })

        console.log(updatedDescriptions[0])

        await this.prisma.video.update({
          where: {
            id: videos[0].id
          },
          data: {
            description: updatedDescriptions
          }
        })
      }
    }
  }
}
