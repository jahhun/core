import { Story, Meta } from '@storybook/react'
import {
  GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock
} from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { RadioQuestion } from './RadioQuestion'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { RADIO_QUESTION_RESPONSE_CREATE } from '.'

const children: Array<TreeBlock<RadioOptionBlock>> = [
  {
    __typename: 'RadioOptionBlock',
    label: 'Chat Privately',
    id: 'RadioOption1',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Get a bible',
    id: 'RadioOption2',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Watch more videos about Jesus',
    id: 'RadioOption3',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Ask a question',
    id: 'RadioOption4',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  }
]

const longLabel: Array<TreeBlock<RadioOptionBlock>> = [
  {
    __typename: 'RadioOptionBlock',
    label:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    id: 'RadioOption1',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label:
      'when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting',
    id: 'RadioOption2',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  }
]

const Demo = {
  ...journeysConfig,
  component: RadioQuestion,
  title: 'Journeys/Blocks/RadioQuestion'
}

const DefaultTemplate: Story<TreeBlock<RadioQuestionBlock>> = ({
  ...props
}) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: RADIO_QUESTION_RESPONSE_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'RadioQuestion1',
              radioOptionBlockId: 'RadioOption1'
            }
          }
        },
        result: {
          data: {
            radioQuestionResponseCreate: {
              id: 'uuid',
              radioOptionBlockId: 'RadioOption1'
            }
          }
        }
      }
    ]}
  >
    <RadioQuestion {...props} uuid={() => 'uuid'} />
  </MockedProvider>
)

export const Default: Story<TreeBlock<RadioQuestionBlock>> =
  DefaultTemplate.bind({})
Default.args = {
  id: 'RadioQuestion1',
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  children,
  parentBlockId: 'Step1'
}

export const Dark: Story<TreeBlock<RadioQuestionBlock>> = (props) => (
  <ThemeProvider themeMode={ThemeMode.dark} themeName={ThemeName.base}>
    <DefaultTemplate {...props} />
  </ThemeProvider>
)
Dark.args = {
  id: 'RadioQuestion1',
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  children,
  parentBlockId: 'Step1'
}

export const Long: Story<TreeBlock<RadioQuestionBlock>> = DefaultTemplate.bind(
  {}
)
Long.args = {
  id: 'RadioQuestion1',
  label: 'Have you accepted Jesus in your life?',
  description:
    'Have you declared that you want to accept Jesus in your life as your Lord and savior?',
  children: longLabel
}

export default Demo as Meta
