import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/site'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: 'Villa Aurora — espaço de eventos na Serra da Cantareira',
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
    title: 'Villa Aurora — um lugar inteiro para o seu dia',
    description: siteConfig.appDescription,
    url: siteConfig.siteUrl,
    siteName: 'Villa Aurora',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Villa Aurora — espaço de eventos na Serra da Cantareira',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Villa Aurora — um lugar inteiro para o seu dia',
    description: siteConfig.appDescription,
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  )
}
