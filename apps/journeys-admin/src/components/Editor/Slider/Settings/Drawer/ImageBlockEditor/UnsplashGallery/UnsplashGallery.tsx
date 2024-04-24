import { gql, useQuery } from '@apollo/client'
import LoadingButton from '@mui/lab/LoadingButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { ListUnsplashCollectionPhotos } from '../../../../../../../../__generated__/ListUnsplashCollectionPhotos'

import { UnsplashList } from './UnsplashList'

export const LIST_UNSPLASH_COLLECTION_PHOTOS = gql`
  query ListUnsplashCollectionPhotos(
    $collectionId: String!
    $page: Int
    $perPage: Int
  ) {
    listUnsplashCollectionPhotos(
      collectionId: $collectionId
      page: $page
      perPage: $perPage
    ) {
      id
      alt_description
      blur_hash
      width
      height
      urls {
        small
        regular
      }
      links {
        download_location
      }
      user {
        first_name
        last_name
        username
      }
    }
  }
`

export const TRIGGER_UNSPLASH_DOWNLOAD = gql`
  mutation TriggerUnsplashDownload($url: String!) {
    triggerUnsplashDownload(url: $url)
  }
`
export function UnsplashGallery(): ReactElement {
  const [query] = useState<string>()
  const [page, setPage] = useState(1)
  const [collectionId] = useState('4924556')

  const { data: listData, fetchMore: fetchMoreList } =
    useQuery<ListUnsplashCollectionPhotos>(LIST_UNSPLASH_COLLECTION_PHOTOS, {
      variables: { collectionId, page, perPage: 2 },
      skip: query != null
    })

  const nextPage = (): void => {
    console.log('next page')
    setPage(page + 1)
    if (query == null) {
      void fetchMoreList({
        variables: { collectionId, page, perPage: 3 }
      })
    }
  }

  const { t } = useTranslation('apps-journeys-admin')

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-empty-function
  function a() {}

  return (
    <Stack sx={{ p: 6 }} data-testid="UnsplashGallery">
      <Stack sx={{ pt: 4, pb: 1 }}>
        <Typography variant="overline" color="primary">
          {t('Unsplash')}
        </Typography>
        <Typography variant="h6">{t('Featured Images')}</Typography>
      </Stack>
      {query == null && listData !== undefined && (
        <UnsplashList
          gallery={listData.listUnsplashCollectionPhotos}
          onChange={a}
        />
      )}

      <LoadingButton variant="outlined" onClick={nextPage} size="medium">
        {t('Load More')}
      </LoadingButton>
    </Stack>
  )
}
