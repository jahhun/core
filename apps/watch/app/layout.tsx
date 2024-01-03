// import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { ReactNode } from 'react'

// import { ApolloWrapper } from '../src/libs/apolloClient/apolloWrapper'

// import WatchApp from './WatchApp'

export default function RootLayout({ children }): ReactNode {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap"
          rel="stylesheet"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/watch/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/watch/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/watch/favicon-32x32.png"
        />
        <link rel="manifest" href="/watch/site.webmanifest" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </head>
      <body style={{ margin: 0 }}>
        {/* <AppRouterCacheProvider> */}
        {/* <ApolloWrapper> */}
        {/* <WatchApp>{children}</WatchApp> */}
        {children}
        {/* </ApolloWrapper> */}
        {/* </AppRouterCacheProvider> */}
      </body>
    </html>
  )
}
