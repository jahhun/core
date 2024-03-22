import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useMemo } from 'react'
import { SwiperOptions } from 'swiper/types'

import { useTagsQuery } from '../../../libs/useTagsQuery'
import { TemplateGalleryCarousel } from '../TemplateGalleryCarousel'

import { CollectionButton } from './CollectionButton'

interface CollectionsCarouselProps {
  onChange: (selectedTagId: string) => void
}

export function CollectionsCarousel({
  onChange: handleChange
}: CollectionsCarouselProps): ReactElement {
  const { parentTags, childTags, loading } = useTagsQuery()
  const { breakpoints } = useTheme()

  // const swiperBreakpoints: SwiperOptions['breakpoints'] = {
  //   // [breakpoints.values.xs]: {
  //   //   slidesPerGroup: 1
  //   // },
  //   // [breakpoints.values.md]: {
  //   //   slidesPerGroup: 3
  //   // },
  //   // [breakpoints.values.lg]: {
  //   //   slidesPerGroup: 5
  //   // }
  // }

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 2,
      spaceBetween: 4
    },
    [breakpoints.values.sm]: {
      slidesPerGroup: 3,
      spaceBetween: 4
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 4,
      spaceBetween: 32
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5,
      spaceBetween: 12
    },
    [breakpoints.values.xl]: {
      slidesPerGroup: 6,
      spaceBetween: 44
    },
    [breakpoints.values.xxl]: {
      slidesPerGroup: 7,
      spaceBetween: 44
    }
  }

  const feltNeedsTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Felt Needs')?.id
  }, [parentTags])

  const tagsToDisplay = [
    'Acceptance',
    'Depression',
    'Forgiveness',
    'Hope',
    'Loneliness',
    'Love',
    'Security',
    'Significance'
  ]
  const feltNeedsTags = useMemo(() => {
    return feltNeedsTagId != null
      ? childTags.filter(
          (tag) =>
            tag.parentId === feltNeedsTagId &&
            tagsToDisplay.includes(tag.name[0].value)
        )
      : []
  }, [childTags, feltNeedsTagId])

  const collectionTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Collections')?.id
  }, [parentTags])

  // const collectionTags = useMemo(() => {
  //   return collectionTagId != null
  //     ? childTags.filter((tag) => tag.parentId === collectionTagId)
  //     : []
  // }, [childTags, collectionTagId])

  // console.log('collectionTags', collectionTags)
  const collectionTags = [
    {
      __typename: 'Tag',
      id: 'XXXX',
      service: 'apiJourneys',
      parentId: 'XXXXXX',
      name: [
        {
          __typename: 'Translation',
          value: 'Chosen Witness',
          primary: true
        }
      ],
      type: [
        {
          __typename: 'Translation',
          value: 'Animated Video',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: '6caddf4e-fe2c-4aec-959d-be8ef2953bef',
      service: 'apiJourneys',
      parentId: '6037d7ec-6fd6-4c15-ae85-2338530eb680',
      name: [
        {
          __typename: 'Translation',
          value: 'Jesus Film',
          primary: true
        }
      ],
      type: [
        {
          __typename: 'Translation',
          value: 'Film Collection',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: '3de6b1bd-bb6a-4524-8fe4-16fd1fa153d3',
      service: 'apiJourneys',
      parentId: '6037d7ec-6fd6-4c15-ae85-2338530eb680',
      name: [
        {
          __typename: 'Translation',
          value: 'NUA Exploration',
          primary: true
        }
      ],
      type: [
        {
          __typename: 'Translation',
          value: 'Explainer Videos',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'XXXX',
      service: 'apiJourneys',
      parentId: 'XXXXXX',
      name: [
        {
          __typename: 'Translation',
          value: 'LUMO Gospels',
          primary: true
        }
      ],
      type: [
        {
          __typename: 'Translation',
          value: 'Film Collection',
          primary: true
        }
      ]
    },
    {
      __typename: 'Tag',
      id: 'XXXX',
      service: 'apiJourneys',
      parentId: 'XXXXXX',
      name: [
        {
          __typename: 'Translation',
          value: 'Life of Jesus',
          primary: true
        }
      ],
      type: [
        {
          __typename: 'Translation',
          value: 'Film Collection',
          primary: true
        }
      ]
    }
  ]

  return (
    <Stack gap={7} sx={{ mb: { xs: 10, md: 16 } }}>
      <Stack direction="row" gap={10} sx={{ ml: -2 }}>
        <TemplateGalleryCarousel
          items={collectionTags}
          renderItem={(itemProps) => (
            <CollectionButton
              {...itemProps}
              // key={itemProps.id}
              // item={itemProps.tag}
              onClick={handleChange}
            />
          )}
          breakpoints={swiperBreakpoints}
          // loading={loading}
          // cardSpacing={10}
        />
        {/* {loading
          ? [0, 1].map((item, index) => {
              return (
                <CollectionButton
                  key={index}
                  item={undefined}
                  onClick={handleChange}
                />
              )
            })
          : collectionTags.map((tag, index) => {
              return (
                <CollectionButton
                  key={index}
                  item={tag}
                  onClick={handleChange}
                />
              )
            })} */}
      </Stack>
    </Stack>
  )
}
