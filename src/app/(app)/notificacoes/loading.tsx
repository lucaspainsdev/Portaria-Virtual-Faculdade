export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ height: 36, width: 220, background: '#1a1a1a', borderRadius: 8 }} className='animate-pulse' />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ height: 36, width: 160, background: '#1a1a1a', borderRadius: 8 }} className='animate-pulse' />
          <div style={{ height: 36, width: 200, background: '#1a1a1a', borderRadius: 8 }} className='animate-pulse' />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map((g) => (
          <div key={g}>
            <div style={{ height: 16, width: 120, background: '#1a1a1a', borderRadius: 4, marginBottom: 10 }} className='animate-pulse' />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 80, background: '#111', border: '1px solid #222', borderRadius: 12 }} className='animate-pulse' />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
