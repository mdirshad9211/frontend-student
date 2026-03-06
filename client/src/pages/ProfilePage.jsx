import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { Container } from '../components/Container'
import { Card, CardBody, CardHeader } from '../components/Card'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { profileSchema } from '../features/profile/profileSchemas'
import { getProfile, updateProfile } from '../features/profile/profileApi'
import { EDUCATION_OPTIONS } from '../utils/education'

const CATEGORIES = ['general', 'obc', 'sc', 'st', 'ews']

export function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { dob: '', category: '', education: '', state: '' },
  })

  const educationOptions = useMemo(() => EDUCATION_OPTIONS, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getProfile()
        if (!active) return
        reset({
          dob: data?.dob ? new Date(data.dob).toISOString().slice(0, 10) : '',
          category: data?.category || '',
          education: data?.education || '',
          state: data?.state || '',
        })
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [reset])

  async function onSubmit(values) {
    setSaving(true)
    try {
      await updateProfile(values)
      toast.success('Profile saved')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container>
      <div className="mb-6">
        <div className="text-xs font-semibold tracking-wide text-emerald-700">PROFILE</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Your eligibility profile</div>
        <div className="mt-2 text-sm text-gray-600">
          Add DOB and education to unlock eligibility results and active forms on your dashboard.
        </div>
      </div>

      <Card>
        <CardHeader title="Personal details" subtitle="Used only for eligibility calculations." />
        <CardBody>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <Input label="Date of birth" type="date" error={errors.dob?.message} {...register('dob')} />

              <Select label="Category" error={errors.category?.message} {...register('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </Select>

              <Select label="Education" error={errors.education?.message} {...register('education')}>
                <option value="">Select education</option>
                {educationOptions.map((e) => (
                  <option key={e} value={e}>
                    {e.toUpperCase()}
                  </option>
                ))}
              </Select>

              <Input label="State" placeholder="e.g. Maharashtra" error={errors.state?.message} {...register('state')} />

              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save profile'}
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

