export function Badge({ children, tone = 'neutral' }) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-800 ring-slate-200',
    success: 'bg-green-50 text-green-800 ring-green-100',
    warn: 'bg-amber-50 text-amber-900 ring-amber-100',
    accent: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[tone] || styles.neutral
      }`}
    >
      {children}
    </span>
  )
}

