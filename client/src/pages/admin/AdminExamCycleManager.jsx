import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Card, CardBody, CardHeader } from '../../components/Card'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import { formatDate } from '../../utils/date'
import { adminCreateExamCycle, adminListExamCycles, adminListExams } from '../../features/admin/adminApi'

const cycleSchema = z.object({
  examId: z.string().min(1, 'Exam is required'),
  applicationStart: z.string().min(1, 'Required'),
  applicationEnd: z.string().min(1, 'Required'),
  examDate: z.string().min(1, 'Required'),
  applyLink: z.string().url('Valid URL required'),
  notificationPdf: z.string().url('Valid URL required').optional().or(z.literal('')),
})

export function AdminExamCycleManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cycles, setCycles] = useState([])
  const [exams, setExams] = useState([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      examId: '',
      applicationStart: '',
      applicationEnd: '',
      examDate: '',
      applyLink: '',
      notificationPdf: '',
    },
  })

  async function refresh() {
    const [cy, ex] = await Promise.all([adminListExamCycles(), adminListExams()])
    setCycles(cy.examCycles || [])
    setExams(ex.exams || [])
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

  async function onSubmit(values) {
    setSaving(true)
    try {
      await adminCreateExamCycle({
        ...values,
        notificationPdf: values.notificationPdf || null,
      })
      toast.success('Exam cycle created')
      reset()
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'exam',
        label: 'Exam',
        render: (r) => <span className="font-semibold text-gray-900">{r.examId?.name || '—'}</span>,
      },
      { key: 'applicationStart', label: 'Start', render: (r) => formatDate(r.applicationStart) },
      { key: 'applicationEnd', label: 'End', render: (r) => formatDate(r.applicationEnd) },
      { key: 'examDate', label: 'Exam Date', render: (r) => formatDate(r.examDate) },
      {
        key: 'applyLink',
        label: 'Apply Link',
        render: (r) => (
          <a className="font-semibold text-indigo-600 hover:text-indigo-500" href={r.applyLink} target="_blank" rel="noreferrer">
            Open
          </a>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-wide text-indigo-700">ADMIN</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Exam cycles</div>
        <div className="mt-2 text-sm text-gray-600">Add application windows and dates for each exam.</div>
      </div>

      <Card>
        <CardHeader title="Add exam cycle" subtitle="These dates power dashboards and reminders." />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <Select label="Exam" error={errors.examId?.message} {...register('examId')}>
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </Select>

            <Input label="Apply link" placeholder="https://..." error={errors.applyLink?.message} {...register('applyLink')} />

            <Input label="Application start" type="date" error={errors.applicationStart?.message} {...register('applicationStart')} />
            <Input label="Application end" type="date" error={errors.applicationEnd?.message} {...register('applicationEnd')} />

            <Input label="Exam date" type="date" error={errors.examDate?.message} {...register('examDate')} />
            <Input
              label="Notification PDF (optional)"
              placeholder="https://..."
              error={errors.notificationPdf?.message}
              {...register('notificationPdf')}
            />

            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Create cycle'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div>
        <div className="mb-3 text-sm font-semibold text-gray-900">All cycles</div>
        <DataTable
          columns={columns}
          rows={loading ? [] : cycles}
          rowKey="_id"
          emptyText={loading ? 'Loading…' : 'No cycles'}
        />
      </div>
    </div>
  )
}

