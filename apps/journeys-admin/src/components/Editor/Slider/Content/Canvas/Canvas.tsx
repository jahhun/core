import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement, useMemo, useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import {
  ActiveCanvasDetailsDrawer,
  ActiveFab,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { FramePortal } from '../../../../FramePortal'
import { Fab } from '../../../Fab'

import { CardWrapper } from './CardWrapper'
import { FormWrapper } from './FormWrapper'
import { InlineEditWrapper } from './InlineEditWrapper'
import { SelectableWrapper } from './SelectableWrapper'
import { VideoWrapper } from './VideoWrapper'

export function Canvas(): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // this ref handles if the mouseDown event of the onClick event's target is the card component
  const selectionRef = useRef(false)
  const {
    state: {
      selectedStep,
      selectedBlock,
      activeSlide,
      activeCanvasDetailsDrawer
    },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const router = useRouter()

  function handleFooterClick(): void {
    dispatch({
      type: 'SetActiveCanvasDetailsDrawerAction',
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Footer
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    dispatch({
      type: 'SetActiveFabAction',
      activeFab: ActiveFab.Add
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: undefined
    })

    router.query.param = 'step-footer'
    void router.push(router)
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed('Step Footer')
    })
  }

  const iframe = frameRef.current?.contentDocument
  // ??
  // frameRef.current?.contentWindow?.document

  let startY
  console.log(iframe)

  // iframe?.addEventListener('touchstart', function (event) {
  //   startY = event.touches[0].clientY
  //   // console.log('touch start')
  // })

  // iframe?.addEventListener(
  //   'touchmove',
  //   function (event) {
  //     //  console.log('touch move')
  //     // Calculate the distance moved vertically
  //     const deltaY = event.touches[0].clientY - startY

  //     // If the iframe content is not scrolled to the top and the user is swiping up,
  //     // or if the iframe content is not scrolled to the bottom and the user is swiping down,
  //     // allow the default behavior (scrolling within the iframe)
  //     if (
  //       (iframe.scrollTop !== 0 && deltaY > 0) ||
  //       (iframe.scrollTop + iframe.clientHeight !== iframe.scrollHeight &&
  //         deltaY < 0)
  //     ) {
  //       // console.log('returning from move')
  //       return
  //     }

  //     // Prevent pull-to-refresh behavior
  //     event.preventDefault()
  //   },
  //   { passive: false }
  // )

  iframe?.addEventListener(
    'touchmove',
    (e) => {
      // e.preventDefault()

      const targetElement = e.target as Element

      const scrollElement = 'CardOverlayContent'
      let isTouchInScrollableElement = false
      let currentElement: Element | null = targetElement
      while (currentElement !== null) {
        if (targetElement.getAttribute('data-testid') === scrollElement) {
          isTouchInScrollableElement = true
          break
        }
        currentElement = currentElement.parentElement
      }
      if (isTouchInScrollableElement) {
        console.log('Scrollable!')
        return
      }
      e.preventDefault()
    },
    { passive: false }
  )

  function handleSelectCard(): void {
    const iframeDocument =
      frameRef.current?.contentDocument ??
      frameRef.current?.contentWindow?.document

    console.log(iframeDocument)

    const selectedText = iframeDocument?.getSelection()?.toString()

    console.log(selectionRef)

    // if user is copying from typog blocks or text, keep focus on typog blocks
    if (selectedText != null && selectedText !== '' && !selectionRef.current) {
      return
    }
    // Prevent losing focus on empty input
    if (
      selectedBlock?.__typename === 'TypographyBlock' &&
      selectedBlock.content === ''
    ) {
      // reset click origin
      selectionRef.current = false
      return
    }
    dispatch({
      type: 'SetSelectedBlockAction',
      selectedBlock: selectedStep
    })
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
    })
    // reset click origin
    selectionRef.current = false
  }

  const theme =
    selectedStep != null ? getStepTheme(selectedStep, journey) : null

  const scale = useMemo(() => {
    if (containerRef.current != null) {
      return Math.min(
        containerRef.current?.clientWidth / 375,
        containerRef.current?.clientHeight / 670
      )
    }
    return 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current?.clientWidth, containerRef.current?.clientHeight])

  return (
    <Stack
      className="EditorCanvas"
      onClick={handleSelectCard}
      onMouseDown={() => {
        // click target was the card component and not it's children blocks
        selectionRef.current = true
      }}
      data-testid="EditorCanvas"
      direction="row"
      alignItems="flex-end"
      sx={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: { xs: 1, sm: activeSlide === ActiveSlide.Content ? 1 : 0 },
        transition: (theme) =>
          theme.transitions.create('flex-grow', { duration: 300 })
      }}
    >
      {selectedStep != null && theme != null && (
        <Stack
          direction="column"
          alignItems="flex-end"
          gap={1.5}
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            height: { xs: '100%', sm: 'auto' },
            pb: { xs: 5, sm: 0 },
            px: { xs: 3, sm: 0 },
            justifyContent: 'center'
          }}
        >
          <Box
            ref={containerRef}
            sx={{
              width: { xs: '100%', sm: 387 },
              height: { xs: '100%', sm: 682 },
              display: 'flex'
            }}
          >
            <Box
              data-testId="CanvasContainer"
              sx={{
                position: 'relative',
                left: '50%',
                top: '50%',
                width: 375,
                height: 670,
                transform: `translate(-50%, -50%) scale(${scale})`,
                borderRadius: 6,
                transition: (theme) =>
                  theme.transitions.create('border-color', {
                    duration: 200,
                    delay: 100,
                    easing: 'ease-out'
                  }),
                border: (theme) =>
                  selectedStep.id === selectedBlock?.id
                    ? `2px solid ${theme.palette.primary.main}`
                    : `2px solid ${theme.palette.background.default}`
              }}
            >
              <FramePortal
                width="100%"
                height="100%"
                dir={rtl ? 'rtl' : 'ltr'}
                // frameRef assists to see if user is copying text from typog blocks
                ref={frameRef}
              >
                <ThemeProvider {...theme} rtl={rtl} locale={locale}>
                  <TransitionGroup
                    component={Box}
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 5,
                      '& .card-enter': {
                        zIndex: 1,
                        opacity: 0
                      },
                      '& .card-enter-active': {
                        zIndex: 1,
                        opacity: 1
                      },
                      '& .card-enter-done': {
                        zIndex: 1,
                        opacity: 1
                      },
                      '& .card-exit': {
                        zIndex: 0,
                        opacity: 1
                      },
                      '& .card-exit-active': {
                        opacity: 1,
                        zIndex: 0
                      },
                      position: 'relative',
                      width: 'calc(100% - 8px)',
                      height: 'calc(100% - 8px)',
                      m: '4px'
                    }}
                  >
                    <CSSTransition
                      key={selectedStep.id}
                      timeout={300}
                      classNames="card"
                    >
                      <Stack
                        justifyContent="center"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          transition: (theme) =>
                            theme.transitions.create('opacity')
                        }}
                        data-testid={`step-${selectedStep.id}`}
                      >
                        <BlockRenderer
                          block={selectedStep}
                          wrappers={{
                            Wrapper: SelectableWrapper,
                            TypographyWrapper: InlineEditWrapper,
                            ButtonWrapper: InlineEditWrapper,
                            RadioQuestionWrapper: InlineEditWrapper,
                            RadioOptionWrapper: InlineEditWrapper,
                            TextResponseWrapper: InlineEditWrapper,
                            SignUpWrapper: InlineEditWrapper,
                            VideoWrapper,
                            CardWrapper,
                            FormWrapper
                          }}
                        />
                        <ThemeProvider
                          themeName={ThemeName.journeyUi}
                          themeMode={theme.themeMode}
                          rtl={rtl}
                          locale={locale}
                          nested
                        >
                          <StepFooter
                            sx={{
                              outline:
                                activeCanvasDetailsDrawer ===
                                ActiveCanvasDetailsDrawer.Footer
                                  ? '2px solid #C52D3A'
                                  : 'none',
                              outlineOffset: -4,
                              borderRadius: 5,
                              cursor: 'pointer'
                            }}
                            onFooterClick={handleFooterClick}
                          />
                        </ThemeProvider>
                      </Stack>
                    </CSSTransition>
                  </TransitionGroup>
                </ThemeProvider>
              </FramePortal>
            </Box>
          </Box>
          <Box sx={{ mr: 4 }}>
            <Fab variant="canvas" />
          </Box>
        </Stack>
      )}
    </Stack>
  )
}
