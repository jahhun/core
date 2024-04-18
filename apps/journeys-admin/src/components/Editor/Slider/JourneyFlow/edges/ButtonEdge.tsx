import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { ReactElement } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath
} from 'reactflow'

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd
}: EdgeProps): ReactElement {
  const theme = useTheme()
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  const handleClick = (params): void => {
    console.log('button clicked! ' + id)
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          <IconButton className="edgebutton" onClick={handleClick}>
            <AddCircleRoundedIcon
              sx={{
                color: theme.palette.success.main
              }}
            />
          </IconButton>
        </Box>
      </EdgeLabelRenderer>
    </>
  )
}
