import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center text-white md:px-16">
          <div className="pointer-events-none absolute -top-32 -right-32 size-80 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-white/5 blur-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Listo para transformar tu operación
            </h2>
            <p className="text-white/75 max-w-lg mx-auto text-lg leading-relaxed">
              Únete a los voluntariados que ya coordinan a sus voluntarios con Assigna.
              Sin tarjeta de crédito requerida.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                <Link href="/home">
                  Entrar a la demo
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
