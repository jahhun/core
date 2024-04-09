import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import { Prisma, Resource } from '.prisma/api-nexus-client';
import { User } from '@core/nest/common/firebaseClient';
import { CurrentUser } from '@core/nest/decorators/CurrentUser';
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId';

import {
  GoogleAuthInput,
  GoogleAuthResponse,
  ResourceCreateInput,
  ResourceFilter,
  ResourceFromGoogleDriveInput,
  ResourceUpdateInput,
} from '../../__generated__/graphql';
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { BatchService } from '../batch/batchService';
import { BullMQService } from '../bullMQ/bullMQ.service';
import {
  GoogleDriveService,
  SpreadsheetTemplateType,
} from '../google-drive/googleDriveService';

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudFlareService: CloudFlareService,
    private readonly youtubeService: YoutubeService,
    private readonly bullMQService: BullMQService,
    private readonly batchService: BatchService,
  ) {}

  @Query()
  async resources(
    @CurrentUserId() userId: string,
    @Args('where') where?: ResourceFilter,
  ): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {};
    if (where?.ids != null) filter.id = { in: where?.ids };
    filter.nexusId = where?.nexusId ?? undefined;

    const resources = await this.prismaService.resource.findMany({
      where: {
        AND: [
          filter,
          {
            nexus: {
              userNexuses: {
                every: { userId },
              },
            },
          },
          {
            NOT: { status: 'deleted' },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { localizations: true },
      take: where?.limit ?? undefined,
    });

    return resources;
  }

  @Query()
  async resource(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<Resource | null> {
    const filter: Prisma.ResourceWhereUniqueInput = { id };
    const resource = await this.prismaService.resource.findUnique({
      where: {
        id,
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }],
      },
      include: { localizations: true },
    });
    return resource;
  }

  @Mutation()
  async resourceCreate(
    // @CurrentUserId() userId: string,
    @Args('input') input: ResourceCreateInput,
  ): Promise<Resource | undefined> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId },
    });
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' },
      });

    const resource = await this.prismaService.resource.create({
      data: {
        ...input,
        nexusId: nexus.id,
        id: uuidv4(),
        sourceType: 'other',
      },
    });

    return resource;
  }

  @Mutation()
  async resourceUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input: ResourceUpdateInput,
  ): Promise<Resource> {
    return await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } },
      },
      data: {
        name: input.name ?? undefined,
      },
    });
  }

  @Mutation()
  async resourceDelete(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } },
      },
      data: {
        status: 'deleted',
      },
    });
    return resource;
  }

  @Mutation()
  async resourceFromGoogleDrive(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('input') input: ResourceFromGoogleDriveInput,
  ): Promise<Resource[]> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } },
    });
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await input.fileIds.forEach(async (fileId) => {
      const driveFile = await this.googleDriveService.getFile({
        fileId,
        accessToken: input.authCode ?? '',
      });
      if (driveFile == null)
        throw new GraphQLError('file not found', {
          extensions: { code: 'NOT_FOUND' },
        });

      const fileUrl = this.googleDriveService.getFileUrl(fileId);
      await this.googleDriveService.setFilePermission({
        fileId,
        accessToken: input.authCode ?? '',
      });
      const res = await this.cloudFlareService.uploadToCloudflareByUrl(
        fileUrl,
        driveFile.name,
        userId,
      );
      console.log('CLOUD FLARE', res);

      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: driveFile.name,
          nexusId: nexus.id,
          status: 'published',
          createdAt: new Date(),
          sourceType: 'googleDrive',
        },
      });

      await this.prismaService.googleDriveResource.create({
        data: {
          id: uuidv4(),
          resourceId: resource.id,
          driveId: driveFile.id,
          mimeType: driveFile.mimeType,
          refreshToken: input.authCode ?? '',
        },
      });
    });

    return await this.prismaService.resource.findMany({
      where: { googleDrive: { driveId: { in: input.fileIds } } },
      include: { googleDrive: true },
    });
  }

  @Mutation()
  async resourceFromTemplate(
    @CurrentUserId() userId: string,
    @Args('nexusId') nexusId: string,
    @Args('tokenId') tokenId: string,
    @Args('spreadsheetId') spreadsheetId: string,
    @Args('drivefolderId') drivefolderId: string,
  ): Promise<Resource[]> {
    console.log('Resource From Template . . .');
    const nexus = await this.prismaService.nexus.findUnique({
      where: {
        id: nexusId,
        userNexuses: { every: { userId } },
      },
    });
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' },
      });

    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId },
      });

    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId');
    }

    const { accessToken, data } =
      await this.googleDriveService.getSpreadsheetData(tokenId, spreadsheetId);

    const { templateType, spreadsheetData } =
      await this.googleDriveService.populateSpreadsheetData(
        accessToken,
        drivefolderId,
        data,
      );

    if (templateType === SpreadsheetTemplateType.UPLOAD) {
      console.log('IN UPLOAD');
      console.log('spreadsheetData', spreadsheetData);
      const batchResources =
        await this.batchService.createUploadResourceFromSpreadsheet(
          nexus.id,
          googleAccessToken.refreshToken,
          spreadsheetData,
        );

      console.log('batchResources', batchResources);

      const preparedBatchJobs =
        this.batchService.prepareBatchResourcesForUploadBatchJob(
          batchResources,
        );

      console.log('preparedBatchJobs', preparedBatchJobs);

      for (const preparedBatchJob of preparedBatchJobs) {
        await this.bullMQService.createUploadBatch(
          uuidv4(),
          nexusId,
          preparedBatchJob.channel,
          preparedBatchJob.resources,
        );
      }
      return batchResources.map((item) => item.resource);
    } else if (templateType === SpreadsheetTemplateType.LOCALIZATION) {
      console.log('IN LOCALIZATION');
      console.log('spreadsheetData', spreadsheetData);
      const batchLocalizations =
        await this.batchService.createResourcesLocalization(
          googleAccessToken.refreshToken,
          spreadsheetData,
        );
      console.log('batchLocalizations', batchLocalizations);
      const preparedBatchJobs =
        this.batchService.prepareBatchResourceLocalizationsForBatchJob(
          batchLocalizations,
        );
      console.log('preparedBatchJobs', preparedBatchJobs);
      for (const preparedBatchJob of preparedBatchJobs) {
        await this.bullMQService.createLocalizationBatch(
          uuidv4(),
          nexusId,
          preparedBatchJob.videoId,
          preparedBatchJob.channel,
          preparedBatchJob.localizations,
        );
      }
      return [];
    } else if (templateType === SpreadsheetTemplateType.UPDATE) {
      console.log('IN UPDATE');
      console.log('spreadsheetData', spreadsheetData);

      const updatePromises = spreadsheetData.map(async (row) => {
        if (row.video_id == null || row.channelData == null) {
          console.error(
            `Missing video_id or channel data for row, skipping update. Video ID: ${
              row.video_id
            }, Channel Data Exists: ${Boolean(row.channelData)}`,
          );
          return null;
        }

        try {
          const channel = await this.prismaService.channel.findUnique({
            where: {
              id: row.channelData.id,
            },
            include: {
              youtube: true,
            },
          });

          if (channel == null || channel.youtube == null) {
            console.error(
              'YouTube details not found for channel:',
              row.channelData.id,
            );
            return null;
          }

          const refreshToken = channel.youtube.refreshToken;
          const youtubeToken = await this.googleOAuthService.getNewAccessToken(
            refreshToken,
          );

          const updateResponse = await this.youtubeService.updateVideoInfo({
            token: youtubeToken,
            videoId: row.video_id,
            title: row.title,
            description: row.description,
            defaultLanguage: row.text_language,
            privacyStatus: 'private',
          });

          return {
            videoId: row.video_id,
            updateResponse,
            channel: row.channelData,
          };
        } catch (error) {
          console.error(
            'Error updating video info for video_id:',
            row.video_id,
            error,
          );
          return null;
        }
      });

      const updateResults = await Promise.all(updatePromises);
      console.log('updateResults', updateResults);
      // return updateResults.filter((result) => result !== null);
    }

    return [];
  }

  @Mutation()
  async getGoogleAccessToken(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('input') input: GoogleAuthInput,
  ): Promise<GoogleAuthResponse> {
    const { accessToken, refreshToken } =
      await this.googleOAuthService.exchangeAuthCodeForTokens(
        input.authCode,
        input.url,
      );
    const tokenRecord = await this.prismaService.googleAccessToken.create({
      data: {
        refreshToken,
      },
    });

    return {
      id: tokenRecord.id,
      accessToken,
    };
  }
}
