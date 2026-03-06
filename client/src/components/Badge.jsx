export function Badge({ children, tone = 'neutral' }) {
  const styles = {
    neutral: 'bg-gray-100 text-gray-800 ring-gray-200',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    warn: 'bg-amber-50 text-amber-900 ring-amber-100',
    accent: 'bg-purple-50 text-purple-800 ring-purple-100',
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

