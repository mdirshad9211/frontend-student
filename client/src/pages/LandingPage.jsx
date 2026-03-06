import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Button } from '../components/Button'
import { Card, CardBody } from '../components/Card'
import { Badge } from '../components/Badge'
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Sparkles,
  ChartLine,
  ShieldCheck,
  UserCheck,
  Landmark,
  Train,
  GraduationCap,
  BookOpen,
  Target,
  Zap,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../store/authStore'
import { listExams } from '../features/exams/examsApi'
import { daysUntil, formatDate } from '../utils/date'
import { Skeleton } from '../components/Skeleton'
import { sanitizeForDisplay } from '../utils/sanitizeDisplay'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

function StatPill({ label, icon: Icon }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200/60 backdrop-blur-sm">
      {Icon ? <Icon size={14} className="text-emerald-600" /> : null}
      {label}
    </div>
  )
}

const POPULAR_CATEGORIES = [
  { name: 'UPSC', desc: 'Civil Services & allied', icon: Landmark, color: 'bg-gray-900' },
  { name: 'SSC', desc: 'Staff Selection Commission', icon: UserCheck, color: 'bg-emerald-600' },
  { name: 'Railway', desc: 'RRB, RRC recruitment', icon: Train, color: 'bg-amber-500' },
  { name: 'Banking', desc: 'IBPS, SBI, RBI exams', icon: ChartLine, color: 'bg-purple-600' },
  { name: 'Defence', desc: 'Army, Navy, Air Force', icon: Target, color: 'bg-gray-700' },
  { name: 'Teaching', desc: 'KVS, NVS, TGT, PGT', icon: GraduationCap, color: 'bg-teal-600' },
]

