import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../../components/Button'
import { adminListPages, adminSavePage } from '../../features/admin/adminApi'

export function AdminContent() {
  const [pages, setPages] = useState([]); const [selected, setSelected] = useState(null)
  useEffect(() => { adminListPages().then((data) => { setPages(data.pages || []); setSelected(data.pages?.[0] || null) }) }, [])
  async function save() { const { page } = await adminSavePage(selected.slug, selected); setPages((items) => items.map((item) => item.slug === page.slug ? page : item)); setSelected(page); toast.success('Page saved') }
  if (!selected) return <div>Loading pages...</div>
  return <div><div className="text-xs font-semibold tracking-wide text-indigo-700">ADMIN</div><h1 className="mt-2 text-2xl font-extrabold text-slate-900">Site pages</h1><div className="mt-6 grid gap-4 lg:grid-cols-[12rem_1fr]"><div className="flex flex-wrap gap-2 lg:flex-col">{pages.map((page) => <button key={page.slug} onClick={() => setSelected(page)} className={'rounded-xl px-3 py-2 text-left text-sm font-semibold ' + (selected.slug === page.slug ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200')}>{page.title}</button>)}</div><div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200"><input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold" /><textarea value={selected.content} onChange={(e) => setSelected({ ...selected, content: e.target.value })} className="min-h-80 w-full rounded-xl border border-slate-200 p-3 text-sm leading-6" /><Button onClick={save}>Save page</Button></div></div></div>
}
