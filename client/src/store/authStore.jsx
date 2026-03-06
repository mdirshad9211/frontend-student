import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const TOKEN_KEY = 'gov_exam_tracker_token'
const USER_KEY = 'gov_exam_tracker_user'

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem(USER_KEY)) || null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    setBootstrapped(true)
  }, [])

  const value = useMemo(() => {
    const isAuthed = Boolean(token)
    const isAdmin = user?.role === 'admin'

    function persist(nextToken, nextUser) {
      setToken(nextToken || '')
      setUser(nextUser || null)

      if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
      else localStorage.removeItem(TOKEN_KEY)

      if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      else localStorage.removeItem(USER_KEY)
    }

    function login({ token: t, user: u }) {
      persist(t, u)
    }

    function logout() {
      persist('', null)
      toast.success('Logged out')
    }

    return { token, user, isAuthed, isAdmin, login, logout, bootstrapped }
  }, [token, user, bootstrapped])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

