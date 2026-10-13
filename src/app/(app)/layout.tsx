'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { PageTransition } from '@/components/layout/PageTransition'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d0d' }}>

      <Sidebar />

      <div style={{
        marginLeft: '260px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: '100vh',
      }}>
        <Header />
        <main style={{ flex: 1, padding: '24px' }}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
