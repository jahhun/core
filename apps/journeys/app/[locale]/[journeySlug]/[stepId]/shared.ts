import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'

export interface JourneyStepPageProps {
  journey: Journey
  locale: string
  rtl: boolean
  stepId: string | string[] | undefined
}
