import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { MockStoreProvider } from '@/components/providers/MockStoreProvider'
import './globals.css'

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Assigna — Gestión de Voluntarios',
  description: 'Coordina tu equipo de voluntarios sin esfuerzo. Asignación automática por zonas, panel de control en tiempo real y reportes automatizados.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontSans.variable}>
      <body className="antialiased">
        <MockStoreProvider>
          {children}
        </MockStoreProvider>
      </body>
    </html>
  )
}
