export function DataTable({ columns, rows, rowKey = 'id', emptyText = 'No data' }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 first:rounded-tl-2xl last:rounded-tr-2xl"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r) => (
              <tr
                key={String(r[rowKey])}
                className="border-t border-gray-100 even:bg-gray-50/40 hover:bg-emerald-50/40 transition-colors"
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-gray-800 align-top">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-600">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

