import { useEffect, useRef } from 'react'

const client = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-8634725418414073'

export function AdSlot({ slot = import.meta.env.VITE_ADSENSE_SLOT_CONTENT, className = '' }) {
  const requested = useRef(false)

  useEffect(() => {
    if (!slot || requested.current || !window.adsbygoogle) return
    try {
      window.adsbygoogle.push({})
      requested.current = true
    } catch {
      // Ad blockers and duplicate requests must not affect the page content.
    }
  }, [slot])

  if (!slot) return null

  return (
    <aside className={`my-10 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 ${className}`} aria-label="Advertisement">
      <div className="px-2 pb-1 text-center text-[10px] font-medium uppercase tracking-wider text-slate-400">Advertisement</div>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}