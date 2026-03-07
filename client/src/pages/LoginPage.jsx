import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { Container } from '../components/Container'
import { Card, CardBody, CardHeader } from '../components/Card'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { loginSchema } from '../features/auth/authSchemas'
import { login } from '../features/auth/authApi'
import { useAuth } from '../store/authStore'

export function LoginPage() {
  const { login: setAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const from = useMemo(() => location.state?.from || '/dashboard', [location.state])

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values) {
    setLoading(true)
    try {
      const data = await login(values)
      setAuth(data)
      toast.success('Welcome back')
      navigate(from, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12">
      <Container>
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader title="Login" subtitle="Access your dashboard and track exams." />
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...rhfRegister('password')}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 text-sm text-gray-600">
                New here?{' '}
                <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/register">
                  Create an account
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  )
}

