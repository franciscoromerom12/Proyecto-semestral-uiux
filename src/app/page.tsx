import { Navbar } from '@/components/features/marketing/Navbar'
import { HeroSection } from '@/components/features/marketing/HeroSection'
import { FeaturesSection } from '@/components/features/marketing/FeaturesSection'
import { HowItWorksSection } from '@/components/features/marketing/HowItWorksSection'
import { CTASection } from '@/components/features/marketing/CTASection'
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">A</span>
            </div>
            <span className="font-medium text-foreground">Assigna</span>
          </div>
          <p>© 2025 Assigna. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
