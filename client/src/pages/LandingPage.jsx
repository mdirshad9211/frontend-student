import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Container } from '../components/Container'
import { Button } from '../components/Button'
import { Card, CardBody } from '../components/Card'
import { Bell, CheckCircle2, ClipboardList, ExternalLink, Sparkles } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

function StatPill({ label }) {
  return (
    <div className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-gray-100 shadow-sm">
      {label}
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="bg-gray-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-emerald-600/15 blur-3xl" />
          <div className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
          <div className="absolute bottom-0 right-20 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div variants={fadeUp}>
              <div className="flex flex-wrap gap-2">
                <StatPill label="Eligibility-first" />
                <StatPill label="Deadline reminders" />
                <StatPill label="Official links only" />
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Never Miss a Government Exam Again
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                Discover exams you’re eligible for, track the ones you care about, and get reminders before application windows close.
                We redirect you to official portals to apply.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/register">
                  <Button className="w-full sm:w-auto">Create free account</Button>
                </Link>
                <Link to="/exams">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    Browse exams <ExternalLink size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle2 className="text-emerald-700" size={18} />
                No spam. Minimal emails. Only important deadlines.
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
              <Card className="hover:shadow-md transition">
                <CardBody>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-gray-900">Eligibility engine</div>
                  <div className="mt-2 text-sm text-gray-600">Filter exams based on age and education profile.</div>
                </CardBody>
              </Card>
              <Card className="hover:shadow-md transition">
                <CardBody>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                    <Bell size={18} />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-gray-900">Deadline reminders</div>
                  <div className="mt-2 text-sm text-gray-600">Email alerts when deadlines are within 2 days.</div>
                </CardBody>
              </Card>
              <Card className="hover:shadow-md transition">
                <CardBody>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
                    <ClipboardList size={18} />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-gray-900">Track applied exams</div>
                  <div className="mt-2 text-sm text-gray-600">Mark as interested/applied/preparing in one click.</div>
                </CardBody>
              </Card>
              <Card className="hover:shadow-md transition">
                <CardBody>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-gray-900 shadow-sm">
                    <ExternalLink size={18} />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-gray-900">Official portals</div>
                  <div className="mt-2 text-sm text-gray-600">We redirect you to government sites for applying.</div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        </Container>
      </div>

      <Container className="py-14">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-xs font-semibold tracking-wide text-emerald-700">HOW IT WORKS</div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Simple workflow, premium experience</div>
          <div className="mt-3 text-gray-700">
            Create your profile once. We handle eligibility, show active forms, and remind you before deadlines.
          </div>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { step: '01', title: 'Create account', desc: 'Signup in seconds with secure authentication.' },
            { step: '02', title: 'Complete your profile', desc: 'DOB, education, and state unlock eligibility results.' },
            { step: '03', title: 'Track & get reminders', desc: 'Mark exams and receive deadline emails automatically.' },
          ].map((x) => (
            <Card key={x.step} className="hover:shadow-md transition">
              <CardBody>
                <div className="text-xs font-semibold text-gray-500">{x.step}</div>
                <div className="mt-2 text-sm font-semibold text-gray-900">{x.title}</div>
                <div className="mt-2 text-sm text-gray-600">{x.desc}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>

      <div className="bg-white border-t border-gray-100">
        <Container className="py-14">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-semibold tracking-wide text-emerald-700">READY TO START?</div>
              <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
                Build your exam pipeline with clarity
              </div>
              <div className="mt-2 text-sm text-gray-600">Eligibility, active forms, and reminders — all in one dashboard.</div>
            </div>
            <Link to="/register">
              <Button className="w-full md:w-auto">Sign up now</Button>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  )
}

