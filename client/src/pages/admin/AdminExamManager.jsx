import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Card, CardBody, CardHeader } from '../../components/Card'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/Badge'
import { adminCreateExam, adminDeleteExam, adminListExams, adminUpdateExam } from '../../features/admin/adminApi'
import { EDUCATION_OPTIONS, getEducationLabel } from '../../utils/education'

const examFormSchema = z.object({
  name: z.string().min(2),
  conductingBody: z.string().min(2),
  minAge: z.coerce.number().int().nonnegative(),
  maxAge: z.coerce.number().int().nonnegative(),
  educationRequired: z.string().min(2),
  educationKeys: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
  officialWebsite: z.string().url(),
})

export function AdminExamManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      name: '',
      conductingBody: '',
      minAge: 18,
      maxAge: 35,
      educationRequired: 'graduation',
      educationKeys: [],
      category: '',
      officialWebsite: '',
    },
  })

  async function refresh() {
    const data = await adminListExams()
    setItems(data.exams || [])
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        await refresh()
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  function startEdit(exam) {
    setEditing(exam)
    reset({
      name: exam.name || '',
      conductingBody: exam.conductingBody || '',
      minAge: exam.minAge ?? 0,
      maxAge: exam.maxAge ?? 0,
      educationRequired: exam.educationRequired || '',
      educationKeys: exam.educationKeys || [],
      category: exam.category || '',
      officialWebsite: exam.officialWebsite || '',
    })
  }

  function clearForm() {
    setEditing(null)
    reset({
      name: '',
      conductingBody: '',
      minAge: 18,
      maxAge: 35,
      educationRequired: 'graduation',
      educationKeys: [],
      category: '',
      officialWebsite: '',
    })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      if (editing?._id) {
        await adminUpdateExam(editing._id, values)
        toast.success('Exam updated')
      } else {
        await adminCreateExam(values)
        toast.success('Exam created')
      }
      await refresh()
      clearForm()
    } finally {
      setSaving(false)
    }
  }

  async function remove(exam) {
    if (!window.confirm(`Delete exam "${exam.name}"? This will also remove its cycles.`)) return
    await adminDeleteExam(exam._id)
    toast.success('Exam deleted')
    await refresh()
  }

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'conductingBody', label: 'Conducting Body' },
      {
        key: 'age',
        label: 'Age',
        render: (r) => (
          <span className="font-semibold text-gray-900">
            {r.minAge}–{r.maxAge}
          </span>
        ),
      },
      {
        key: 'education',
        label: 'Education',
        render: (r) =>
          Array.isArray(r.educationKeys) && r.educationKeys.length ? (
            <span className="text-xs text-gray-800">
              {r.educationKeys.map((k) => getEducationLabel(k)).join(', ')}
            </span>
          ) : (
            r.educationRequired
          ),
      },
      {
        key: 'category',
        label: 'Category',
        render: (r) => (r.category ? <Badge tone="accent">{r.category}</Badge> : <span className="text-gray-500">—</span>),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (r) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => startEdit(r)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => remove(r)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-wide text-indigo-700">ADMIN</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Exams</div>
        <div className="mt-2 text-sm text-gray-600">Add, update, and delete exams.</div>
      </div>

      <Card>
        <CardHeader
          title={editing ? 'Edit exam' : 'Add exam'}
          subtitle="All fields required except category."
          right={
            editing ? (
              <Button variant="ghost" onClick={clearForm}>
                Cancel edit
              </Button>
            ) : null
          }
        />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Input label="Conducting Body" error={errors.conductingBody?.message} {...register('conductingBody')} />
            <Input label="Min Age" type="number" error={errors.minAge?.message} {...register('minAge')} />
            <Input label="Max Age" type="number" error={errors.maxAge?.message} {...register('maxAge')} />
            <div className="space-y-1">
              <Input
                label="Education Required (text)"
                placeholder="e.g. Graduation in any discipline"
                error={errors.educationRequired?.message}
                {...register('educationRequired')}
              />
              <div className="mt-2 text-xs font-semibold text-gray-700">Allowed degrees (multi-select)</div>
              <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-gray-700 sm:grid-cols-3">
                {EDUCATION_OPTIONS.map((opt) => (
                  <label key={opt.value} className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      value={opt.value}
                      {...register('educationKeys')}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Input label="Category (optional)" error={errors.category?.message} {...register('category')} />
            <div className="md:col-span-2">
              <Input
                label="Official Website"
                placeholder="https://..."
                error={errors.officialWebsite?.message}
                {...register('officialWebsite')}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update exam' : 'Create exam'}
              </Button>
              <Button type="button" variant="secondary" onClick={clearForm} disabled={saving}>
                Reset
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div>
        <div className="mb-3 text-sm font-semibold text-gray-900">All exams</div>
        <DataTable columns={columns} rows={loading ? [] : items} rowKey="_id" emptyText={loading ? 'Loading…' : 'No exams'} />
      </div>
    </div>
  )
}

