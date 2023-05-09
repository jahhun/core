import { ReactElement, ReactNode } from 'react'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineDot from '@mui/lab/TimelineDot'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { format, parseISO } from 'date-fns'
import { getEventVariant, EventVariant } from '../../utils'

interface Props {
  createdAt?: string
  label?: string | null
  value?: string | ReactNode | null
  icon?: ReactElement
  activity?: string
  duration?: string
  variant?: EventVariant
}

export function GenericEvent({
  icon,
  createdAt,
  label,
  value,
  activity,
  duration,
  variant = EventVariant.default
}: Props): ReactElement {
  const {
    textAlign,
    durationColor,
    activityColor,
    valueColor,
    iconColor,
    durationVariant,
    activityVariant,
    valueVariant
  } = getEventVariant(variant)

  return (
    <TimelineItem>
      {/* Time */}
      <TimelineOppositeContent
        sx={{
          display: 'flex',
          alignItems: textAlign,
          justifyContent: 'center',
          px: 0,
          minWidth: '46px',
          maxWidth: '46px'
        }}
      >
        <Typography variant={durationVariant} color={durationColor}>
          {createdAt != null ? format(parseISO(createdAt), 'p') : duration}
        </Typography>
      </TimelineOppositeContent>

      {/* Icon */}
      {icon != null ? (
        <TimelineSeparator>
          <TimelineDot
            sx={{
              color: iconColor,
              backgroundColor: 'transparent',
              boxShadow: 'none',
              m: 0
            }}
          >
            {icon}
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
      ) : (
        <Box sx={{ width: '36px' }} />
      )}

      <TimelineContent
        sx={{
          display: 'flex',
          alignItems: variant === 'title' ? 'center' : undefined
        }}
      >
        <Stack direction="column" sx={{ width: '100%' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ width: '100%' }}>
            {/* Activity */}
            {activity != null && (
              <Typography
                variant={activityVariant}
                color={activityColor}
                sx={{ fontWeight: 'bold' }}
              >
                {`${activity}\u00A0`}
              </Typography>
            )}
            {/* Label */}
            {label != null && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {label}
              </Typography>
            )}
          </Stack>
          {/* Value */}
          <Typography variant={valueVariant} color={valueColor}>
            {value}
          </Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  )
}
