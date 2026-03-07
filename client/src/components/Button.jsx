export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed'

  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
    ghost: 'bg-transparent text-slate-800 hover:bg-slate-100 shadow-none',
    amber: 'bg-amber-400 text-slate-900 hover:bg-amber-300',
    orange: 'bg-orange-500 text-white hover:bg-orange-400 shadow-md',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }

  return (
    <button type={type} className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}

