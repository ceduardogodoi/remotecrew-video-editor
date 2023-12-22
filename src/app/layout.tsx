import type { PropsWithChildren } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './styles.scss'

const inter = Inter({
  variable: '--ff-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Challenge - Video Editor',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
