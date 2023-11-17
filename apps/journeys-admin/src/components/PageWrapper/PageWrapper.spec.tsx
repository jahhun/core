import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'

import { PageWrapper } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('PageWrapper', () => {
  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should show title', () => {
      const { getByText } = render(
        <MockedProvider>
          <PageWrapper title="Page title" />
        </MockedProvider>
      )
      expect(getByText('Page title')).toBeInTheDocument()
    })

    it('should show back button', () => {
      const { getAllByRole } = render(
        <MockedProvider>
          <PageWrapper title="Page title" backHref="/" />
        </MockedProvider>
      )
      expect(getAllByRole('link')[0]).toHaveAttribute('href', '/')
    })

    it('should show custom menu', () => {
      const { getByText } = render(
        <MockedProvider>
          <PageWrapper title="Page title" menu={<>Custom Content</>} />
        </MockedProvider>
      )
      expect(getByText('Custom Content')).toBeInTheDocument()
    })

    it('should show children', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <PageWrapper title="Page title">
            <div data-testid="test">Hello</div>
          </PageWrapper>
        </MockedProvider>
      )
      expect(getByTestId('test')).toHaveTextContent('Hello')
    })

    it('should show the drawer on the left', () => {
      const { getAllByRole, getByTestId, getByText } = render(
        <MockedProvider>
          <PageWrapper title="Page title" />
        </MockedProvider>
      )
      expect(getAllByRole('button')[0]).toContainElement(
        getByTestId('ChevronRightIcon')
      )
      fireEvent.click(getAllByRole('button')[0])
      expect(getByText('Discover')).toBeInTheDocument()
    })
  })

  describe('smDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should show the drawer on mobile view', () => {
      const { getAllByRole, getByTestId, getByText } = render(
        <MockedProvider>
          <PageWrapper title="Active Journeys" />
        </MockedProvider>
      )
      expect(getByText('Active Journeys')).toBeInTheDocument()
      const button = getAllByRole('button')[0]
      expect(button).toContainElement(getByTestId('Menu1Icon'))
      fireEvent.click(button)
      expect(getByText('Discover')).toBeInTheDocument()
    })

    it('should not show the drawer on mobile view', () => {
      const { queryByTestId, getByText } = render(
        <MockedProvider>
          <PageWrapper title="Journey Edit" />
        </MockedProvider>
      )
      expect(getByText('Journey Edit')).toBeInTheDocument()
      expect(queryByTestId('Menu1Icon')).not.toBeInTheDocument()
    })
  })
})
