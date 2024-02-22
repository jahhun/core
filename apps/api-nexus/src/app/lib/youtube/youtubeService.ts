/* eslint-disable @typescript-eslint/no-misused-promises */
import { createReadStream, statSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { google, youtube_v3 } from 'googleapis';
import { GaxiosPromise, OAuth2Client } from 'googleapis-common';

import { UpdateVideoLocalization } from '../../modules/bullMQ/bullMQ.service';
import { GoogleOAuthService } from '../googleOAuth/googleOAuth';

interface Credential {
  client_secret: string;
  client_id: string;
  redirect_uris: string[];
}

@Injectable()
export class YoutubeService {
  private readonly credential: Credential;

  constructor(private readonly googleService: GoogleOAuthService) {
    this.credential = {
      client_secret: process.env.CLIENT_SECRET ?? '',
      client_id: process.env.CLIENT_ID ?? '',
      redirect_uris: ['https://localhost:4200'],
    };
  }

  authorize(token: string): OAuth2Client {
    const oAuth2Client = new google.auth.OAuth2(
      this.credential.client_id,
      this.credential.client_secret,
      this.credential.redirect_uris[0],
    );
    oAuth2Client.setCredentials({
      access_token: token,
      scope: 'https://www.googleapis.com/auth/youtube.upload',
    });
    return oAuth2Client;
  }

  async uploadVideo(
    youtubeData: {
      token: string;
      filePath: string;
      channelId: string;
      title: string;
      description: string;
      defaultLanguage: string;
    },
    progressCallback?: (progress: number) => Promise<void>,
  ): GaxiosPromise<youtube_v3.Schema$Video> {
    const service = google.youtube('v3');
    const fileSize = statSync(youtubeData.filePath).size;

    return await service.videos.insert(
      {
        auth: this.authorize(youtubeData.token),
        part: ['id', 'snippet', 'status'],
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: youtubeData.title,
            description: youtubeData.description,
            channelId: youtubeData.channelId,
            defaultLanguage: youtubeData.defaultLanguage ?? 'en',
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: createReadStream(youtubeData.filePath),
        },
      },
      {
        onUploadProgress: async (evt) => {
          const progress = (evt.bytesRead / fileSize) * 100;
          if (progressCallback != null) {
            await progressCallback(progress);
          }
        },
      },
    );
  }

  async updateVideoThumbnail(youtubeData: {
    token: string;
    videoId: string;
    thumbnailPath: string;
  }): Promise<unknown> {
    const service = google.youtube('v3');

    return await service.thumbnails.set({
      auth: this.authorize(youtubeData.token),
      videoId: youtubeData.videoId,
      media: {
        mimeType: 'image/jpeg',
        body: createReadStream(youtubeData.thumbnailPath),
      },
    });
  }

  async addLocalizedMetadataAndUpdateTags(
    youtubeData: UpdateVideoLocalization,
  ): Promise<unknown> {
    const token = await this.googleService.getNewAccessToken(
      youtubeData.channel.refreshToken,
    );
    const auth = this.authorize(token);

    // console.log('YOUTUBE DATA: ', youtubeData.resource);
    const fetchResponse = await google.youtube('v3').videos.list({
      auth,
      part: ['snippet', 'localizations'],
      id: [youtubeData.resource.videoId ?? ''],
    });

    if (
      fetchResponse.data.items == null ||
      fetchResponse.data.items.length === 0
    ) {
      throw new Error('Video not found');
    }

    const videoItem: youtube_v3.Schema$Video = fetchResponse.data.items[0];
    console.log('VIDEO ITEM: ', videoItem);

    const updatedLocalizations =
      videoItem.localizations != null ? { ...videoItem.localizations } : {};
    updatedLocalizations[youtubeData.resource.language] = {
      title: youtubeData.resource.title,
      description: youtubeData.resource.description,
    };
    console.log('UPDATED LOCALIZATIONS: ', updatedLocalizations);

    const res = await google.youtube('v3').videos.insert({
      auth,
      part: ['snippet', 'localizations'],
      requestBody: {
        id: youtubeData.resource.videoId,
        snippet: {
          categoryId: videoItem.snippet?.categoryId,
          defaultLanguage: videoItem.snippet?.defaultLanguage,
          title: videoItem.snippet?.title,
          description: videoItem.snippet?.description,
        },
        localizations: updatedLocalizations,
      },
    });
    console.log('UPDATE LOCALIZATION RESPONSE: ', res);
    return res;
  }

  async uploadCaption(youtubeData: {
    token: string;
    videoId: string;
    language: string;
    name: string;
    captionFile: string;
    isDraft: boolean;
  }): Promise<unknown> {
    const service = google.youtube('v3');
    const auth = this.authorize(youtubeData.token);

    const captionData = {
      auth,
      part: ['snippet'],
      requestBody: {
        snippet: {
          videoId: youtubeData.videoId,
          language: youtubeData.language,
          name: youtubeData.name,
          isDraft: youtubeData.isDraft,
        },
      },
      media: {
        mimeType: 'text/vtt',
        body: createReadStream(youtubeData.captionFile),
      },
    };

    return await service.captions.insert(captionData);
  }
}
