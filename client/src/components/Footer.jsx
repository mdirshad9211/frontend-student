import { Link } from 'react-router-dom'
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <Container className="py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-extrabold tracking-tight text-gray-900">Exam Tracker</div>
            <div className="mt-1 text-sm text-gray-600">
              Discover eligible exams, track deadlines, and never miss an application window.
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link className="text-gray-700 hover:text-gray-900" to="/exams">
              Exams
            </Link>
            <Link className="text-gray-700 hover:text-gray-900" to="/login">
              Login
            </Link>
            <Link className="text-gray-700 hover:text-gray-900" to="/register">
              Register
            </Link>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-500">
          © {new Date().getFullYear()} Exam Tracker. Not affiliated with any government body.
        </div>
      </Container>
    </footer>
  )
}

