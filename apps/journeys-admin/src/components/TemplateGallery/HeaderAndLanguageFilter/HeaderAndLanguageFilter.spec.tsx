import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { getLanguagesMock } from '../data'

import { HeaderAndLanguageFilter } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('HeaderAndLanguageFilter', () => {
  it('should open the language filter popper on button click', async () => {
    const onChange = jest.fn()
    const push = jest.fn()
    const on = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole, getAllByRole, getAllByText, getByTestId } = render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <HeaderAndLanguageFilter selectedLanguageIds={[]} onChange={onChange} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getAllByText('Journey Templates')[0]).toBeInTheDocument()
    })
    // "All Languages" text is handled by the translation file /locale/en/journeys-admin.json
    // Manually add the below line to the translation file if can't find the text
    // "<0>Journey Templates</0><1>in</1><2>{{firstLanguage}}</2>_zero": "<0>Journey Templates</0><1>in</1><2>All Languages</2>"
    fireEvent.click(getAllByRole('heading', { name: 'All Languages' })[0])
    fireEvent.click(getByRole('button', { name: 'German, Standard Deutsch' }))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    fireEvent.click(getByRole('button', { name: 'French Français' }))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2))
    fireEvent.click(getByTestId('PresentationLayer'))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(3))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'template-language' }
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
