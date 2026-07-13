import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '../components/Container'
import { Card, CardBody } from '../components/Card'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { api } from '../services/api'

export function InfoPage({ slug }) {
  const [page, setPage] = useState(null)
  useEffect(() => { api.get('/pages/' + slug).then(({ data }) => setPage(data.page)) }, [slug])
  if (!page) return <div className="py-10"><Container><Skeleton className="h-64" /></Container></div>
  return <div className="py-10"><Container><article className="mx-auto max-w-3xl"><div className="text-xs font-semibold tracking-wide text-indigo-700">SARKORA</div><h1 className="mt-2 text-3xl font-extrabold text-slate-900">{page.title}</h1><Card className="mt-6"><CardBody><div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{page.content}</div></CardBody></Card></article></Container></div>
}

export function CareersPage() {
  const [jobs, setJobs] = useState([])
  useEffect(() => { api.get('/careers').then(({ data }) => setJobs(data.jobs || [])) }, [])
  return <div className="py-10"><Container><div className="mx-auto max-w-4xl"><div className="text-xs font-semibold tracking-wide text-indigo-700">CAREERS</div><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Work with Sarkora</h1><p className="mt-2 text-slate-600">Join us in making government exam information easier to access.</p><div className="mt-6 grid gap-4">{jobs.map((job) => <Card key={job._id}><CardBody><h2 className="text-lg font-bold text-slate-900">{job.title}</h2><p className="mt-1 text-sm text-slate-600">{job.location} · {job.employmentType}</p><p className="mt-3 text-sm text-slate-700">{job.summary}</p><Link to={'/careers/' + job._id} className="mt-4 inline-block"><Button size="sm">View role</Button></Link></CardBody></Card>)}</div>{!jobs.length && <Card className="mt-6"><CardBody>No roles are open right now. Please check back soon.</CardBody></Card>}</div></Container></div>
}

export function CareerDetailPage() {
  const { id } = useParams(); const [job, setJob] = useState(null)
  useEffect(() => { api.get('/careers/' + id).then(({ data }) => setJob(data.job)) }, [id])
  if (!job) return <div className="py-10"><Container><Skeleton className="h-64" /></Container></div>
  return <div className="py-10"><Container><article className="mx-auto max-w-3xl"><Link to="/careers" className="text-sm font-semibold text-indigo-700">Back to careers</Link><Card className="mt-5"><CardBody><h1 className="text-2xl font-extrabold text-slate-900">{job.title}</h1><p className="mt-2 text-sm text-slate-600">{job.location} · {job.employmentType}</p><div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.description || job.summary}</div>{job.applicationUrl ? <a className="mt-6 inline-block" href={job.applicationUrl} target="_blank" rel="noreferrer"><Button>Apply for this role</Button></a> : null}</CardBody></Card></article></Container></div>
}
