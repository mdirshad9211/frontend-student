import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarClock, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react'

import { Container } from '../components/Container'
import { Card, CardBody, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { getEligible } from '../features/exams/examsApi'
import { listUserExams, upsertUserExam } from '../features/userExams/userExamsApi'
import { daysUntil, formatDate } from '../utils/date'

function ExamRow({ item, actionLabel, onAction }) {
  const cycle = item.latestCycle
  const d = cycle?.applicationEnd ? daysUntil(cycle.applicationEnd) : null
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/80 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
          {d !== null && d >= 0 ? (
            <Badge tone={d <= 2 ? 'warn' : 'success'}>Ends in {d} day(s)</Badge>
          ) : (
            <Badge tone="neutral">No active deadline</Badge>
          )}
        </div>
        <div className="mt-1 text-sm text-gray-600">{item.conductingBody}</div>
        {cycle ? (
          <div className="mt-2 text-xs text-gray-500">
            Apply: {formatDate(cycle.applicationStart)} → {formatDate(cycle.applicationEnd)}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link to={`/exams/${item._id}`}>
          <Button variant="ghost">View</Button>
        </Link>
        {cycle?.applyLink ? (
          <a href={cycle.applyLink} target="_blank" rel="noreferrer">
            <Button variant="secondary">
              Official link <ExternalLink size={16} className="ml-2" />
            </Button>
          </a>
        ) : null}
        {onAction ? (
          <Button onClick={onAction} className="whitespace-nowrap">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [eligible, setEligible] = useState([])
  const [activeForms, setActiveForms] = useState([])
  const [userExams, setUserExams] = useState([])
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [eligibleData, userExamsData] = await Promise.all([getEligible(), listUserExams()])
        if (!active) return
        setEligible(eligibleData.eligibleExams || [])
        setActiveForms(eligibleData.activeForms || [])
        setUserExams(userExamsData.userExams || [])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const applied = useMemo(
    () => (userExams || []).filter((x) => x.status === 'applied' || x.status === 'preparing'),
    [userExams]
  )

  const upcomingDeadlines = useMemo(() => {
    const all = []
    for (const x of userExams || []) {
      const cycle = x.latestCycle
      const d = cycle?.applicationEnd ? daysUntil(cycle.applicationEnd) : null
      if (d === null) continue
      if (d < 0) continue
      if (d <= 7) all.push({ ...x, days: d })
    }
    return all.sort((a, b) => a.days - b.days).slice(0, 8)
  }, [userExams])

  async function markApplied(examId) {
    setSavingId(examId)
    try {
      await upsertUserExam({ examId, status: 'applied' })
      const updated = await listUserExams()
      setUserExams(updated.userExams || [])
    } finally {
      setSavingId('')
    }
  }

  return (
    <Container>
      <div className="mb-6">
        <div className="text-xs font-semibold tracking-wide text-emerald-700">DASHBOARD</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Your exam overview</div>
        <div className="mt-2 text-sm text-gray-600">Eligibility, active forms, applied exams, and upcoming deadlines.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Eligible</div>
              <Sparkles className="text-emerald-700" size={18} />
            </div>
            <div className="mt-2 text-3xl font-extrabold">{loading ? '—' : eligible.length}</div>
            <div className="mt-1 text-xs text-gray-600">Exams matching your profile</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Active forms</div>
              <CalendarClock className="text-emerald-700" size={18} />
            </div>
            <div className="mt-2 text-3xl font-extrabold">{loading ? '—' : activeForms.length}</div>
            <div className="mt-1 text-xs text-gray-600">Currently open applications</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Applied / Preparing</div>
              <CheckCircle2 className="text-emerald-700" size={18} />
            </div>
            <div className="mt-2 text-3xl font-extrabold">{loading ? '—' : applied.length}</div>
            <div className="mt-1 text-xs text-gray-600">Your tracked progress</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Deadlines (7d)</div>
              <Bell className="text-emerald-700" size={18} />
            </div>
            <div className="mt-2 text-3xl font-extrabold">{loading ? '—' : upcomingDeadlines.length}</div>
            <div className="mt-1 text-xs text-gray-600">Upcoming closing dates</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader title="Eligible exams" subtitle="Exams that match your age and education." right={<Link to="/exams"><Button variant="ghost">Browse all</Button></Link>} />
          <CardBody>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : eligible.length ? (
              <div className="space-y-3">
                {eligible.slice(0, 6).map((e) => (
                  <ExamRow
                    key={e._id}
                    item={e}
                    actionLabel={savingId === e._id ? 'Saving…' : 'Mark as Applied'}
                    onAction={savingId === e._id ? null : () => markApplied(e._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                No eligible exams yet. Ensure your DOB and education are saved in <Link className="font-semibold text-emerald-700" to="/profile">Profile</Link>.
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Active forms" subtitle="Open application windows (latest cycle)." />
          <CardBody>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : activeForms.length ? (
              <div className="space-y-3">
                {activeForms.slice(0, 6).map((e) => (
                  <ExamRow key={e._id} item={e} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No active forms found right now.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Applied exams" subtitle="Your applied/preparing list." />
          <CardBody>
            {loading ? (
              <Skeleton className="h-24" />
            ) : applied.length ? (
              <div className="space-y-3">
                {applied.slice(0, 8).map((x) => (
                  <ExamRow key={x._id} item={{ ...x.exam, latestCycle: x.latestCycle }} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">You haven’t marked any exams as applied yet.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Upcoming deadlines" subtitle="Tracked exams closing within 7 days." />
          <CardBody>
            {loading ? (
              <Skeleton className="h-24" />
            ) : upcomingDeadlines.length ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((x) => (
                  <ExamRow key={x._id} item={{ ...x.exam, latestCycle: x.latestCycle }} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No upcoming deadlines in the next 7 days.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </Container>
  )
}

