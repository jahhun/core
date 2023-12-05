import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { fieldEncryptionExtension } from 'prisma-field-encryption'

import { Prisma, PrismaClient } from '.prisma/api-journeys-client'

const client = new PrismaClient()

const extendedClient = client.$extends(fieldEncryptionExtension())

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  readonly extendedClient = extendedClient

  constructor() {
    super()
    return new Proxy(this, {
      get: (target, key) =>
        Reflect.get(key in extendedClient ? extendedClient : target, key)
    })
  }

  async onModuleInit(): Promise<void> {
    // Uncomment this to establish a connection on startup, this is generally not necessary
    // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management#connect
    await Prisma.getExtensionContext(client).$connect()
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    async function waitForAppClose(): Promise<void> {
      await app.close()
    }
    // https://prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-5#removal-of-the-beforeexit-hook-from-the-library-engine
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('exit', waitForAppClose)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('beforeExit', waitForAppClose)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGINT', waitForAppClose)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGTERM', waitForAppClose)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('SIGUSR2', waitForAppClose)
  }
}
