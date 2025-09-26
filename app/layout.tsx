import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Espaço Vip JR - Aluguel para Eventos',
  description: 'Espaço perfeito para seus eventos especiais. Aniversários, casamentos, confraternizações e muito mais.',
  keywords: 'espaço, chácara, aluguel, eventos, aniversário, casamento, confraternização',
  authors: [{ name: 'Espaço Vip JR' }],
  openGraph: {
    title: 'Espaço Vip JR - Aluguel para Eventos',
    description: 'Espaço perfeito para seus eventos especiais. Aniversários, casamentos, confraternizações e muito mais.',
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
