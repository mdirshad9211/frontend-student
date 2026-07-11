import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ExternalLink, ClipboardCheck, Sparkles, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { Container } from '../components/Container'
import { Card, CardBody, CardHeader } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { getExam } from '../features/exams/examsApi'
import { getProfile } from '../features/profile/profileApi'
import { upsertUserExam } from '../features/userExams/userExamsApi'
import { useAuth } from '../store/authStore'
import { computeEligibility } from '../utils/eligibility'
import { getEducationLabel } from '../utils/education'
import { formatDate, daysUntil } from '../utils/date'
import { sanitizeForDisplay } from '../utils/sanitizeDisplay'
import { isOfficialUrl } from '../utils/url'

export function ExamDetailPage() {
  const { id } = useParams()
  const { isAuthed } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState(null)
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getExam(id)
        if (!active) return
        setExam(data.exam)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!isAuthed) return
    let active = true
    ;(async () => {
      try {
        const p = await getProfile()
        if (!active) return
        setProfile(p)
      } catch {
        // ignore
      }
    })()
    return () => {
      active = false
    }
  }, [isAuthed])

  const latestCycle = exam?.cycles?.[0] || exam?.latestCycle || null
  const deadlineDays = latestCycle?.applicationEnd ? daysUntil(latestCycle.applicationEnd) : null

  const eligibility = useMemo(() => {
    if (!exam) return null
    if (!profile) return null
    return computeEligibility(profile, exam)
  }, [exam, profile])

  const displayName = useMemo(() => sanitizeForDisplay(exam?.name, 200), [exam?.name])
  const conductingBodyShort = useMemo(
    () => sanitizeForDisplay(exam?.conductingBody || '', 260),
    [exam?.conductingBody]
  )
  const displayEducation = useMemo(
    () => sanitizeForDisplay(exam?.educationRequired, 120),
    [exam?.educationRequired]
  )
  const examStates = useMemo(() => (Array.isArray(exam?.states) ? exam.states : []), [exam?.states])
  const admitCardLink = useMemo(
    () => (exam?.latestAdmitCardLink && isOfficialUrl(exam.latestAdmitCardLink) ? exam.latestAdmitCardLink : null),
    [exam?.latestAdmitCardLink]
  )
  const resultLink = useMemo(
    () => (exam?.latestResultLink && isOfficialUrl(exam.latestResultLink) ? exam.latestResultLink : null),
    [exam?.latestResultLink]
  )
  const cleanDetails = useMemo(() => sanitizeForDisplay(exam?.details || '', 4200), [exam?.details])

  async function markApplied(status) {
    if (!isAuthed) return
    setSaving(true)
    try {
      await upsertUserExam({ examId: exam._id, status })
      toast.success(`Marked as ${status}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-10">
      <Container>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        ) : !exam ? (
          <Card>
            <CardBody>Exam not found.</CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Back link */}
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 transition"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wide text-indigo-700">EXAM DETAILS</div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">{displayName || 'Exam'}</div>
                {conductingBodyShort ? (
                  <div className="mt-2 max-w-3xl text-sm text-gray-600">{conductingBodyShort}</div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {deadlineDays !== null && deadlineDays >= 0 ? (
                  <Badge tone={deadlineDays <= 2 ? 'warn' : 'success'}>Deadline in {deadlineDays} day(s)</Badge>
                ) : (
                  <Badge tone="neutral">No active deadline</Badge>
                )}
                {exam.category ? <Badge tone="accent">{exam.category}</Badge> : null}
                {examStates.length ? <Badge tone="neutral">{examStates.join(', ')}</Badge> : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader title="Eligibility" subtitle="Based on your profile (DOB + education)." />
                <CardBody>
                  {!isAuthed ? (
                    <div className="text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">Login to see your eligibility</div>
                      <div className="mt-2 text-gray-600">
                        We compute eligibility using your profile details. It takes less than a minute.
                      </div>
                      <div className="mt-4">
                        <Link to="/login">
                          <Button>Login</Button>
                        </Link>
                      </div>
                    </div>
                  ) : !profile ? (
                    <div className="text-sm text-gray-600">
                      Loading profile… If this hangs, open <Link className="font-semibold text-indigo-700" to="/profile">Profile</Link> and save your details.
                    </div>
                  ) : eligibility?.reasons?.missingProfile ? (
                    <div className="text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">Complete your profile to unlock eligibility</div>
                      <div className="mt-2 text-gray-600">Add DOB and education. We’ll instantly show if you’re eligible.</div>
                      <div className="mt-4">
                        <Link to="/profile">
                          <Button>Complete profile</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-indigo-700" />
                          <div className="text-sm font-semibold text-gray-900">
                            {eligibility?.eligible ? 'Eligible' : 'Not eligible'}
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-gray-700">
                          <div>
                            <span className="font-semibold text-gray-900">Age</span>: {eligibility.reasons.userAge} (required {exam.minAge}–{exam.maxAge})
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Education</span>: {getEducationLabel(profile.education) || '—'} (required {displayEducation || '—'})
                          </div>
                        </div>
                      </div>
                      <Badge tone={eligibility?.eligible ? 'success' : 'warn'}>{eligibility?.eligible ? 'PASS' : 'CHECK'}</Badge>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Actions" subtitle="Track this exam in your dashboard." />
                <CardBody>
                  <div className="flex flex-col gap-2">
                    {latestCycle?.applyLink && isOfficialUrl(latestCycle.applyLink) ? (
                      <a href={latestCycle.applyLink} target="_blank" rel="noreferrer">
                        <Button className="w-full">
                          Official apply link <ExternalLink size={16} className="ml-2" />
                        </Button>
                      </a>
                    ) : (
                      <Button className="w-full" variant="ghost" disabled>
                        Official apply link not available
                      </Button>
                    )}

                    {admitCardLink ? (
                      <a href={admitCardLink} target="_blank" rel="noreferrer">
                        <Button className="w-full" variant="secondary">
                          Download admit card <ExternalLink size={16} className="ml-2" />
                        </Button>
                      </a>
                    ) : null}

                    {resultLink ? (
                      <a href={resultLink} target="_blank" rel="noreferrer">
                        <Button className="w-full" variant="secondary">
                          Download result <ExternalLink size={16} className="ml-2" />
                        </Button>
                      </a>
                    ) : null}

                    {isAuthed ? (
                      <>
                        <Button
                          className="w-full"
                          variant="secondary"
                          disabled={saving}
                          onClick={() => markApplied('interested')}
                        >
                          Mark Interested
                        </Button>
                        <Button
                          className="w-full"
                          disabled={saving}
                          onClick={() => markApplied('applied')}
                        >
                          <ClipboardCheck size={16} className="mr-2" />
                          Mark as Applied
                        </Button>
                        <Button
                          className="w-full"
                          variant="ghost"
                          disabled={saving}
                          onClick={() => markApplied('preparing')}
                        >
                          Mark Preparing
                        </Button>
                      </>
                    ) : (
                      <Link to="/register">
                        <Button className="w-full" variant="amber">
                          Create account to track
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader title="Dates & info" subtitle="Based on latest available cycle (if added by admin)." />
              <CardBody>
                <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                  <div>
                    <span className="font-semibold text-gray-900">Age limit</span>: {exam.minAge}–{exam.maxAge}
                  </div>
                  {typeof exam.totalPosts === 'number' && exam.totalPosts > 0 ? (
                    <div>
                      <span className="font-semibold text-gray-900">Total posts</span>: {exam.totalPosts}
                    </div>
                  ) : null}
                  <div>
                    <span className="font-semibold text-gray-900">Education required</span>: {displayEducation || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Application start</span>: {formatDate(latestCycle?.applicationStart)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Application end</span>: {formatDate(latestCycle?.applicationEnd)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Exam date</span>: {formatDate(latestCycle?.examDate)}
                  </div>
                  {exam.officialWebsite && isOfficialUrl(exam.officialWebsite) ? (
                    <div>
                      <span className="font-semibold text-gray-900">Official website</span>:{' '}
                      <a
                        className="font-semibold text-indigo-700 hover:text-indigo-600"
                        href={exam.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit <ExternalLink size={14} className="inline" />
                      </a>
                    </div>
                  ) : null}
                  {admitCardLink ? (
                    <div>
                      <span className="font-semibold text-gray-900">Admit card</span>:{' '}
                      <a
                        className="font-semibold text-indigo-700 hover:text-indigo-600"
                        href={admitCardLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download admit card <ExternalLink size={14} className="inline" />
                      </a>
                    </div>
                  ) : null}
                  {resultLink ? (
                    <div>
                      <span className="font-semibold text-gray-900">Result</span>:{' '}
                      <a
                        className="font-semibold text-indigo-700 hover:text-indigo-600"
                        href={resultLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download result <ExternalLink size={14} className="inline" />
                      </a>
                    </div>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            {cleanDetails ? (
              <Card>
                <CardHeader
                  title="More details"
                  subtitle="Clean summary from notification text."
                />
                <CardBody>
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="max-h-90 overflow-auto whitespace-pre-line text-sm leading-7 text-gray-700">
                      {cleanDetails}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : null}
          </div>
        )}
      </Container>
    </div>
  )
}

export default ExamDetailPage

