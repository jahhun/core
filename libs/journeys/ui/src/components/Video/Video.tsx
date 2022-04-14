import videojs from 'video.js'
import { ReactElement, useEffect, useRef, useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { TreeBlock, useEditor } from '../..'
import { VideoResponseStateEnum } from '../../../__generated__/globalTypes'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { VideoResponseCreate } from './__generated__/VideoResponseCreate'
import { VideoTrigger } from './VideoTrigger'
import 'video.js/dist/video-js.css'
import { VideoFields } from './__generated__/VideoFields'

export const VIDEO_RESPONSE_CREATE = gql`
  mutation VideoResponseCreate($input: VideoResponseCreateInput!) {
    videoResponseCreate(input: $input) {
      state
      position
    }
  }
`

export function Video({
  id: blockId,
  video,
  autoplay,
  startAt,
  muted,
  posterBlockId,
  fullsize,
  children
}: TreeBlock<VideoFields>): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const posterBlock = children.find(
    (block) => block.id === posterBlockId && block.__typename === 'ImageBlock'
  ) as TreeBlock<ImageFields> | undefined

  const [videoResponseCreate] = useMutation<VideoResponseCreate>(
    VIDEO_RESPONSE_CREATE
  )
  const {
    state: { selectedBlock }
  } = useEditor()

  const handleVideoResponse = useCallback(
    (videoState: VideoResponseStateEnum, videoPosition?: number): void => {
      const position = videoPosition != null ? Math.floor(videoPosition) : 0

      void videoResponseCreate({
        variables: {
          input: {
            blockId,
            state: videoState,
            position
          }
        },
        optimisticResponse: {
          videoResponseCreate: {
            __typename: 'VideoResponse',
            state: videoState,
            position
          }
        }
      })
    },
    [blockId, videoResponseCreate]
  )

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: autoplay === true,
        controls: true,
        nativeControlsForTouch: true,
        userActions: {
          hotkeys: true,
          doubleClick: true
        },
        controlBar: {
          playToggle: true,
          captionsButton: true,
          subtitlesButton: true,
          remainingTimeDisplay: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true,
          volumePanel: {
            inline: true
          }
        },
        responsive: true,
        muted: muted === true
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(startAt ?? 0)
      })

      if (selectedBlock === undefined) {
        playerRef.current.on('playing', () => {
          handleVideoResponse(
            VideoResponseStateEnum.PLAYING,
            playerRef.current?.currentTime()
          )
        })
        playerRef.current.on('pause', () => {
          handleVideoResponse(
            VideoResponseStateEnum.PAUSED,
            playerRef.current?.currentTime()
          )
        })
        playerRef.current.on('ended', () => {
          if (playerRef?.current?.isFullscreen() === true)
            playerRef.current?.exitFullscreen()
          handleVideoResponse(
            VideoResponseStateEnum.FINISHED,
            playerRef.current?.currentTime()
          )
        })
      }
    }
  }, [
    handleVideoResponse,
    startAt,
    muted,
    autoplay,
    blockId,
    posterBlock,
    selectedBlock
  ])

  useEffect(() => {
    if (selectedBlock !== undefined) {
      playerRef.current?.pause()
    }
  }, [selectedBlock])

  return (
    <Box
      data-testid={`video-${blockId}`}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: 'inherit',
        backgroundColor: '#000000',
        borderRadius: 4,
        overflow: 'hidden',
        m: 0,
        position: fullsize === true ? 'absolute' : 'relative',
        top: fullsize === true ? 0 : null,
        right: fullsize === true ? 0 : null,
        bottom: fullsize === true ? 0 : null,
        left: fullsize === true ? 0 : null,
        outline: selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
        outlineOffset: fullsize === true ? '-3px' : null,
        '> .video-js': {
          width: '100%',
          display: 'flex',
          alignSelf: 'center',
          height: '100%',
          minHeight: 'inherit'
        },
        '> .MuiIconButton-root': {
          color: '#FFFFFF',
          position: 'absolute',
          bottom: 12,
          zIndex: 1,
          '&:hover': {
            color: '#FFFFFF'
          }
        }
      }}
    >
      {video?.variant?.hls != null ? (
        <>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
            poster={posterBlock?.src ?? undefined}
          >
            <source src={video.variant.hls} type="application/x-mpegURL" />
          </video>
          {children?.map(
            (option) =>
              option.__typename === 'VideoTriggerBlock' && (
                <VideoTrigger player={playerRef.current} {...option} />
              )
          )}
        </>
      ) : (
        <>
          <Paper
            sx={{
              borderRadius: (theme) => theme.spacing(4),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              fontSize: 100,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundImage:
                posterBlock?.src != null ? `url(${posterBlock.src})` : undefined
            }}
            elevation={0}
            variant="outlined"
          >
            <VideocamRounded fontSize="inherit" />
          </Paper>
        </>
      )}
    </Box>
  )
}
