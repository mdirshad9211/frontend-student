import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const siteUrl = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
const searchConsoleToken = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION

const pageMetadata = {
  '/': {
    title: 'Sarkora | Government Exams, Results, Admit Cards and Syllabus',
    description: 'Find government exam notifications, application deadlines, admit cards, results and syllabus updates in one place.',
  },
  '/exams': {
    title: 'Government Exams and Notifications | Sarkora',
    description: 'Browse the latest government exam notifications, eligibility details and application deadlines.',
  },
  '/results': {
    title: 'Government Exam Results | Sarkora',
    description: 'Check the latest government exam and recruitment results from one reliable place.',
  },
  '/admit-cards': {
    title: 'Government Exam Admit Cards | Sarkora',
    description: 'Find government exam admit card updates, download links and important examination details.',
  },
  '/careers': {
    title: 'Careers | Sarkora',
    description: 'Explore career opportunities with Sarkora.',
  },
  '/about': { title: 'About Sarkora', description: 'Learn about Sarkora and our government-exam information service.' },
  '/contact': { title: 'Contact Sarkora', description: 'Contact the Sarkora team for feedback and support.' },
  '/privacy': { title: 'Privacy Policy | Sarkora', description: 'Read the Sarkora privacy policy.' },
  '/disclaimer': { title: 'Disclaimer | Sarkora', description: 'Read the Sarkora information disclaimer.' },
  '/terms': { title: 'Terms of Use | Sarkora', description: 'Read the Sarkora terms of use.' },
}

function getMetadata(pathname) {
  if (pathname.startsWith('/exams/')) {
    return {
      title: 'Government Exam Details | Sarkora',
      description: 'View government exam eligibility, dates, application details and important updates.',
    }
  }
  return pageMetadata[pathname] || pageMetadata['/']
}

export function Seo() {
  const { pathname } = useLocation()
  const metadata = getMetadata(pathname)
  const canonicalUrl = siteUrl ? siteUrl + pathname : undefined
  const isPublicPage = Boolean(pageMetadata[pathname]) || ['/exams/', '/results/', '/admit-cards/', '/careers/'].some((prefix) => pathname.startsWith(prefix))

  useEffect(() => {
    if (!gaMeasurementId) return
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments) }
    window.gtag('config', gaMeasurementId, { page_path: pathname })
  }, [pathname])

  const organizationSchema = siteUrl ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sarkora',
    url: siteUrl,
    sameAs: [
      'https://www.instagram.com/sarkora_official/',
      'https://t.me/sarkora_official',
    ],
  } : null

  return (
    <Helmet>
      <html lang="en-IN" />
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta name="robots" content={isPublicPage ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {siteUrl && <meta property="og:image" content={siteUrl + '/logo.jpeg'} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      {searchConsoleToken && <meta name="google-site-verification" content={searchConsoleToken} />}
      {gaMeasurementId && <script async src={'https://www.googletagmanager.com/gtag/js?id=' + gaMeasurementId} />}
      {organizationSchema && <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>}
    </Helmet>
  )
}
