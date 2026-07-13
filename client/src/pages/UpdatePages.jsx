import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, FileCheck2, IdCard } from 'lucide-react'
import { Container } from '../components/Container'
import { Card, CardBody, CardHeader } from '../components/Card'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { api } from '../services/api'
import { formatDate } from '../utils/date'
import { sanitizeForDisplay } from '../utils/sanitizeDisplay'
import { isOfficialUrl } from '../utils/url'

const config = {
  result: { plural: 'results', singular: 'result', title: 'Latest results', action: 'View result', Icon: FileCheck2 },
  admit_card: { plural: 'admit-cards', singular: 'admit card', title: 'Latest admit cards', action: 'Download admit card', Icon: IdCard },
}
const endpoint = (type, id = '') => '/' + config[type].plural + (id ? '/' + id : '')

export function UpdateListPage({ type }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { title, plural, action, Icon } = config[type]
  useEffect(() => {
    api.get(endpoint(type)).then(({ data }) => setItems(data[type === 'result' ? 'results' : 'admitCards'] || [])).finally(() => setLoading(false))
  }, [type])

  return <div className="py-8 sm:py-10"><Container>
    <div className="mb-6"><div className="text-xs font-semibold tracking-wide text-indigo-700">{type === 'result' ? 'RESULTS' : 'ADMIT CARDS'}</div><h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-600">Open an update to see its details and the related exam.</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />) : items.map((item) => <Card key={item._id} className="h-full"><CardBody>
        <div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon size={20} /></div><div className="min-w-0"><h2 className="text-base font-bold text-slate-900">{sanitizeForDisplay(item.title, 140)}</h2><p className="mt-1 text-sm text-slate-600">{sanitizeForDisplay(item.examId?.conductingBody || item.examId?.name || '', 110)}</p><p className="mt-2 text-xs text-slate-500">Updated: {formatDate(item.publishedAt)}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><Link to={endpoint(type, item._id)}><Button size="sm" variant="ghost">View details</Button></Link>{item.officialLink && isOfficialUrl(item.officialLink) ? <a href={item.officialLink} target="_blank" rel="noreferrer"><Button size="sm">{action} <ExternalLink size={13} className="ml-1" /></Button></a> : null}</div>
      </CardBody></Card>)}
    </div>
    {!loading && !items.length ? <div className="rounded-2xl bg-white p-6 text-slate-600 ring-1 ring-slate-200">No {plural} available yet.</div> : null}
  </Container></div>
}

export function UpdateDetailPage({ type }) {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const { singular, plural, action, Icon } = config[type]
  useEffect(() => { api.get(endpoint(type, id)).then(({ data }) => setItem(data[type === 'result' ? 'result' : 'admitCard'])).finally(() => setLoading(false)) }, [type, id])
  if (loading) return <div className="py-10"><Container><Skeleton className="h-64" /></Container></div>
  if (!item) return <div className="py-10"><Container><Card><CardBody>{singular} not found.</CardBody></Card></Container></div>
  const exam = item.examId
  return <div className="py-8 sm:py-10"><Container><div className="max-w-3xl space-y-5">
    <Link to={'/' + plural} className="text-sm font-semibold text-indigo-700">Back to {plural}</Link>
    <Card><CardHeader title={type === 'result' ? 'Result details' : 'Admit card details'} subtitle="Latest update and related exam information." /><CardBody>
      <div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon size={24} /></div><div><h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{sanitizeForDisplay(item.title, 220)}</h1><p className="mt-2 text-sm text-slate-600">Published: {formatDate(item.publishedAt)}</p></div></div>
      <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm"><div><span className="font-semibold">Exam:</span> {sanitizeForDisplay(exam?.name || 'Not linked', 180)}</div><div><span className="font-semibold">Conducting body:</span> {sanitizeForDisplay(exam?.conductingBody || '-', 140)}</div></div>
      {item.details ? <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold text-slate-900">Update details</h2><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{sanitizeForDisplay(item.details, 4200)}</div></div> : null}
      <div className="mt-5 flex flex-wrap gap-3">{exam?._id ? <Link to={'/exams/' + exam._id}><Button variant="ghost">View exam details</Button></Link> : null}{item.officialLink && isOfficialUrl(item.officialLink) ? <a href={item.officialLink} target="_blank" rel="noreferrer"><Button>{action} <ExternalLink size={16} className="ml-2" /></Button></a> : null}</div>
    </CardBody></Card>
  </div></Container></div>
}
