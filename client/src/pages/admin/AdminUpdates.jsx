import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileCheck2, IdCard } from 'lucide-react'
import { Card, CardBody } from '../../components/Card'
import { Skeleton } from '../../components/Skeleton'
import { adminListUpdates } from '../../features/admin/adminApi'
import { formatDate } from '../../utils/date'
import { sanitizeForDisplay } from '../../utils/sanitizeDisplay'

export function AdminUpdates({ type }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const isResult = type === 'result'
  useEffect(() => { adminListUpdates(type).then((data) => setItems(data[isResult ? 'results' : 'admitCards'] || [])).finally(() => setLoading(false)) }, [type, isResult])
  const Icon = isResult ? FileCheck2 : IdCard
  return <div><div className="text-xs font-semibold tracking-wide text-indigo-700">ADMIN</div><h1 className="mt-2 text-2xl font-extrabold text-slate-900">{isResult ? 'Results' : 'Admit cards'}</h1><p className="mt-2 text-sm text-slate-600">Updates collected by the scraper and linked to their exams.</p>
    <div className="mt-6 space-y-3">{loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />) : items.map((item) => <Card key={item._id}><CardBody><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon size={20} /></div><div className="min-w-0 flex-1"><div className="font-bold text-slate-900">{sanitizeForDisplay(item.title, 180)}</div><div className="mt-1 text-sm text-slate-600">{sanitizeForDisplay(item.examId?.name || 'Unlinked exam', 120)}</div><div className="mt-1 text-xs text-slate-500">Updated: {formatDate(item.publishedAt)}</div></div><Link to={'/' + (isResult ? 'results' : 'admit-cards') + '/' + item._id} className="text-sm font-semibold text-indigo-700">View</Link></div></CardBody></Card>)}</div>
  </div>
}
