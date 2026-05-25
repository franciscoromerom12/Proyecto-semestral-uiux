import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const highlights = [
  'Asignación automática por zonas',
  'Panel de control en tiempo real',
  'Sin hojas de cálculo',
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center">
      <div className="pointer-events-none absolute hidden lg:block" style={{ width: '300px', height: '260px', left: '36%', top: '10%', borderRadius: '43% 57% 65% 35% / 35% 42% 58% 65%', background: 'hsl(221 83% 53% / 0.14)', filter: 'blur(5px)' }} />
      <svg className="pointer-events-none absolute right-0 top-0 h-full hidden lg:block" style={{ width: '56%' }} viewBox="0 0 560 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M560,0 L560,900 L118,900 C52,808 -18,658 24,498 C66,338 182,238 150,94 C128,16 212,0 560,0 Z" fill="hsl(221, 83%, 53%)" />
      </svg>
      <div className="pointer-events-none absolute inset-0 lg:hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-2xl rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 w-full py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3.5 py-1.5 text-sm font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Orden inteligente de voluntarios
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.12]">
              Ordena tu grupo de voluntarios{' '}
              <span className="text-primary">sin esfuerzo</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Assigna automatiza y optimiza la asignación de voluntarios por zonas mediante algoritmos inteligentes,
              reduciendo el tiempo de organización y mejorando la eficiencia del proceso de inscripción.
            </p>
            <ul className="space-y-2.5">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button size="lg" asChild>
                <Link href="/home">
                  Ver la demo
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Cómo funciona</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <AppPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

function AppPreview() {
  const volunteers = [
    { initials: 'MG', name: 'María García', zone: 'Zona Norte', status: 'Asignado', statusColor: 'bg-emerald-100 text-emerald-700' },
    { initials: 'CL', name: 'Carlos López', zone: 'Zona Sur', status: 'Asignado', statusColor: 'bg-emerald-100 text-emerald-700' },
    { initials: 'AM', name: 'Ana Martínez', zone: '—', status: 'En espera', statusColor: 'bg-amber-100 text-amber-700' },
    { initials: 'LR', name: 'Luis Rodríguez', zone: 'Zona Este', status: 'Asignado', statusColor: 'bg-emerald-100 text-emerald-700' },
  ]
  return (
    <div className="relative w-full max-w-md">
      <div className="rounded-2xl border border-white/20 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-3">
          <div className="size-2.5 rounded-full bg-red-400/70" />
          <div className="size-2.5 rounded-full bg-amber-400/70" />
          <div className="size-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-3 h-4 w-36 rounded-md bg-muted" />
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[{ label: 'Voluntarios', value: '33', dotColor: 'bg-primary' }, { label: 'Asignados', value: '30', dotColor: 'bg-emerald-500' }, { label: 'Zonas activas', value: '5', dotColor: 'bg-violet-500' }].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-background p-3">
                <div className={`size-1.5 rounded-full ${stat.dotColor} mb-2`} />
                <div className="text-sm font-bold text-foreground">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/30">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Voluntarios</span>
              <div className="h-2 w-14 rounded bg-muted" />
            </div>
            <div className="divide-y divide-border">
              {volunteers.map((v) => (
                <div key={v.name} className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-primary">{v.initials}</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground">{v.name}</div>
                      <div className="text-[10px] text-muted-foreground">{v.zone}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${v.statusColor}`}>{v.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 rounded-xl border border-border bg-white p-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">Zona Norte cubierta</div>
            <div className="text-[10px] text-muted-foreground">hace 2 minutos</div>
          </div>
        </div>
      </div>
    </div>
  )
}
