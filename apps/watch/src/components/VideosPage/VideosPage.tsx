import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import { GetLanguages } from '../../../__generated__/GetLanguages'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { FilterList } from './FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'
import { checkFilterApplied } from './utils/checkFilterApplied'
import { VideoPageFilter, getQueryParameters } from './utils/getQueryParameters'
import { useVideoSearch } from './utils/useVideoSearch'

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID) {
    languages(limit: 5000) {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

interface VideoProps {
  videos: VideoChildFields[]
}

export function VideosPage({ videos }: VideoProps): ReactElement {
  const router = useRouter()
  const [isEnd, setIsEnd] = useState(false)

  const localVideos = videos.filter((video) => video !== null)

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  const filter = getQueryParameters()

  const { algoliaVideos, currentPage, totalPages, loading, handleSearch } =
    useVideoSearch({ filter })

  function isAtEnd(currentPage: number, totalPages: number): boolean {
    if (currentPage + 1 === totalPages) return true
    return false
  }

  function handleFilterChange(filter: VideoPageFilter): void {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    const params = new URLSearchParams()

    const setQueryParam = (paramName: string, value?: string | null): void => {
      if (value != null) {
        params.set(paramName, value)
      }
    }

    setQueryParam('languages', filter.availableVariantLanguageIds?.[0])
    setQueryParam('subtitles', filter.subtitleLanguageIds?.[0])
    setQueryParam('title', filter.title)

    void router.push(`/videos?${params.toString()}`, undefined, {
      shallow: true
    })
    void handleSearch({
      title,
      availableVariantLanguageIds,
      subtitleLanguageIds,
      page: 0
    })
  }

  function handleLoadMore(): void {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    if (isEnd) return
    if (checkFilterApplied(filter)) {
      void handleSearch({
        title,
        availableVariantLanguageIds,
        subtitleLanguageIds,
        page: currentPage + 1
      })
    }
  }

  useEffect(() => {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    if (checkFilterApplied(filter)) {
      void handleSearch({
        title,
        availableVariantLanguageIds,
        subtitleLanguageIds,
        page: 0
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentPage === 0 && totalPages === 0) {
      setIsEnd(true)
    } else {
      setIsEnd(isAtEnd(currentPage ?? 0, totalPages ?? 1))
    }
  }, [setIsEnd, currentPage, totalPages])

  return (
    <PageWrapper hero={<VideosHero />} testId="VideosPage">
      <Container maxWidth="xxl">
        <VideosSubHero />
      </Container>
      <Divider sx={{ height: 2, background: 'rgba(33, 33, 33, 0.08)' }} />
      <Container maxWidth="xxl" sx={{ py: 12 }}>
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={{ xs: 4, xl: 8 }}
        >
          <Box sx={{ minWidth: '278px' }}>
            <FilterList
              filter={filter}
              onChange={handleFilterChange}
              languagesData={languagesData}
              languagesLoading={languagesLoading}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <VideoGrid
              videos={
                algoliaVideos.length === 0 && !checkFilterApplied(filter)
                  ? localVideos
                  : algoliaVideos
              }
              onLoadMore={handleLoadMore}
              loading={loading}
              hasNextPage={!isEnd}
              variant="expanded"
            />
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
