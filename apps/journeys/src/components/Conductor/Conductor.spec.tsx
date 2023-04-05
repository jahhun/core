import { useBreakpoints } from '@core/shared/ui/useBreakpoints'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  TreeBlock,
  activeBlockVar,
  treeBlocksVar
} from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'
import { RADIO_QUESTION_SUBMISSION_EVENT_CREATE } from '@core/journeys/ui/RadioQuestion'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_language as Language
} from '../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../__generated__/globalTypes'
import { basic } from '../../libs/testData/storyData'
import { JOURNEY_VIEW_EVENT_CREATE } from './Conductor'
import { Conductor } from '.'

jest.mock('@core/shared/ui/useBreakpoints', () => ({
  __esModule: true,
  useBreakpoints: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

beforeEach(() => {
  const useBreakpointsMock = useBreakpoints as jest.Mock
  useBreakpointsMock.mockReturnValue({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: true
  })
})

const rtlLanguage: Language = {
  __typename: 'Language',
  id: '529',
  bcp47: 'ar',
  iso3: 'arb',
  name: [
    {
      __typename: 'Translation',
      value: 'Arabic',
      primary: false
    }
  ]
}

const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null
}

describe('Conductor', () => {
  mockUuidv4.mockReturnValue('uuid')
  const journeyViewEventMock = {
    request: {
      query: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          journeyId: 'journeyId',
          label: 'my journey',
          value: '529'
        }
      }
    },
    result: {
      data: {
        journeyViewEventCreate: {
          id: 'uuid',
          __typename: 'JourneyViewEvent'
        }
      }
    }
  }

  const mocks = [
    journeyViewEventMock,
    {
      request: {
        query: STEP_VIEW_EVENT_CREATE,
        variables: {
          input: {
            id: 'uuid',
            blockId: 'step1.id',
            value: 'Step 1'
          }
        }
      },
      result: {
        data: {
          stepViewEventCreate: {
            __typename: 'StepViewEvent',
            id: 'uuid'
          }
        }
      }
    },
    {
      request: {
        query: STEP_VIEW_EVENT_CREATE,
        variables: {
          input: {
            id: 'uuid',
            blockId: 'step2.id',
            value: 'Step 2'
          }
        }
      },
      result: {
        data: {
          stepViewEventCreate: {
            __typename: 'StepViewEvent',
            id: 'uuid'
          }
        }
      }
    },

    {
      request: {
        query: STEP_VIEW_EVENT_CREATE,
        variables: {
          input: {
            id: 'uuid',
            blockId: 'step3.id',
            value: 'Step 3'
          }
        }
      },
      result: {
        data: {
          stepViewEventCreate: {
            __typename: 'StepViewEvent',
            id: 'uuid'
          }
        }
      }
    },
    {
      request: {
        query: STEP_VIEW_EVENT_CREATE,
        variables: {
          input: {
            id: 'uuid',
            blockId: 'step4.id',
            value: 'Step 4'
          }
        }
      },
      result: {
        data: {
          stepViewEventCreate: {
            __typename: 'StepViewEvent',
            id: 'uuid'
          }
        }
      }
    },
    {
      request: {
        query: RADIO_QUESTION_SUBMISSION_EVENT_CREATE,
        variables: {
          input: {
            id: 'uuid',
            blockId: 'radioQuestion1.id',
            radioOptionBlockId: 'radioOption3.id',
            stepId: 'step2.id',
            label: 'Step 2',
            value: 'Step 3 (No nextBlockId)'
          }
        }
      },
      result: {
        data: {
          radioQuestionSubmissionEventCreate: {
            __typename: 'RadioQuestionSubmissionEvent',
            id: 'uuid'
          }
        }
      }
    }
  ]

  it('should create a journeyViewEvent', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    const result = jest.fn(() => ({
      data: {
        journeyViewEventCreate: {
          id: 'uuid',
          __typename: 'JourneyViewEvent'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_VIEW_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  label: 'my journey',
                  value: '529'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey: defaultJourney }}>
          <Conductor blocks={[]} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should add journeyViewEvent to dataLayer', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    render(
      <MockedProvider mocks={[journeyViewEventMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <Conductor blocks={[]} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'journey_view',
          journeyId: 'journeyId',
          eventId: 'uuid',
          journeyTitle: 'my journey'
        }
      })
    )
  })

  it('should not throw error if no blocks', () => {
    const blocks: TreeBlock[] = []
    render(
      <MockedProvider>
        <Conductor blocks={blocks} />
      </MockedProvider>
    )
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()).toBe(null)
  })

  describe('ltr journey', () => {
    it('should navigate to next block on right button click', async () => {
      const { getByTestId, queryByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())
      const leftButton = queryByTestId('conductorLeftButton')
      const rightButton = getByTestId('conductorRightButton')

      expect(treeBlocksVar()).toBe(basic)
      expect(activeBlockVar()?.id).toBe('step1.id')
      expect(leftButton).not.toBeInTheDocument()
      expect(rightButton).not.toBeDisabled()
      expect(rightButton).toHaveStyle('cursor: pointer;')

      fireEvent.click(rightButton)

      expect(activeBlockVar()?.id).toBe('step2.id')
    })

    it('should disable navigating to previous step by default', async () => {
      const { getByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())
      const rightButton = getByTestId('conductorRightButton')
      fireEvent.click(rightButton)
      expect(activeBlockVar()?.id).toBe('step2.id')
      const leftButton = getByTestId('conductorLeftButton')

      expect(leftButton).toBeInTheDocument()
      expect(leftButton).toBeDisabled()
    })

    it('should disable right button if next step is locked', async () => {
      const { getByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())

      fireEvent.click(getByTestId('conductorRightButton'))
      expect(activeBlockVar()?.id).toBe('step2.id')

      expect(getByTestId('conductorRightButton')).toBeDisabled()
    })

    it('should not show right button if on last card', async () => {
      const { getByTestId, getAllByRole, queryByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())

      fireEvent.click(getByTestId('conductorRightButton'))
      expect(activeBlockVar()?.id).toBe('step2.id')

      fireEvent.click(
        getAllByRole('button', { name: 'Step 3 (No nextBlockId)' })[0]
      )

      expect(activeBlockVar()?.id).toBe('step3.id')

      fireEvent.click(getByTestId('conductorRightButton'))
      expect(activeBlockVar()?.id).toBe('step4.id')

      expect(queryByTestId('conductorRightButton')).not.toBeInTheDocument()
    })
  })

  describe('rtl journey', () => {
    it('should navigate to next block on left button click', async () => {
      const { getByTestId, queryByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider
            value={{ journey: { ...defaultJourney, language: rtlLanguage } }}
          >
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())

      const leftButton = getByTestId('conductorLeftButton')
      const rightButton = queryByTestId('conductorRightButton')

      expect(treeBlocksVar()).toBe(basic)
      expect(activeBlockVar()?.id).toBe('step1.id')
      expect(rightButton).not.toBeInTheDocument()
      expect(leftButton).not.toBeDisabled()
      expect(leftButton).toHaveStyle('cursor: pointer;')

      fireEvent.click(leftButton)

      expect(activeBlockVar()?.id).toBe('step2.id')
    })

    it('should disable navigating to previous step by default', async () => {
      const { getByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider
            value={{ journey: { ...defaultJourney, language: rtlLanguage } }}
          >
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())

      const leftButton = getByTestId('conductorLeftButton')
      fireEvent.click(leftButton)
      expect(activeBlockVar()?.id).toBe('step2.id')
      const rightButton = getByTestId('conductorRightButton')

      expect(rightButton).toBeInTheDocument()
      expect(rightButton).toBeDisabled()
    })

    it('should disable left button if next step is locked', async () => {
      const { getByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider
            value={{ journey: { ...defaultJourney, language: rtlLanguage } }}
          >
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())

      fireEvent.click(getByTestId('conductorLeftButton'))
      expect(activeBlockVar()?.id).toBe('step2.id')

      expect(getByTestId('conductorLeftButton')).toBeDisabled()
    })

    it('should not show left button if on last card', async () => {
      const { getByTestId, getAllByRole, queryByTestId } = render(
        <MockedProvider mocks={mocks}>
          <JourneyProvider
            value={{ journey: { ...defaultJourney, language: rtlLanguage } }}
          >
            <Conductor blocks={basic} />
          </JourneyProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(getByTestId('step1.id')).toBeInTheDocument())

      fireEvent.click(getByTestId('conductorLeftButton'))
      expect(activeBlockVar()?.id).toBe('step2.id')

      fireEvent.click(
        getAllByRole('button', { name: 'Step 3 (No nextBlockId)' })[0]
      )
      expect(activeBlockVar()?.id).toBe('step3.id')

      fireEvent.click(getByTestId('conductorLeftButton'))
      expect(activeBlockVar()?.id).toBe('step4.id')

      expect(queryByTestId('conductorLeftButton')).not.toBeInTheDocument()
    })
  })
})
