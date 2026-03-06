import { useEffect, useState } from 'react'
import { Card, CardBody } from '../../components/Card'
import { adminListExams, adminListExamCycles, adminListUsers } from '../../features/admin/adminApi'

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ exams: 0, cycles: 0, users: 0 })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [ex, cy, us] = await Promise.all([adminListExams(), adminListExamCycles(), adminListUsers()])
        if (!active) return
        setCounts({
          exams: ex?.exams?.length || 0,
          cycles: cy?.examCycles?.length || 0,
          users: us?.users?.length || 0,
        })
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <div className="text-xs font-semibold tracking-wide text-emerald-700">ADMIN</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Dashboard</div>
      <div className="mt-2 text-sm text-gray-600">Manage exams, cycles, and users.</div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-sm font-semibold text-gray-900">Exams</div>
            <div className="mt-2 text-3xl font-extrabold">{loading ? '—' : counts.exams}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm font-semibold text-gray-900">Exam Cycles</div>
            <div className="mt-2 text-3xl font-extrabold">{loading ? '—' : counts.cycles}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm font-semibold text-gray-900">Users</div>
            <div className="mt-2 text-3xl font-extrabold">{loading ? '—' : counts.users}</div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

