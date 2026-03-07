import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Button } from '../components/Button'
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  ChartLine,
  UserCheck,
  Landmark,
  Train,
  GraduationCap,
  BookOpen,
  Target,
  ArrowRight,
  Flame,
  Calendar,
} from 'lucide-react'
import { useAuth } from '../store/authStore'
import { listExams } from '../features/exams/examsApi'
import { daysUntil, formatDate } from '../utils/date'
import { Skeleton } from '../components/Skeleton'
import { sanitizeForDisplay } from '../utils/sanitizeDisplay'
import { isOfficialUrl } from '../utils/url'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

function StatPill({ label, icon: Icon }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200/60 backdrop-blur-sm">
      {Icon ? <Icon size={14} className="text-indigo-600" /> : null}
      {label}
    </div>
  )
}

const POPULAR_CATEGORIES = [
  { name: 'UPSC', desc: 'Civil Services & allied', icon: Landmark, color: 'bg-gray-900' },
  { name: 'SSC', desc: 'Staff Selection Commission', icon: UserCheck, color: 'bg-indigo-600' },
  { name: 'Railway', desc: 'RRB, RRC recruitment', icon: Train, color: 'bg-amber-500' },
  { name: 'Banking', desc: 'IBPS, SBI, RBI exams', icon: ChartLine, color: 'bg-indigo-700' },
  { name: 'Defence', desc: 'Army, Navy, Air Force', icon: Target, color: 'bg-gray-700' },
  { name: 'Teaching', desc: 'KVS, NVS, TGT, PGT', icon: GraduationCap, color: 'bg-teal-600' },
]

const HOT_EXAMS_LIMIT = 14
const LIST_ITEM_HEIGHT = 56

