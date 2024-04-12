import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { Resource } from '.prisma/api-nexus-client';

import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { BatchService } from '../batch/batchService';
import { BullMQService } from '../bullMQ/bullMQ.service';
import {
  GoogleDriveService,
  SpreadsheetRow,
  SpreadsheetTemplateType,
} from '../google-drive/googleDriveService';

@Injectable()
export class ResourceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly resourceService: ResourceService,
    private readonly bullMQService: BullMQService,
    private readonly batchService: BatchService,
  ) {}

  async getTemplateData(
    tokenId: string,
    spreadsheetId: string,
    drivefolderId: string,
  ): Promise<{
    templateType: SpreadsheetTemplateType;
    spreadsheetData: SpreadsheetRow[];
    googleAccessToken: { id: string; refreshToken: string };
  }> {
    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId },
      });
    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId');
    }
    const { accessToken, data } =
      await this.googleDriveService.getSpreadsheetData(tokenId, spreadsheetId);
    const response = await this.googleDriveService.populateSpreadsheetData(
      accessToken,
      drivefolderId,
      data,
    );
    return {
      templateType: response.templateType,
      spreadsheetData: response.spreadsheetData,
      googleAccessToken,
    };
  }

  async processUploadTemplateBatches(
    nexusId: string,
    googleAccessToken: { id: string; refreshToken: string },
    spreadsheetData: SpreadsheetRow[],
  ): Promise<Resource[]> {
    
    // UPLOADING TEMPLATE DATA
    console.log('UPLOADING TEMPLATE DATA', spreadsheetData);
    const batchResources =
      await this.batchService.createUploadResourceFromSpreadsheet(
        nexusId,
        googleAccessToken.refreshToken,
        spreadsheetData,
      );

    // BATCH RESOURCES
    console.log('BATCH RESOURCES', batchResources);
    const preparedBatchJobs =
      this.batchService.prepareBatchResourcesForUploadBatchJob(batchResources);
    
    // PREPARED BATCH JOBS
    console.log('PREPARED BATCH JOBS', preparedBatchJobs);
    for (const preparedBatchJob of preparedBatchJobs) {
      await this.bullMQService.createUploadBatch(
        uuidv4(),
        nexusId,
        preparedBatchJob.channel,
        preparedBatchJob.resources,
      );
    }
    return batchResources.map((item) => item.resource);
  }

  async processLocalizationTemplateBatches(
    nexusId: string,
    googleAccessToken: { id: string; refreshToken: string },
    spreadsheetData: SpreadsheetRow[],
  ): Promise<Resource[]> {
    // 
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
  }
}
