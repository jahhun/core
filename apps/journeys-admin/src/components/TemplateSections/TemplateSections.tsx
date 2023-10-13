import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import map from 'lodash/map'
import take from 'lodash/take'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { useJourneysQuery } from '../../libs/useJourneysQuery'

import { TemplateSection } from './TemplateSection'

interface Contents {
  [key: string]: { category: string; journeys: Journey[] }
}

interface TemplateSectionsProps {
  tagIds?: string[]
  languageIds?: string[]
}

export function TemplateSections({
  tagIds,
  languageIds
}: TemplateSectionsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [contents, setContents] = useState<Contents>({})
  const [collection, setCollection] = useState<Journey[]>([])
  const [languageMatch, setLanguageMatch] = useState<boolean>()

  const { data, loading } = useJourneysQuery({
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds
      }
    },
    onCompleted(data) {
      let filteredJourneys = data.journeys
      if (languageIds != null && languageIds.length > 0) {
        filteredJourneys = data.journeys.filter((journey) =>
          languageIds.includes(journey.language.id)
        )
      }
      if (filteredJourneys.length === 0) {
        setLanguageMatch(true)
      }
      const collection =
        tagIds == null
          ? [
              ...filteredJourneys.filter(
                ({ featuredAt }) => featuredAt != null
              ),
              ...take(
                filteredJourneys.filter(({ featuredAt }) => featuredAt == null),
                10
              )
            ]
          : filteredJourneys
      setCollection(collection)
      const contents = {}
      filteredJourneys.forEach((journey) => {
        journey.tags.forEach((tag) => {
          if (contents[tag.id] == null)
            contents[tag.id] = {
              category: tag.name.find(({ primary }) => primary)?.value ?? '',
              journeys: []
            }
          contents[tag.id].journeys.push(journey)
        })
      })
      setContents(contents)
    }
  })

  return (
    <Stack spacing={8}>
      {collection.length > 0 && (
        <TemplateSection
          category={tagIds == null ? t('Featured & New') : t('Most Relevant')}
          journeys={collection}
        />
      )}
      {map(
        contents,
        ({ category, journeys }, key) =>
          ((languageIds != null && journeys.length >= 0) ||
            (tagIds == null && journeys.length >= 5) ||
            tagIds?.includes(key) === true) && (
            <TemplateSection category={category} journeys={journeys} />
          )
      )}
      {!loading &&
        ((data?.journeys != null && data?.journeys.length === 0) ||
          languageMatch === true) && (
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 4,
              width: '100%',
              padding: 8
            }}
          >
            <Typography variant="h6">
              {t('No template fully matches your search criteria.')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t(
                "Try using fewer filters or look below for templates related to the categories you've selected to search"
              )}
            </Typography>
          </Paper>
        )}
    </Stack>
  )
}
