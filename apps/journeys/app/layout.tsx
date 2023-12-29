import type { EmotionCache } from '@emotion/cache'
import createEmotionServer from '@emotion/server/create-instance'
// import { Theme } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import type { AppType, Enhancer } from 'next/dist/shared/lib/utils'
import React, { FunctionComponent, ReactElement, ReactNode } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import Html from './Html'
// import { getTheme } from '@core/shared/ui/themes'

// import { ThemeMode, ThemeName } from '../__generated__/globalTypes'

export default function RootLayout({ children }) {
  return <Html>{children}</Html>
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
// MyDocument.getInitialProps = async (ctx) => {
//   // Resolution order
//   //
//   // On the server:
//   // 1. app.getInitialProps
//   // 2. page.getInitialProps
//   // 3. document.getInitialProps
//   // 4. app.render
//   // 5. page.render
//   // 6. document.render
//   //
//   // On the server with error:
//   // 1. document.getInitialProps
//   // 2. app.render
//   // 3. page.render
//   // 4. document.render
//   //
//   // On the client
//   // 1. app.getInitialProps
//   // 2. page.getInitialProps
//   // 3. app.render
//   // 4. page.render

//   const originalRenderPage = ctx.renderPage

//   // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
//   // However, be aware that it can have global side effects.
//   // const cache = createEmotionCache({})
//   // const { extractCriticalToChunks } = createEmotionServer(cache)

//   let pageProps

//   ctx.renderPage = async () =>
//     await originalRenderPage({
//       enhanceApp: ((App: FunctionComponent<{ emotionCache: EmotionCache }>) => {
//         return function EnhanceApp(props) {
//           pageProps = props.pageProps.journey
//           return <App emotionCache={cache} {...props} />
//         }
//       }) as unknown as Enhancer<AppType>
//     })

//   const initialProps = await Document.getInitialProps(ctx)
//   // This is important. It prevents emotion to render invalid HTML.
//   // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
//   const emotionStyles = extractCriticalToChunks(initialProps.html)
//   const emotionStyleTags = emotionStyles.styles.map((style) => (
//     <style
//       data-emotion={`${style.key} ${style.ids.join(' ')}`}
//       key={style.key}
//       // eslint-disable-next-line react/no-danger
//       dangerouslySetInnerHTML={{ __html: style.css }}
//     />
//   ))

//   return {
//     ...initialProps,
//     emotionStyleTags,
//     rtl,
//     locale
//   }
// }
