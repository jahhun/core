import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import { Handle, OnConnect, Position } from 'reactflow'

export const NODE_WIDTH = 150
export const NODE_HEIGHT = 80

interface BaseNodeProps {
  isTargetConnectable?: boolean
  isSourceConnectable?: boolean
  onSourceConnect?: OnConnect
  icon: ReactNode
  title: string
  selected?: 'descendant' | boolean
}

export function BaseNode({
  isTargetConnectable,
  isSourceConnectable,
  onSourceConnect,
  icon,
  title,
  selected = false
}: BaseNodeProps): ReactElement {
  return isTargetConnectable !== false ? (
    <Card
      sx={{
        borderRadius: 1,
        outline: '2px solid',
        outlineColor: (theme) =>
          selected === true
            ? theme.palette.primary.main
            : selected === 'descendant'
            ? theme.palette.divider
            : 'transparent',
        outlineOffset: '5px'
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          gap: 2
        }}
      >
        {icon}
        <Typography
          sx={{
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '2',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>
      </CardContent>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 15,
          height: 15,
          background: '#3b3b3b',
          borderRadius: '20%'
        }}
      />
      {isSourceConnectable !== false && (
        <Handle
          type="source"
          position={Position.Right}
          onConnect={onSourceConnect}
          style={{
            width: '15px',
            height: '15px',
            borderRadius: '20%',
            background: '#3b3b3b'
          }}
        />
      )}
    </Card>
  ) : (
    <Box
      sx={{
        borderRadius: 1,
        outline: '2px solid',
        outlineColor: (theme) =>
          selected === true
            ? theme.palette.primary.main
            : selected === 'descendant'
            ? theme.palette.divider
            : 'transparent',
        outlineOffset: '5px'
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          gap: 2
        }}
      >
        {icon}
        <Typography
          sx={{
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '2',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>
      </CardContent>
      <Handle
        type="source"
        position={Position.Right}
        onConnect={onSourceConnect}
        style={{
          width: '15px',
          height: '15px',
          background: '#3b3b3b'
        }}
      />
    </Box>
  )
}
