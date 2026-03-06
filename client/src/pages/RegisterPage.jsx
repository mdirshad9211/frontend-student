import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { Container } from '../components/Container'
import { Card, CardBody, CardHeader } from '../components/Card'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { registerSchema } from '../features/auth/authSchemas'
import { register as registerApi } from '../features/auth/authApi'
import { useAuth } from '../store/authStore'

export function RegisterPage() {
  const { login: setAuth } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(values) {
    setLoading(true)
    try {
      const data = await registerApi(values)
      setAuth(data)
      toast.success('Account created')
      navigate('/profile', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12">
      <Container>
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader title="Create account" subtitle="Start tracking eligible government exams." />
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Full name" placeholder="Your name" error={errors.name?.message} {...rhfRegister('name')} />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...rhfRegister('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  error={errors.password?.message}
                  {...rhfRegister('password')}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating…' : 'Create account'}
                </Button>
              </form>

              <div className="mt-6 text-sm text-gray-600">
                Already have an account?{' '}
                <Link className="font-semibold text-emerald-700 hover:text-emerald-600" to="/login">
                  Login
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  )
}

