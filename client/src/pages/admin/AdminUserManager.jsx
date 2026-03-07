import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/Badge'
import { adminListUsers } from '../../features/admin/adminApi'
import { formatDate } from '../../utils/date'
import { getEducationLabel } from '../../utils/education'

export function AdminUserManager() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await adminListUsers()
        if (!active) return
        setUsers(data.users || [])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (r) => <Badge tone={r.role === 'admin' ? 'accent' : 'neutral'}>{r.role}</Badge> },
      { key: 'state', label: 'State', render: (r) => r.state || '—' },
      { key: 'education', label: 'Education', render: (r) => getEducationLabel(r.education) || '—' },
      { key: 'dob', label: 'DOB', render: (r) => formatDate(r.dob) },
      { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
    ],
    []
  )

  return (
    <div>
      <div className="text-xs font-semibold tracking-wide text-indigo-700">ADMIN</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Users</div>
      <div className="mt-2 text-sm text-gray-600">View registered users.</div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={loading ? [] : users}
          rowKey="id"
          emptyText={loading ? 'Loading…' : 'No users'}
        />
      </div>
    </div>
  )
}

