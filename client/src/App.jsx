import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './store/authStore'
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Seo } from './components/Seo'

import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExamListPage } from './pages/ExamListPage'
import ExamDetailPage from './pages/ExamDetailPage'
import { ProfilePage } from './pages/ProfilePage'

import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminExamManager } from './pages/admin/AdminExamManager'
import { AdminExamCycleManager } from './pages/admin/AdminExamCycleManager'
import { AdminUserManager } from './pages/admin/AdminUserManager'

function PageTransition({ children }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#F9FAFB',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              },
            }}
          />

          <PageTransition>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/exams" element={<ExamListPage />} />
                <Route path="/results" element={<ExamListPage forcedSection="result" />} />
                <Route path="/admit-cards" element={<ExamListPage forcedSection="admit_card" />} />
                <Route path="/exams/:id" element={<ExamDetailPage />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route element={<AdminLayout />}>
                <Route path="/admin/login" element={<AdminLogin />} />
              </Route>

              <Route
                element={
                  <AdminRoute>
                    <AdminLayout showNav />
                  </AdminRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/exams" element={<AdminExamManager />} />
                <Route path="/admin/exam-cycles" element={<AdminExamCycleManager />} />
                <Route path="/admin/users" element={<AdminUserManager />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}


