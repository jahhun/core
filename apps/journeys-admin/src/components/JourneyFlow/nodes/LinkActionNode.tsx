import { ComponentProps, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NodeProps } from 'reactflow'

import Link from '@core/shared/ui/icons/Link'

import { BaseNode } from './BaseNode'

export type LinkActionNodeData = {
  __typename: 'LinkAction'
  parentBlockId: string
  gtmEventName: string | null
  url: string
}

export function LinkActionNode({
  data: action
}: NodeProps<LinkActionNodeData>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <BaseNode
      title={action.url}
      icon={<Link />}
      isSourceConnectable={false}
      isTargetEnabled={false}
    />
  )
}
