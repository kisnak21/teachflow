import { auth } from '@/auth'
import { Navbar } from '@/components/landing/navbar'
import { ScrollProgress } from '@/components/landing/scroll-progress'
import { Hero } from '@/components/landing/hero'
import { Problem } from '@/components/landing/problem'
import { Journey } from '@/components/landing/journey'
import { Solution } from '@/components/landing/solution'
import { Testimonials } from '@/components/landing/testimonials'
import { AiShowcase } from '@/components/landing/ai-showcase'
import { Pricing } from '@/components/landing/pricing'
import { Climax } from '@/components/landing/climax'
import { Footer } from '@/components/landing/footer'

export default async function LandingPage() {
  const session = await auth()
  const isAuthenticated = Boolean(session?.user?.id)
  const dashboardHref =
    session?.user?.role === 'student' ? '/student/dashboard' : '/dashboard'

  return (
    <>
      <ScrollProgress />
      <Navbar isAuthenticated={isAuthenticated} dashboardHref={dashboardHref} />
      <main id="konten">
        <Hero isAuthenticated={isAuthenticated} dashboardHref={dashboardHref} />
        <Problem />
        <Journey />
        <Solution />
        <Testimonials />
        <AiShowcase />
        <Pricing
          isAuthenticated={isAuthenticated}
          dashboardHref={dashboardHref}
        />
        <Climax
          isAuthenticated={isAuthenticated}
          dashboardHref={dashboardHref}
        />
      </main>
      <Footer />
    </>
  )
}
