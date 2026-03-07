export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={className}>
      {label ? <div className="mb-1 text-sm font-medium text-gray-900">{label}</div> : null}
      <select
        {...props}
        className={`w-full rounded-xl bg-white px-3 py-2 text-sm text-gray-900 ring-1 ring-inset ${
          error ? 'ring-rose-400' : 'ring-slate-200'
        } focus:ring-2 focus:ring-indigo-500/40 outline-none transition`}
      >
        {children}
      </select>
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </div>
  )
}

