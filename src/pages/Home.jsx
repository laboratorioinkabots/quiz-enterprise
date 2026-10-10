import PublicHeader from '../components/public/PublicHeader'
import HeroSection from '../components/public/HeroSection'
import HowItWorks from '../components/public/HowItWorks'
import FeatureSection from '../components/public/FeatureSection'
import PublicCourses from '../components/public/PublicCourses'
import CompanySection from '../components/public/CompanySection'
import FaqSection from '../components/public/FaqSection'
import PublicFooter from '../components/public/PublicFooter'
import FinalCta from '../components/public/FinalCta'
export default function Home() {
  return (
    <div className="public-page">

      <div className="public-hero-shell">
        <PublicHeader />
        <HeroSection />
      </div>

      <main>
        <HowItWorks />

        <FeatureSection />

        <PublicCourses />

        <CompanySection />

        <FaqSection />
        <FinalCta />
      </main>

      <PublicFooter />

    </div>
  )
}