import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chácara dos Sonhos - Aluguel para Eventos',
  description: 'Chácara perfeita para seus eventos especiais. Aniversários, casamentos, confraternizações e muito mais.',
  keywords: 'chácara, aluguel, eventos, aniversário, casamento, confraternização',
  authors: [{ name: 'Chácara dos Sonhos' }],
  openGraph: {
    title: 'Chácara dos Sonhos - Aluguel para Eventos',
    description: 'Chácara perfeita para seus eventos especiais. Aniversários, casamentos, confraternizações e muito mais.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
