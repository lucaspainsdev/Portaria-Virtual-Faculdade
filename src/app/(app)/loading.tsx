export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ height: 36, width: 220, background: '#1a1a1a', borderRadius: 8 }} className='animate-pulse' />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 110, background: '#111', border: '1px solid #222', borderRadius: 12 }} className='animate-pulse' />
        ))}
      </div>
      <div style={{ height: 280, background: '#111', border: '1px solid #222', borderRadius: 12 }} className='animate-pulse' />
    </div>
  )
}
