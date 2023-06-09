import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { JourneyService } from '../journey/journey.service'
import { PrismaService } from '../../lib/prisma.service'
import { UserJourneyService } from './userJourney.service'
import { UserJourneyResolver } from './userJourney.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    UserJourneyService,
    UserJourneyResolver,
    JourneyService,
    PrismaService
  ],
  exports: [UserJourneyService]
})
export class UserJourneyModule {}