export function LandingPage() {
  const { isAuthed, isAdmin } = useAuth()
  const primaryCtaHref = isAuthed ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/register'
  const primaryCtaLabel = isAuthed ? 'Go to dashboard' : 'Create free account'

  const [categoryBlocks, setCategoryBlocks] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listExams()
        if (!active) return
        const exams = data.exams || []
        const map = new Map()
        exams.forEach((exam) => {
          const key = exam.category || 'Other'
          if (!map.has(key)) map.set(key, [])
          if (map.get(key).length < 4) map.get(key).push(exam)
        })
        const blocks = Array.from(map.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 3)
          .map(([category, examsForCategory]) => ({ category, exams: examsForCategory }))
        setCategoryBlocks(blocks)
      } finally {
        if (active) setLoadingCategories(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <Container className="relative py-20 sm:py-28">
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
              className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              Never Miss a Government Exam Again
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-300"
            >
              Discover exams you’re eligible for, track the ones you care about, and get reminders before application
              windows close. We redirect you to official portals to apply.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to={primaryCtaHref}>
                <Button className="min-w-[200px] bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25">
                  {primaryCtaLabel}
                </Button>
              </Link>
              <Link to="/exams">
                <Button variant="ghost" className="min-w-[200px] border border-white/30 text-white hover:bg-white/10">
                  Browse exams <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex items-center justify-center gap-2 text-sm text-emerald-200"
            >
              <CheckCircle2 size={18} />
              <span>No spam. Minimal emails. Only important deadlines.</span>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-200 bg-white py-8">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {[
              { icon: ClipboardList, label: 'Exams tracked', value: '100+' },
              { icon: Target, label: 'Categories', value: '10+' },
              { icon: Bell, label: 'Deadline alerts', value: '2 days before' },
              { icon: ShieldCheck, label: 'Secure & free', value: 'Always' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <item.icon size={22} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{item.value}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Features</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to stay on top
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              One place for eligibility, active forms, reminders, and official apply links.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Sparkles, title: 'Eligibility engine', desc: 'Filter exams by age and education.', color: 'bg-emerald-600' },
              { icon: Bell, title: 'Deadline reminders', desc: 'Email alerts when deadlines are within 2 days.', color: 'bg-purple-600' },
              { icon: ClipboardList, title: 'Track applied exams', desc: 'Mark interested, applied, or preparing in one click.', color: 'bg-gray-900' },
              { icon: ExternalLink, title: 'Official portals', desc: 'We redirect you to government sites to apply.', color: 'bg-amber-500' },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Card className="h-full border border-gray-200/80 transition hover:border-emerald-200 hover:shadow-md">
                  <CardBody>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color} text-white shadow-sm`}>
                      <f.icon size={20} />
                    </div>
                    <div className="mt-4 text-base font-semibold text-gray-900">{f.title}</div>
                    <div className="mt-2 text-sm text-gray-600">{f.desc}</div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-white py-16 sm:py-20" id="how-it-works">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">How it works</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple workflow, premium experience
            </h2>
            <p className="mt-3 max-w-2xl text-gray-600">
              Create your profile once. We handle eligibility, show active forms, and remind you before deadlines.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Create account', desc: 'Sign up in seconds with secure authentication.', icon: UserCheck },
              { step: '02', title: 'Complete your profile', desc: 'DOB, education, and state unlock eligibility results.', icon: BookOpen },
              { step: '03', title: 'Track & get reminders', desc: 'Mark exams and receive deadline emails automatically.', icon: Zap },
            ].map((x) => (
              <motion.div
                key={x.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-gray-200/80 bg-gray-50/50">
                  <CardBody className="flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <x.icon size={20} />
                      </div>
                      <span className="text-xs font-bold text-gray-400">{x.step}</span>
                    </div>
                    <div className="mt-4 text-lg font-semibold text-gray-900">{x.title}</div>
                    <div className="mt-2 text-sm text-gray-600">{x.desc}</div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who is it for */}
      <section className="py-16 sm:py-20" id="who-is-it-for">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Who is it for</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Built for every kind of aspirant
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              From central services to state-level roles, track opportunities across sectors in one view.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_CATEGORIES.map((cat) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-gray-200/80 transition hover:border-emerald-200 hover:shadow-md">
                  <CardBody className="flex flex-row items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cat.color} text-white shadow-sm`}>
                      <cat.icon size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{cat.name}</div>
                      <div className="text-sm text-gray-600">{cat.desc}</div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Explore by category – live exams */}
      <section className="border-t border-gray-200 bg-white py-16 sm:py-20" id="categories">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Explore by category</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Latest exams in your stream
            </h2>
            <p className="mt-3 max-w-2xl text-gray-600">
              See sample exams by category. Filter and browse the full list from the exams page.
            </p>
          </motion.div>

          {loadingCategories ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : categoryBlocks.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryBlocks.map((block) => (
                <Card key={block.category} className="border border-gray-200/80 overflow-hidden">
                  <CardBody className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        {block.category === 'Other' ? 'Mixed exams' : block.category}
                      </span>
                      <Badge tone="neutral">{block.exams.length} exam(s)</Badge>
                    </div>
                    <div className="space-y-3">
                      {block.exams.map((exam) => {
                        const name = sanitizeForDisplay(exam.name, 80)
                        const cycle = exam.latestCycle
                        const d = cycle?.applicationEnd ? daysUntil(cycle.applicationEnd) : null
                        const end = cycle?.applicationEnd ? formatDate(cycle.applicationEnd) : null
                        const isActive = cycle && d !== null && d >= 0
                        const isExpired = cycle && d !== null && d < 0
                        return (
                          <div key={exam._id} className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900 line-clamp-2">{name || 'Exam'}</div>
                            {cycle ? (
                              <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                                <span>Ends: {end || '—'}</span>
                                {isActive ? (
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">Active</span>
                                ) : isExpired ? (
                                  <span className="rounded-full bg-gray-200 px-2.5 py-1 font-semibold text-gray-600">Expired</span>
                                ) : null}
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-gray-500">Cycle info not added yet.</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <Link to={`/exams?category=${encodeURIComponent(block.category)}`}>
                      <Button variant="ghost" className="w-full text-sm">
                        View all in {block.category === 'Other' ? 'this group' : block.category}{' '}
                        <ArrowRight size={14} className="ml-1 inline" />
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
              No exams loaded yet. Add exams from the admin panel or run the scraper to populate live data.
            </div>
          )}
        </Container>
      </section>

      {/* Dashboard preview */}
      <section className="border-t border-gray-200 py-16 sm:py-20" id="dashboard">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-10 lg:grid-cols-2 lg:items-center"
          >
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Dashboard preview</div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                One view for eligibility, forms & deadlines
              </h2>
              <p className="mt-3 text-gray-600">
                Your dashboard surfaces eligible exams, active forms, upcoming deadlines, and applied exams in a single
                layout – so you can focus on preparation, not chasing links.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  Live count of eligible exams based on your profile.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  Active forms and deadlines highlighted with warning badges.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  Quick links to official portals plus “Mark as Applied” in one click.
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/dashboard">
                  <Button>View dashboard</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost">Complete profile</Button>
                </Link>
              </div>
            </div>

            <Card className="overflow-hidden border border-gray-200/80 bg-gray-900 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-purple-500/10 pointer-events-none" />
              <CardBody className="relative space-y-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-300">Snapshot</span>
                  <span className="text-gray-500">Gov Exam Tracker</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Eligible', value: '12', color: 'text-emerald-300' },
                    { label: 'Active forms', value: '5', color: 'text-amber-300' },
                    { label: 'Applied', value: '3', color: 'text-purple-300' },
                    { label: 'Deadlines (7d)', value: '2', color: 'text-emerald-300' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-gray-800/90 p-3">
                      <div className={`text-[10px] font-semibold uppercase ${item.color}`}>{item.label}</div>
                      <div className="mt-1 text-2xl font-bold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'UPSC CSE 2026', sub: 'Application ends in 3 days', tag: 'Apply', tone: 'amber' },
                    { name: 'RRB ALP 2026', sub: 'Marked as Preparing', tag: 'Tracked', tone: 'emerald' },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center justify-between rounded-xl bg-gray-800/90 px-4 py-3">
                      <div>
                        <div className="font-semibold text-white">{row.name}</div>
                        <div className="text-xs text-gray-400">{row.sub}</div>
                      </div>
                      <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-gray-900">
                        {row.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Trust & FAQ */}
      <section className="border-t border-gray-200 bg-white py-16 sm:py-20" id="faq">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr,1fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Why this platform</div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Designed with exam aspirants in mind
              </h2>
              <p className="mt-3 max-w-xl text-gray-600">
                We focus on reliability, clarity, and security – not distractions. The experience is clean, fast, and
                built to match the pace of serious preparation.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card className="border border-gray-200/80">
                  <CardBody className="flex flex-row gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Secure & private</div>
                      <div className="mt-1 text-sm text-gray-600">
                        Modern auth, hashed passwords, minimal data – just enough for eligibility.
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Card className="border border-gray-200/80">
                  <CardBody className="flex flex-row gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-gray-900">
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Signal, not noise</div>
                      <div className="mt-1 text-sm text-gray-600">
                        Only critical reminders before deadlines. No promotions, no spam.
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
            >
              <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">FAQ</div>
              <h2 className="mt-3 text-xl font-bold text-gray-900">Common questions</h2>
              <div className="mt-6 space-y-5">
                {[
                  {
                    q: 'Can I apply to exams from here?',
                    a: 'No. Applications happen only on official portals. We redirect you to those sites and help you keep track.',
                  },
                  {
                    q: 'Is this free to use?',
                    a: 'Yes. The MVP is free for aspirants. You just create an account and start tracking.',
                  },
                  {
                    q: 'Which exams are supported?',
                    a: 'Central, state, banking, railways, teaching, defence, and more – curated and enriched via admin panel and trusted sources.',
                  },
                ].map((faq) => (
                  <div key={faq.q} className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-4">
                    <div className="font-semibold text-gray-900">{faq.q}</div>
                    <div className="mt-2 text-sm text-gray-600">{faq.a}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-200 bg-gradient-to-br from-gray-900 to-emerald-900 py-16 sm:py-20">
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
              <Button className="min-w-[200px] bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25">
                {isAuthed ? 'Open dashboard' : 'Sign up now'}
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
