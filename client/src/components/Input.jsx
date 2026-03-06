export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label ? <div className="mb-1 text-sm font-medium text-gray-900">{label}</div> : null}
      <input
        {...props}
        className={`w-full rounded-xl bg-white px-3 py-2 text-sm text-gray-900 ring-1 ring-inset ${
          error ? 'ring-purple-500' : 'ring-gray-200'
        } focus:ring-2 focus:ring-emerald-600/40 outline-none transition`}
      />
      {error ? <div className="mt-1 text-xs text-purple-600">{error}</div> : null}
    </div>
  )
}

