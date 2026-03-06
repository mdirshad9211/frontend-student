import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { Card, CardBody, CardHeader } from '../../components/Card'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { loginSchema } from '../../features/auth/authSchemas'
import { login } from '../../features/auth/authApi'
import { useAuth } from '../../store/authStore'

export function AdminLogin() {
  const { login: setAuth, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
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
      if (data?.user?.role !== 'admin') {
        logout()
        toast.error('Admin access required')
        return
      }
      setAuth(data)
      toast.success('Welcome, Admin')
      navigate('/admin/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader title="Admin login" subtitle="Restricted access for administrators." />
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

