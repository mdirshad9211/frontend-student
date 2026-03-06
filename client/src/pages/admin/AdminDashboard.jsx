import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Card, CardBody } from '../../components/Card'
import { Button } from '../../components/Button'
import {
  adminListExams,
  adminListExamCycles,
  adminListUsers,
  adminRunSarkariScraper,
} from '../../features/admin/adminApi'

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ exams: 0, cycles: 0, users: 0 })
  const [syncing, setSyncing] = useState(false)

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

  async function runSync() {
    setSyncing(true)
    try {
      const res = await adminRunSarkariScraper(40)
      toast.success(
        `Synced ${res.createdExams || 0} exams / ${res.createdCycles || 0} cycles (skipped ${res.skippedCycles || 0})`
      )
      const [ex, cy] = await Promise.all([adminListExams(), adminListExamCycles()])
      setCounts((prev) => ({
        ...prev,
        exams: ex?.exams?.length || prev.exams,
        cycles: cy?.examCycles?.length || prev.cycles,
      }))
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Sync failed'
      toast.error(msg)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <div className="text-xs font-semibold tracking-wide text-emerald-700">ADMIN</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Dashboard</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <span>Manage exams, cycles, and users.</span>
        <Button variant="secondary" onClick={runSync} disabled={syncing}>
          {syncing ? 'Syncing from SarkariResult…' : 'Sync from SarkariResult'}
        </Button>
      </div>

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

