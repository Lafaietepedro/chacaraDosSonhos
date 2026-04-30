import type { Metadata } from 'next'
import './globals.css'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: `${siteConfig.appName} - Reservas para espaços de eventos`,
  description: siteConfig.appDescription,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.appName }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: `${siteConfig.appName} - Reservas para espaços de eventos`,
    description: siteConfig.appDescription,
    url: siteConfig.siteUrl,
    siteName: siteConfig.appName,
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.appName} - Reservas para espaços de eventos`,
    description: siteConfig.appDescription,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
