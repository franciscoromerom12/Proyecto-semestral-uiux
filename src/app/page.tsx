import { Navbar } from '@/components/features/marketing/Navbar'
import { HeroSection } from '@/components/features/marketing/HeroSection'
import { FeaturesSection } from '@/components/features/marketing/FeaturesSection'
import { HowItWorksSection } from '@/components/features/marketing/HowItWorksSection'
import { CTASection } from '@/components/features/marketing/CTASection'
import { Linkedin } from 'lucide-react'

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
          <div className="flex items-center gap-2.5">
            <span className="text-slate-500 text-xs sm:text-sm">Hecho por</span>
            <a
              href="https://www.linkedin.com/in/francisco-romero-545b08400/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-foreground hover:text-indigo-500 transition-colors group"
            >
              <div className="bg-[#0A66C2] group-hover:bg-indigo-500 rounded-md p-1 transition-colors">
                <Linkedin className="size-3.5 text-white" />
              </div>
              Francisco Romero
            </a>
          </div>
          <p>© 2025 Assigna. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