export function LandingPage() {
  const { isAuthed, isAdmin } = useAuth()
  const primaryCtaHref = isAuthed ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/register'
  const primaryCtaLabel = isAuthed ? 'Go to dashboard' : 'Create free account'

  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  const now = useMemo(() => new Date(), [])
  const startOfToday = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    [now]
  )

  const { hotExams, categoryTables } = useMemo(() => {
    const active = []
    const byCategory = new Map()
    exams.forEach((exam) => {
      const key = exam.category || 'Other'
      const cycle = exam.latestCycle
      if (!cycle?.applicationEnd) return
      const end = new Date(cycle.applicationEnd)
      if (end < startOfToday) return
      const start = cycle.applicationStart ? new Date(cycle.applicationStart) : null
      if (start && start > now) return
      active.push({ ...exam, _sortEnd: end.getTime() })
      if (!byCategory.has(key)) byCategory.set(key, [])
      byCategory.get(key).push({ ...exam, _sortEnd: end.getTime() })
    })
    active.sort((a, b) => a._sortEnd - b._sortEnd)
    const hotExams = active.slice(0, HOT_EXAMS_LIMIT)
    byCategory.forEach((list) => list.sort((a, b) => a._sortEnd - b._sortEnd))
    const categoryTables = Array.from(byCategory.entries())
      .map(([category, list]) => ({ category, exams: list }))
      .filter((t) => t.exams.length > 0)
      .sort((a, b) => b.exams.length - a.exams.length)
    return { hotExams, categoryTables }
  }, [exams, startOfToday, now])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listExams()
        if (!active) return
        setExams(data.exams || [])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero – Sarkari-style compact */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
        <Container className="relative py-12 sm:py-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2">
              <StatPill label="Eligibility-first" icon={CheckCircle2} />
              <StatPill label="Deadline reminders" icon={Bell} />
              <StatPill label="Official links only" icon={ExternalLink} />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              Sarkari Exam Tracker
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-xl text-base text-gray-300">
              Latest open forms, results, and deadlines. One place. Official apply links only.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/exams">
                <Button className="bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/25">
                  Latest jobs <ArrowRight size={14} className="ml-1.5 inline" />
                </Button>
              </Link>
              <Link to={primaryCtaHref}>
                <Button variant="ghost" className="border border-white/30 text-white hover:bg-white/10">
                  {primaryCtaLabel}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Quick category strip – like Sarkari menu */}
      <section className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <Container className="py-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              to="/exams"
              className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-indigo-100 hover:text-indigo-800"
            >
              All exams
            </Link>
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/exams?category=${encodeURIComponent(cat.name)}`}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-indigo-100 hover:text-indigo-800"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Hot exams – Sarkari “Latest Jobs” style */}
      <section className="py-8 sm:py-10" id="hot-exams">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Flame size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Hot exams</h2>
                <p className="text-sm text-gray-600">Open forms – apply before deadline</p>
              </div>
            </div>
            <Link to="/exams?status=active">
              <Button variant="ghost" className="text-indigo-600">
                View all <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="mt-4 space-y-1 rounded-xl border border-gray-200 bg-white">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-14 rounded-none" />
              ))}
            </div>
          ) : hotExams.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <ul className="divide-y divide-gray-100">
                {hotExams.map((exam) => {
                  const name = sanitizeForDisplay(exam.name, 70)
                  const cycle = exam.latestCycle
                  const d = cycle?.applicationEnd ? daysUntil(cycle.applicationEnd) : null
                  const endStr = cycle?.applicationEnd ? formatDate(cycle.applicationEnd) : '—'
                  const isActive = cycle && d !== null && d >= 0
                  const applyHref = cycle?.applyLink && isOfficialUrl(cycle.applyLink) ? cycle.applyLink : null
                  return (
                    <motion.li
                      key={exam._id}
                      variants={fadeUp}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-4 py-3 hover:bg-gray-50/80"
                      style={{ minHeight: LIST_ITEM_HEIGHT }}
                    >
                      <div className="min-w-0 flex-1">
                        <Link to={`/exams/${exam._id}`} className="block">
                          <span className="font-semibold text-gray-900 hover:text-indigo-700 line-clamp-2">{name || 'Exam'}</span>
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {exam.category ? (
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">{exam.category}</span>
                          ) : null}
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Last date: {endStr}
                          </span>
                          {typeof exam.totalPosts === 'number' && exam.totalPosts > 0 ? (
                            <span>{exam.totalPosts} posts</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isActive && d !== null && d <= 7 ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            Closing in {d} day{d === 1 ? '' : 's'}
                          </span>
                        ) : isActive ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Active</span>
                        ) : null}
                        <Link to={`/exams/${exam._id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        {applyHref ? (
                          <a href={applyHref} target="_blank" rel="noreferrer">
                            <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-400">
                              Apply <ExternalLink size={12} className="ml-1 inline" />
                            </Button>
                          </a>
                        ) : null}
                      </div>
                    </motion.li>
                  )
                })}
              </ul>
            </motion.div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
              <ClipboardList size={36} className="mx-auto text-gray-400" />
              <p className="mt-2 font-medium">No open forms right now</p>
              <p className="mt-1 text-sm">Check back later or browse all exams below.</p>
              <Link to="/exams" className="mt-3 inline-block">
                <Button variant="ghost">Browse all exams</Button>
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* Exams by category – table format, active only */}
      <section className="border-t border-gray-200 bg-white py-8 sm:py-10" id="exams-by-category">
        <Container>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Exams by category</h2>
          <p className="mt-1 text-sm text-gray-600">Active exams only. Click View or Apply for details.</p>

          {loading ? (
            <div className="mt-6 space-y-6">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : categoryTables.length > 0 ? (
            <div className="mt-6 space-y-8">
              {categoryTables.map((block) => {
                const meta = POPULAR_CATEGORIES.find((c) => c.name === block.category)
                const Icon = meta?.icon || BookOpen
                const color = meta?.color || 'bg-gray-600'
                return (
                  <motion.div
                    key={block.category}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={`/exams?category=${encodeURIComponent(block.category)}`}
                      className="mb-3 flex items-center gap-2 text-gray-900 hover:text-indigo-700"
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color} text-white`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-lg font-bold">
                        {block.category === 'Other' ? 'Other' : block.category}
                      </span>
                      <span className="text-sm font-normal text-gray-500">
                        ({block.exams.length} active)
                      </span>
                      <ArrowRight size={16} className="text-indigo-500" />
                    </Link>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-3 font-semibold text-gray-900">Exam</th>
                            <th className="px-4 py-3 font-semibold text-gray-900">Last date</th>
                            <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
                            <th className="px-4 py-3 font-semibold text-gray-900 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {block.exams.map((exam) => {
                            const name = sanitizeForDisplay(exam.name, 60)
                            const cycle = exam.latestCycle
                            const d = cycle?.applicationEnd ? daysUntil(cycle.applicationEnd) : null
                            const endStr = cycle?.applicationEnd ? formatDate(cycle.applicationEnd) : '—'
                            const applyHref = cycle?.applyLink && isOfficialUrl(cycle.applyLink) ? cycle.applyLink : null
                            return (
                              <tr
                                key={exam._id}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80"
                              >
                                <td className="px-4 py-3">
                                  <Link to={`/exams/${exam._id}`} className="font-medium text-gray-900 hover:text-indigo-700">
                                    {name || 'Exam'}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{endStr}</td>
                                <td className="px-4 py-3">
                                  {d !== null && d <= 7 ? (
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                      Closing in {d}d
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Link to={`/exams/${exam._id}`}>
                                    <Button variant="ghost" size="sm">View</Button>
                                  </Link>
                                  {applyHref ? (
                                    <a href={applyHref} target="_blank" rel="noreferrer" className="ml-1 inline-block">
                                      <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-400">
                                        Apply
                                      </Button>
                                    </a>
                                  ) : null}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
              <ClipboardList size={32} className="mx-auto text-gray-400" />
              <p className="mt-2 font-medium">No active exams by category</p>
              <p className="mt-1 text-sm">When forms are open, they will appear here and in Hot exams.</p>
              <Link to="/exams" className="mt-3 inline-block">
                <Button variant="ghost">Browse all exams</Button>
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-200 bg-gradient-to-br from-gray-900 to-indigo-900 py-10 sm:py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left"
          >
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Build your exam pipeline with clarity
              </h2>
              <p className="mt-2 text-gray-300">
                Eligibility, active forms, and reminders — all in one dashboard.
              </p>
            </div>
            <Link to={primaryCtaHref}>
              <Button className="min-w-[200px] bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/25">
                {isAuthed ? 'Open dashboard' : 'Sign up now'}
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
