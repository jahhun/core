import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { PrismaService } from '../../../lib/prisma.service';
import { UploadToBucketToYoutube } from '../bullMQ.service';

@Injectable()
export class UploadVideoListener implements OnModuleInit {
  constructor(
    @InjectQueue('nexus-bucket') private readonly uploadQueue: Queue,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit(): void {
    this.listenToProgressEvents();
    this.listenToCompletedEvents();
    this.listenToFailedEvents();
  }

  private listenToProgressEvents(): void {
    this.uploadQueue.on('progress', (job: Job<UploadToBucketToYoutube>, progress: number) => {
        console.log('Upload Video Job Progress:', job.id, progress);
        // Update Batch Task Progress
        void Promise.all([
          this.prismaService.batchTask.update({
            data: {
              progress,
            },
            where: {
              id: job.data.batchTaskId,
            },
          }),
        ]);
      },
    );
  }

  private listenToCompletedEvents(): void {
    this.uploadQueue.on('completed', (job: Job<UploadToBucketToYoutube>) => {
        console.log('Job completed: ', job.id);
        console.log('Job: ', job);

        // Update Resource Youtube ID
        if(job?.returnvalue?.youtubeId != null) {
          void Promise.all([
            this.prismaService.resourceYoutubeChannel.create({
              data: {
                resourceId: job.data.resource.id,
                channelId: job.data.channel.id,
                youtubeId: job.returnvalue.youtubeId,
              },
            })
          ]);
        }

        // Update Resource Bucket Key
        if(job?.returnvalue?.bucketFileId != null) {
          void Promise.all([
            this.prismaService.resource.update({
              where: { id: job.data.resource.id },
              data: { googleDrive: { update: { cloudFlareId: job.returnvalue.bucketFileId } } },
            })
          ]);
        }

        // Publish Resource
        void Promise.all([
           this.prismaService.resource.update({
            data: { status: 'published' },
            where: { id: job.data.resource.id },
          }),
        ]);

        // Complete Batch Task
        void Promise.all([
          this.prismaService.batchTask.update({
            data: {
              status: 'completed',
              progress: 100,
            },
            where: {
              id: job.data.batchTaskId,
            },
          }),
        ]);
      },
    );
  }

  private listenToFailedEvents(): void {
    this.uploadQueue.on('failed',  (job: Job<UploadToBucketToYoutube>) => {
      console.log('Job failed', job.id);
      console.log('Job:', job);

      // Batch failed 
      void Promise.all([
        this.prismaService.batchTask.update({
          data: {
            status: 'failed',
            error: job.failedReason,
          },
          where: {
            id: job.data.batchTaskId,
          },
        })
      ]);
      
      // Resource Has Error
      void Promise.all([
        this.prismaService.resource.update({
          data: { status: 'error' },
          where: { id: job.data.resource.id },
        })
      ]);
      
    });
  }
}
