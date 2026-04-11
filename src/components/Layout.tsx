import Sidebar from './Sidebar'

interface Props {
  active: string
  onNavigate: (page: string) => void
  children: React.ReactNode
}

export default function Layout({ active, onNavigate, children }: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      <Sidebar active={active} onNavigate={onNavigate} />
      <main style={{ flex: 1, padding: 32, overflow: 'auto', paddingBottom: 80 }}>
        {children}
      </main>
    </div>
  )
}