import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'EventAccess - Tu entrada al mejor entretenimiento',
    template: '%s | EventAccess'
  },
  description: 'Descubre y compra entradas para los mejores eventos: conciertos, festivales, teatro y mas. Tickets seguros con codigo QR.',
  keywords: ['eventos', 'tickets', 'conciertos', 'festivales', 'entradas', 'qr'],
  authors: [{ name: 'EventAccess' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'EventAccess',
    title: 'EventAccess - Tu entrada al mejor entretenimiento',
    description: 'Descubre y compra entradas para los mejores eventos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventAccess',
    description: 'Tu entrada al mejor entretenimiento',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          closeButton
          theme="dark"
        />
        <Analytics />
      </body>
    </html>
  )
}
