import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../../Editor/Slider/Settings/GoalDetails/data'

import { TemplateFooter } from './TemplateFooter'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateFooter', () => {
  it('should render', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <TemplateFooter
            openTeamDialog={false}
            setOpenTeamDialog={jest.fn()}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getByRole('button', { name: 'Use This Template' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Use This Template' })
    ).not.toBeDisabled()
  })

  it('should disable when loading', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{}}>
          <TemplateFooter
            openTeamDialog={false}
            setOpenTeamDialog={jest.fn()}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Use This Template' })).toBeDisabled()
  })
})
