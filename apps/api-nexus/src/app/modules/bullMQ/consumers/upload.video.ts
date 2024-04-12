import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleOAuthService } from '../../../lib/googleOAuth/googleOAuth';
import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UploadToBucketToYoutube } from '../bullMQ.service';

@Processor('nexus-bucket')
export class UploadVideo {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService,
  ) {}

  @Process('video_upload')
  async process(
    job: Job<UploadToBucketToYoutube>,
  ): Promise<UploadToBucketToYoutube> {
    console.log('UPLOAD VIDEO TASK JOB DATA: ', job.data);
    const driveToken = await this.googleOAuthService.getNewAccessToken(
      job.data.resource.refreshToken,
    );

    console.log('DOWNLOAD FROM DRIVE: ', job.data.resource.driveId);
    // DOWNLOAD FROM DRIVE
    const filePath = await this.googleDriveService.downloadDriveFile(
      { fileId: job.data.resource.driveId, accessToken: driveToken },
      async (downloadProgress) => {
        await job.progress(downloadProgress / 3);
        return await Promise.resolve();
      },
    );

    console.log('UPLOADING FILE TO BUCKET: ', filePath);
    // DOWNLOAD FROM DRIVE
    const bucketFile = await this.bucketService.uploadFile(
      filePath,
      process.env.BUCKET_NAME ?? 'bucket-name',
      async (progress) => {
        progress = 33 + progress / 3;
        await job.progress(progress);
        return await Promise.resolve();
      },
    );

    console.log('UPLOAD TO YOUTUBE NOW', filePath);
    // UPLOAD TO YOUTUBE NOW
    // const youtubeData = await this.youtubeService.uploadVideo(
    //   {
    //     token: await this.googleOAuthService.getNewAccessToken(
    //       job.data.channel.refreshToken,
    //     ),
    //     filePath,
    //     channelId: job.data.channel.channelId,
    //     title: job.data.resource.title ?? '',
    //     description: job.data.resource.description ?? '',
    //     defaultLanguage: job.data.resource.language ?? 'en',
    //   },
    //   async (progress) => {
    //     progress = 66 + progress / 3;
    //     await job.progress(progress);
    //     return await Promise.resolve();
    //   },
    // );
    await job.progress(100);
    return { ...job.returnvalue, bucketFileId: bucketFile.Key };
    // return { ...job.returnvalue, youtubeId: youtubeData?.data?.id, bucketFileId: bucketFile.Key };
  }
}
