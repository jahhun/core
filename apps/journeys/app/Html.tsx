import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { ReactNode } from 'react'

export default function Html({
  rtl = false,
  locale = 'en',
  children
}): ReactNode {
  return (
    <html lang="en" dir={rtl ? 'rtl' : ''}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {rtl && locale !== 'ur' ? (
          <>
            <link
              href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&family=Tajawal:wght@400;700&display=swap"
              rel="stylesheet"
            />
            <link
              href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&family=Tajawal:wght@400;700&display=swap"
              rel="preload"
              as="style"
            />
          </>
        ) : (
          <>
            <link
              href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap"
              rel="stylesheet"
            />
            <link
              href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap"
              rel="preload"
              as="style"
            />
          </>
        )}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="theme-color"
          content={this.theme.palette.background.default}
        />
        {/* Inject MUI styles first to match with the prepend: true configuration. */}
        {this.props.emotionStyleTags}
      </head>
      <body>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  )
}
