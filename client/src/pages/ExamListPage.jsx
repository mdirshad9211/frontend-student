import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Search } from 'lucide-react'

import { Container } from '../components/Container'
import { Card, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import { Skeleton } from '../components/Skeleton'
import { listExams, getEligible } from '../features/exams/examsApi'
import { listUserExams } from '../features/userExams/userExamsApi'
import { useAuth } from '../store/authStore'
import { formatDate, daysUntil } from '../utils/date'
import { sanitizeForDisplay } from '../utils/sanitizeDisplay'
import { isOfficialUrl } from '../utils/url'
import { getSelectedState } from '../utils/stateFilter'

function ExamCard({ exam, section = 'exam' }) {
  const cycle = exam.latestCycle
  const d = cycle?.applicationEnd ? daysUntil(cycle.applicationEnd) : null
  const isActive = cycle && d !== null && d >= 0
  const isExpired = cycle && d !== null && d < 0
  const name = sanitizeForDisplay(exam.name, 110)
  const conductingBody = sanitizeForDisplay(exam.conductingBody, 100)
  const category = exam.category || 'Other'
  const states = Array.isArray(exam.states) ? exam.states.slice(0, 2) : []
  const start = cycle?.applicationStart ? formatDate(cycle.applicationStart) : null
  const end = cycle?.applicationEnd ? formatDate(cycle.applicationEnd) : null
  const examDate = cycle?.examDate ? formatDate(cycle.examDate) : null
  const resultLink = exam.latestResultLink && isOfficialUrl(exam.latestResultLink) ? exam.latestResultLink : null
  const admitLink = exam.latestAdmitCardLink && isOfficialUrl(exam.latestAdmitCardLink) ? exam.latestAdmitCardLink : null

  let statusLabel = 'Cycle info'
  let statusTone = 'neutral'
  if (cycle) {
    if (isActive) {
      statusLabel = 'Active'
      statusTone = 'success'
    } else if (isExpired) {
      statusLabel = 'Expired'
      statusTone = 'warn'
    }
  }

  return (
    <Card className="hover:shadow-md transition">
      <CardBody>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/exams/${exam._id}`} className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-700 block">
                {name || 'Government Exam'}
              </Link>
              {conductingBody ? <div className="mt-1 text-sm text-gray-600 line-clamp-1">{conductingBody}</div> : null}
              {category ? (
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {category}
                </div>
              ) : null}
              {states.length ? (
                <div className="mt-1 text-[11px] font-medium text-gray-500">
                  {states.join(', ')}
                </div>
              ) : null}
            </div>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>

          <div className="mt-4 grid gap-1.5 text-sm text-gray-700">
            <div className="flex flex-wrap gap-3">
              <span>
                <span className="font-semibold text-gray-900">Age</span> {exam.minAge}–{exam.maxAge}
              </span>
              <span>
                <span className="font-semibold text-gray-900">Education</span>{' '}
                {sanitizeForDisplay(exam.educationRequired, 60) || 'See notification'}
              </span>
            </div>
            {typeof exam.totalPosts === 'number' && exam.totalPosts > 0 ? (
              <div className="text-gray-600">
                <span className="font-semibold text-gray-900">Total posts</span> {exam.totalPosts}
              </div>
            ) : null}
            {cycle ? (
              <>
                <div className="text-gray-600">
                  <span className="font-semibold text-gray-900">Apply</span>{' '}
                  {start || '—'} {start && end ? '→' : null} {end || '—'}{' '}
                  {d !== null ? <span className="text-xs text-amber-700">({d} day(s))</span> : null}
                </div>
                {examDate ? (
                  <div className="text-gray-600">
                    <span className="font-semibold text-gray-900">Exam</span> {examDate}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-gray-600">No cycle added yet.</div>
            )}

            {section === 'result' ? (
              <div className="mt-2 text-gray-600">
                <span className="font-semibold text-gray-900">Result link</span>{' '}
                {resultLink ? 'available' : 'not available'}
              </div>
            ) : null}

            {section === 'admit_card' ? (
              <div className="mt-2 text-gray-600">
                <span className="font-semibold text-gray-900">Admit card link</span>{' '}
                {admitLink ? 'available' : 'not available'}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-end gap-3">
            <Link to={`/exams/${exam._id}`} className="text-sm font-semibold text-slate-700 hover:text-indigo-700">
              View details
            </Link>
          {section === 'result' && resultLink ? (
            <div className="text-right">
              <a href={resultLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-700 hover:text-indigo-600">
                Download result
              </a>
            </div>
          ) : null}

          {section === 'admit_card' && admitLink ? (
            <div className="text-right">
              <a href={admitLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-700 hover:text-indigo-600">
                Download admit card
              </a>
            </div>
          ) : null}
          </div>
        </CardBody>
      </Card>
  )
}

const FILTER_LABELS = {
  eligible: 'Eligible for you',
  active: 'Active forms',
  applied: 'Applied / Preparing',
  upcoming: 'Upcoming deadlines (7 days)',
}

export function ExamListPage({ forcedSection = null }) {
  const { isAuthed } = useAuth()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  const filterFromUrl = searchParams.get('filter') || ''
  const initialStatus = searchParams.get('status') || 'all'
  const initialCategory = searchParams.get('category') || 'all'
  const initialState = searchParams.get('state') || getSelectedState() || 'all'
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [categoryFilter, setCategoryFilter] = useState(initialCategory)
  const [stateFilter, setStateFilter] = useState(initialState)

  const viewFilter = ['eligible', 'active', 'applied', 'upcoming'].includes(filterFromUrl) ? filterFromUrl : null
  const section = forcedSection || searchParams.get('section') || 'exam'

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (viewFilter && isAuthed) {
          if (viewFilter === 'eligible' || viewFilter === 'active') {
            const data = await getEligible().catch(() => ({ eligibleExams: [], activeForms: [] }))
            if (!active) return
            setItems(viewFilter === 'eligible' ? (data.eligibleExams || []) : (data.activeForms || []))
          } else if (viewFilter === 'applied' || viewFilter === 'upcoming') {
            const data = await listUserExams().catch(() => ({ userExams: [] }))
            if (!active) return
            const list = (data.userExams || []).filter((x) => x.exam)
            const filtered =
              viewFilter === 'applied'
                ? list.filter((x) => x.status === 'applied' || x.status === 'preparing')
                : list.filter((x) => {
                    const d = x.latestCycle?.applicationEnd ? daysUntil(x.latestCycle.applicationEnd) : null
                    return d !== null && d >= 0 && d <= 7
                  })
            setItems(filtered.map((x) => ({ ...x.exam, latestCycle: x.latestCycle })))
          }
        } else {
          const params = {}
          if (stateFilter !== 'all') params.state = stateFilter
          const data = await listExams(params)
          if (!active) return
          setItems(data.exams || [])
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [viewFilter, isAuthed, stateFilter])

  const categories = useMemo(() => {
    const set = new Set()
    items.forEach((e) => {
      if (e.category) set.add(e.category)
    })
    return Array.from(set).sort()
  }, [items])

  const states = useMemo(() => {
    const set = new Set()
    items.forEach((e) => {
      if (Array.isArray(e.states)) {
        e.states.forEach((s) => {
          if (s) set.add(s)
        })
      }
    })
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const now = new Date()

    return items.filter((e) => {
      const text = `${e.name} ${e.conductingBody} ${e.category || ''}`.toLowerCase()
      if (q && !text.includes(q)) return false

      // category filter
      const cat = e.category || 'Other'
      if (categoryFilter !== 'all' && cat !== categoryFilter) return false
      if (stateFilter !== 'all') {
        const examStates = Array.isArray(e.states) ? e.states : []
        if (!examStates.includes(stateFilter) && !examStates.includes('All India')) return false
      }

      // status filter based on latest cycle
      const cycle = e.latestCycle
      let isActive = false
      let isUpcoming = false
      let isExpired = false

      if (cycle && cycle.applicationEnd) {
        const start = cycle.applicationStart ? new Date(cycle.applicationStart) : null
        const end = new Date(cycle.applicationEnd)
        if (start && start > now) isUpcoming = true
        if (start && start <= now && end >= now) isActive = true
        if (end < now) isExpired = true
      }

      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'upcoming' && !isUpcoming) return false
      if (statusFilter === 'expired' && !isExpired) return false

      if (section === 'result' && !(e.latestResultDeclaredAt || e.latestResultLink)) return false
      if (section === 'admit_card' && !(e.latestAdmitCardReleasedAt || e.latestAdmitCardLink)) return false

      return true
    })
  }, [items, query, categoryFilter, statusFilter, stateFilter, section])

  function updateStatusFilter(next) {
    setStatusFilter(next)
    const nextParams = new URLSearchParams(searchParams)
    if (next === 'all') nextParams.delete('status')
    else nextParams.set('status', next)
    setSearchParams(nextParams)
  }

  function updateCategoryFilter(next) {
    setCategoryFilter(next)
    const nextParams = new URLSearchParams(searchParams)
    if (next === 'all') nextParams.delete('category')
    else nextParams.set('category', next)
    setSearchParams(nextParams)
  }

  function updateStateFilter(next) {
    setStateFilter(next)
    const nextParams = new URLSearchParams(searchParams)
    if (next === 'all') nextParams.delete('state')
    else nextParams.set('state', next)
    setSearchParams(nextParams)
  }

  return (
    <div className="py-10">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-indigo-700">{section === 'result' ? 'RESULTS' : section === 'admit_card' ? 'ADMIT CARDS' : 'EXAMS'}</div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
              {section === 'result'
                ? 'Latest results'
                : section === 'admit_card'
                  ? 'Latest admit cards'
                  : viewFilter
                    ? FILTER_LABELS[viewFilter]
                    : 'Browse government exams'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {viewFilter && !isAuthed
                ? 'Login to see exams tailored to you. Showing all exams for now.'
                : viewFilter
                  ? `Only ${FILTER_LABELS[viewFilter].toLowerCase()}.`
                  : 'Open an exam to see eligibility, dates, and official apply link.'}
            </div>
          </div>
          <div className="w-full md:w-96">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exams, bodies, categories…"
                className="w-full rounded-xl bg-white pl-9 pr-3 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500/40 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter size={14} className="text-indigo-600" />
              <span className="text-sm font-semibold">Status</span>
            </div>
            <div className="inline-flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'expired', label: 'Expired' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => updateStatusFilter(opt.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                    statusFilter === opt.key
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" aria-hidden />

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => updateCategoryFilter(e.target.value)}
              className="min-w-50 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              {categories.length === 0 ? <option disabled>No categories yet</option> : null}
            </select>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" aria-hidden />

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">State</span>
            <select
              value={stateFilter}
              onChange={(e) => updateStateFilter(e.target.value)}
              className="min-w-50 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer"
              aria-label="Filter by state"
            >
              <option value="all">All states</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              {states.length === 0 ? <option disabled>No state tags yet</option> : null}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} className="h-36" />)
            : filtered.map((exam) => <ExamCard key={exam._id} exam={exam} section={section} />)}
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


