import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { BucketService } from '../../../lib/bucket/bucketService';
import { GoogleOAuthService } from '../../../lib/googleOAuth/googleOAuth';
import { YoutubeService } from '../../../lib/youtube/youtubeService';
import { GoogleDriveService } from '../../google-drive/googleDriveService';
import { UpdateVideoLocalization } from '../bullMQ.service';

@Processor('nexus-upload-localization')
export class UploadLocalization {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly bucketService: BucketService,
    private readonly youtubeService: YoutubeService,
  ) {}

  @Process('processLocalization')
  async process(job: Job<UpdateVideoLocalization>): Promise<void> {
    console.log('LOCALIZATION JOB STARTED: ', job.data);

    // Upload Thumbnail
    if (job.data.resource.thumbnailDriveId != null) {
      // GET THUMBNAIL DRIVE TOKEN
      const thumbnailDriveToken =
        await this.googleOAuthService.getNewAccessToken(
          job.data.resource.refreshToken,
        );
      if (thumbnailDriveToken != null) {
        // DOWNLOAD THUMBNAIL FROM DRIVE
        console.log(
          'DOWNLOAD THUMBNAIL FROM DRIVE: ',
          job.data.resource.thumbnailDriveId,
        );
        const thumnbnailFilePath =
          await this.googleDriveService.downloadDriveFile(
            {
              fileId: job.data.resource.thumbnailDriveId ?? '',
              accessToken: thumbnailDriveToken,
            },
            async (downloadProgress) => {
              downloadProgress = 90 + downloadProgress / 20;
              await job.progress(downloadProgress);
              return await Promise.resolve();
            },
          );
        const resp = await this.youtubeService.updateVideoThumbnail({
          token: await this.googleOAuthService.getNewAccessToken(
            job.data.channel.refreshToken,
          ),
          videoId: job.data.videoId,
          thumbnailPath: thumnbnailFilePath,
          mimeType: 'image/jpeg',
        });
        console.log('THUMBNAIL UPLOAD', resp);
      }
    }

    if (job.data.localizations.length > 0) {
      const resp = await this.youtubeService.updateVideo({
        token: '',
        videoId: job.data.videoId,
        localizations: job.data.localizations
      });
      console.log('resp', resp);
    } else {
      console.log('resp NO LOCALIZATION');
    }

    await job.progress(100);
  }
}
