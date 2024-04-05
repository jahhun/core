import { Divider, Tab, Tabs, Typography } from '@mui/material'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Stack } from '@mui/system'
import castArray from 'lodash/castArray'
import difference from 'lodash/difference'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { TemplateSections } from '../TemplateSections'

import { HeaderAndLanguageFilter } from './HeaderAndLanguageFilter'
import { TagCarousels } from './TagCarousels'
import { TagsFilter } from './TagsFilter'

export function TemplateGallery(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>(
    router.query.languageIds != null
      ? castArray(router.query.languageIds)
      : ['529']
  )
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    router.query.tagIds != null ? castArray(router.query.tagIds) : []
  )

  function handleTagIdsChange(
    newSelectedTagIds: string[],
    availableTagIds: string[]
  ): void {
    const tagIds = [
      ...difference(selectedTagIds, availableTagIds),
      ...newSelectedTagIds
    ]
    setSelectedTagIds(tagIds)
    router.query.tagIds = tagIds
    void router.push(router)
  }

  function handleTagIdChange(selectedTagId: string): void {
    setSelectedTagIds([selectedTagId])
    router.query.tagIds = selectedTagId
    void router.push(router)
  }

  function handleLanguageIdsChange(values: string[]): void {
    setSelectedLanguageIds(values)
    router.query.languageIds = values
    void router.push(router)
  }

  return (
    <Paper
      elevation={0}
      square
      sx={{ height: '100%' }}
      data-testid="TemplateGallery"
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: { md: '90vw' },
          px: { xs: 6, sm: 8 },
          py: { xs: 6, sm: 9 }
        }}
      >
        {/* <HeaderAndLanguageFilter
          selectedLanguageIds={selectedLanguageIds}
          onChange={handleLanguageIdsChange}
        /> */}

        <Grid
          container
          spacing={2}
          sx={{
            mb: { xs: 1, md: 10 }
          }}
          id="TemplateGalleryTagsFilter"
        >
          <Grid item xs={12} md={10}>
            <Tabs
              value={0}
              // onChange={handleChange}
              // aria-label="`editor` tabs"
            >
              <Tab
                label={t('Journeys')}
                sx={{
                  fontSize: '24px'
                }}
                // {...tabA11yProps('control-panel', 0)}
                // sx={{ flexGrow: 1 }}
              />
              <Tab
                label={t('Videos')}
                sx={{
                  fontSize: '24px'
                }}
                // {...tabA11yProps('control-panel', 1)}
                // sx={{ flexGrow: 1 }}
                // disabled={
                //   steps == null ||
                //   selected === 'none' ||
                //   journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
                // }
              />
              <Tab
                label={t('Strategies')}
                sx={{
                  fontSize: '24px'
                }}
                // {...tabA11yProps('control-panel', 1)}
                // sx={{ flexGrow: 1 }}
                // disabled={
                //   steps == null ||
                //   selected === 'none' ||
                //   journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
                // }
              />
              <Tab
                label={t('Calendar')}
                sx={{
                  fontSize: '24px'
                }}
                // {...tabA11yProps('control-panel', 1)}
                // sx={{ flexGrow: 1 }}
                // disabled={
                //   steps == null ||
                //   selected === 'none' ||
                //   journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
                // }
              />
            </Tabs>
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Globe1Icon />
              <TagsFilter
                label={t('Language')}
                tagNames={['Genre']}
                onChange={handleTagIdsChange}
                selectedTagIds={selectedTagIds}
                popperElementId="TemplateGalleryGenreTagsFilter"
                sx={{
                  border: 'none'
                }}
              />
            </Stack>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          sx={{
            mb: { xs: 1, md: 3 }
          }}
          id="TemplateGalleryTagsFilter"
        >
          <Grid item xs={12} md={6} />
          <Grid item xs={12} md={4} />
        </Grid>

        <Grid
          container
          spacing={2}
          sx={{
            mb: { xs: 1, md: 3 }
          }}
          id="TemplateGalleryTagsFilter"
        >
          <Grid item xs={12} md={12}>
            <TagsFilter
              label={t('Topics, holidays, felt needs, collections')}
              tagNames={['Topics', 'Holidays', 'Felt Needs', 'Collections']}
              onChange={handleTagIdsChange}
              selectedTagIds={selectedTagIds}
              popperElementId="TemplateGalleryTagsFilter"
            />
          </Grid>
          {/* <Grid item xs={6} md={6}>
            <TagsFilter
              label={t('Audience')}
              tagNames={['Audience']}
              onChange={handleTagIdsChange}
              selectedTagIds={selectedTagIds}
              popperElementId="TemplateGalleryAudienceTagsFilter"
            />
          </Grid> */}

          <Grid item xs={12} md={0}>
            <Grid container spacing={2}>
              {/* <Grid item xs={6}>
                <TagsFilter
                  label={t('Audience')}
                  tagNames={['Audience']}
                  onChange={handleTagIdsChange}
                  selectedTagIds={selectedTagIds}
                  popperElementId="TemplateGalleryAudienceTagsFilter"
                />
              </Grid> */}
              {/* <Grid item xs={6}>
                <TagsFilter
                  label={t('Genre')}
                  tagNames={['Genre']}
                  onChange={handleTagIdsChange}
                  selectedTagIds={selectedTagIds}
                  popperElementId="TemplateGalleryGenreTagsFilter"
                />
              </Grid> */}
              <Grid
                item
                xs={12}
                md={6}
                id="TemplateGalleryAudienceTagsFilter"
                sx={{ p: '0 !important' }}
              />
              <Grid
                item
                xs={12}
                md={6}
                id="TemplateGalleryGenreTagsFilter"
                sx={{ p: '0 !important' }}
              />
            </Grid>
          </Grid>
        </Grid>
        <TagCarousels onChange={handleTagIdChange} />

        {/* <Typography variant="h1" sx={{ mb: 8 }}>
          {t('Journey Templates in English')}
        </Typography> */}

        <TemplateSections
          tagIds={selectedTagIds.length > 0 ? selectedTagIds : undefined}
          languageIds={
            selectedLanguageIds.length > 0 ? selectedLanguageIds : undefined
          }
        />
      </Container>
    </Paper>
  )
}
