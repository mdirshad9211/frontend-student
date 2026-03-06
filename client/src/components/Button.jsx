export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed'

  const styles = {
    primary: 'bg-emerald-700 text-white hover:bg-emerald-600',
    secondary: 'bg-gray-900 text-gray-100 hover:bg-gray-800',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 shadow-none',
    amber: 'bg-amber-400 text-gray-900 hover:bg-amber-300',
    danger: 'bg-purple-600 text-white hover:bg-purple-500',
  }

  return (
    <button type={type} className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}

