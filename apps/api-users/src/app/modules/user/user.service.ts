import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { getAuth } from 'firebase-admin/auth'

import { User } from '.prisma/api-users-client'
import { firebaseClient } from '@core/nest/common/firebaseClient'

import { PrismaService } from '../../lib/prisma.service'
import { VerifyUserJob } from '../email/email.consumer'

@Injectable()
export class UserService {
  constructor(
    @InjectQueue('api-users-email')
    private readonly emailQueue: Queue<VerifyUserJob>,
    private readonly prismaService: PrismaService
  ) {}

  async verifyUser(userId: string, email: string): Promise<void> {
    const token = Math.floor(100000 + Math.random() * 900000).toString() // six digit, first is not 0
    await this.prismaService.userToken.upsert({
      where: { userId },
      update: { token },
      create: { userId, token }
    })
    await this.emailQueue.add(
      'verifyUser',
      {
        userId,
        email,
        token
      },
      {
        jobId: `${userId}-${token}`,
        removeOnComplete: {
          age: 24 * 3600 // keep up to 24 hours
        },
        removeOnFail: {
          age: 24 * 3600 // keep up to 24 hours
        }
      }
    )
  }

  async validateEmail(user: User, token: string): Promise<boolean> {
    const userToken = await this.prismaService.userToken.findFirst({
      where: { AND: [{ userId: user.userId }, { token }] }
    })

    if (userToken != null) {
      await this.prismaService.user.update({
        where: { userId: user.userId },
        data: { emailVerified: true }
      })
      await getAuth(firebaseClient).updateUser(user.userId, {
        emailVerified: true
      })
      return true
    }
    return false
  }
}
