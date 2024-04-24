import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { UpdateVideoLocalization } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UpdateLocalization {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Process('processLocalization')
  async process(job: Job<UpdateVideoLocalization>): Promise<void> {
    console.log('LOCALIZATION JOB DATA: ', job.data);



    await job.progress(100);
  }
}
