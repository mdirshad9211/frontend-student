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
import { UpdateListPage, UpdateDetailPage } from './pages/UpdatePages'
import { ProfilePage } from './pages/ProfilePage'

import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminExamManager } from './pages/admin/AdminExamManager'
import { AdminExamCycleManager } from './pages/admin/AdminExamCycleManager'
import { AdminUserManager } from './pages/admin/AdminUserManager'
import { AdminUpdates } from './pages/admin/AdminUpdates'
import { AdminContent } from './pages/admin/AdminContent'
import { AdminJobs } from './pages/admin/AdminJobs'
import { InfoPage, CareersPage, CareerDetailPage } from './pages/InfoPages'

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
          <Seo />
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
                <Route path="/results" element={<UpdateListPage type="result" />} />
                <Route path="/results/:id" element={<UpdateDetailPage type="result" />} />
                <Route path="/admit-cards" element={<UpdateListPage type="admit_card" />} />
                <Route path="/admit-cards/:id" element={<UpdateDetailPage type="admit_card" />} />
                <Route path="/exams/:id" element={<ExamDetailPage />} />`r`n                <Route path="/about" element={<InfoPage slug="about" />} />`r`n                <Route path="/contact" element={<InfoPage slug="contact" />} />`r`n                <Route path="/privacy" element={<InfoPage slug="privacy" />} />`r`n                <Route path="/disclaimer" element={<InfoPage slug="disclaimer" />} />`r`n                <Route path="/terms" element={<InfoPage slug="terms" />} />`r`n                <Route path="/careers" element={<CareersPage />} />`r`n                <Route path="/careers/:id" element={<CareerDetailPage />} />
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
                <Route path="/admin/results" element={<AdminUpdates type="result" />} />
                <Route path="/admin/admit-cards" element={<AdminUpdates type="admit_card" />} />`r`n                <Route path="/admin/pages" element={<AdminContent />} />`r`n                <Route path="/admin/jobs" element={<AdminJobs />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}








