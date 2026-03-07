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

const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const PREFERRED_EXAM_CATEGORIES = [
  'UPSC', 'SSC', 'Railway', 'Banking', 'Defence', 'Teaching',
  'State PSC', 'Translator', 'Police', 'Other',
]

const defaultValues = {
  dob: '',
  category: '',
  education: '',
  state: '',
  phone: '',
  gender: '',
  pwd: false,
  yearOfGraduation: '',
  specialization: '',
}

export function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferredCategories, setPreferredCategories] = useState([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
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
          phone: data?.phone || '',
          gender: data?.gender || '',
          pwd: Boolean(data?.pwd),
          yearOfGraduation: data?.yearOfGraduation ?? '',
          specialization: data?.specialization || '',
        })
        setPreferredCategories(Array.isArray(data?.preferredCategories) ? data.preferredCategories : [])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [reset])

  function togglePreferred(cat) {
    setPreferredCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await updateProfile({
        ...values,
        gender: values.gender || null,
        yearOfGraduation: values.yearOfGraduation ? Number(values.yearOfGraduation) : null,
        preferredCategories,
      })
      toast.success('Profile saved')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container>
      <div className="mb-6">
        <div className="text-xs font-semibold tracking-wide text-indigo-700">PROFILE</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">Your eligibility profile</div>
        <div className="mt-2 text-sm text-gray-600">
          Fill in your details for accurate exam eligibility. More information helps us match you with the right jobs.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Personal & eligibility */}
        <Card>
          <CardHeader
            title="Personal & eligibility"
            subtitle="DOB, category, and education are used for eligibility checks."
          />
          <CardBody>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
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
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </Select>
                <Input label="State" placeholder="e.g. Maharashtra" error={errors.state?.message} {...register('state')} />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Section 2: Education details */}
        <Card>
          <CardHeader
            title="Education details"
            subtitle="Year of graduation and specialization help match relevant exams."
          />
          <CardBody>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Year of graduation"
                  type="number"
                  placeholder="e.g. 2022"
                  min={1990}
                  max={2030}
                  error={errors.yearOfGraduation?.message}
                  {...register('yearOfGraduation', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })}
                />
                <Input
                  label="Specialization / Stream"
                  placeholder="e.g. CSE, ECE, Commerce"
                  error={errors.specialization?.message}
                  {...register('specialization')}
                />
              </div>
            )}
          </CardBody>
        </Card>

        {/* Section 3: Contact & preferences */}
        <Card>
          <CardHeader
            title="Contact & preferences"
            subtitle="Phone, gender, and PwD status; preferred exam types for better suggestions."
          />
          <CardBody className="space-y-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Select label="Gender" error={errors.gender?.message} {...register('gender')}>
                    {GENDER_OPTIONS.map((o) => (
                      <option key={o.value || 'none'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pwd"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    {...register('pwd')}
                  />
                  <label htmlFor="pwd" className="text-sm font-medium text-gray-700">
                    I am a Person with Benchmark Disability (PwD) for reservation purposes
                  </label>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Preferred exam categories</div>
                  <div className="mt-2 text-xs text-gray-600">Select the types of exams you are interested in (optional).</div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {PREFERRED_EXAM_CATEGORIES.map((cat) => (
                      <label key={cat} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={preferredCategories.includes(cat)}
                          onChange={() => togglePreferred(cat)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-800">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </Container>
  )
}
