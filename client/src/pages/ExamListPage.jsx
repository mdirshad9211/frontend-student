import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

import { Container } from '../components/Container'
import { Card, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Skeleton } from '../components/Skeleton'
import { listExams } from '../features/exams/examsApi'
import { formatDate, daysUntil } from '../utils/date'

function ExamCard({ exam }) {
  const cycle = exam.latestCycle
  const d = cycle?.applicationEnd ? daysUntil(cycle.applicationEnd) : null
  const active = cycle && d !== null && d >= 0

  return (
    <Link to={`/exams/${exam._id}`} className="block">
      <Card className="hover:shadow-md transition">
        <CardBody>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">{exam.name}</div>
              <div className="mt-1 text-sm text-gray-600">{exam.conductingBody}</div>
            </div>
            {active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Cycle info</Badge>}
          </div>

          <div className="mt-4 grid gap-2 text-sm text-gray-700">
            <div>
              <span className="font-semibold text-gray-900">Age</span> {exam.minAge}–{exam.maxAge}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Education</span> {exam.educationRequired}
            </div>
            {cycle ? (
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">Application ends</span> {formatDate(cycle.applicationEnd)}{' '}
                {d !== null ? <span className="text-xs">({d} day(s))</span> : null}
              </div>
            ) : (
              <div className="text-gray-600">No cycle added yet.</div>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}

export function ExamListPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listExams()
        if (!active) return
        setItems(data.exams || [])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((e) => `${e.name} ${e.conductingBody} ${e.category || ''}`.toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className="py-10">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-emerald-700">EXAMS</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Browse government exams</div>
            <div className="mt-2 text-sm text-gray-600">Open an exam to see eligibility, dates, and official apply link.</div>
          </div>
          <div className="w-full md:w-96">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exams, bodies, categories…"
                className="w-full rounded-xl bg-white pl-9 pr-3 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-emerald-600/40 outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} className="h-36" />)
            : filtered.map((exam) => <ExamCard key={exam._id} exam={exam} />)}
        </div>

        {!loading && filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-6 text-sm text-gray-600 shadow-sm ring-1 ring-gray-200/80">
            No exams found for your search.
          </div>
        ) : null}
      </Container>
    </div>
  )
}

