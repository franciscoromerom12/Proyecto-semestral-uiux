import { Upload, MapPin, SlidersHorizontal, Zap } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Importa tu Excel y mapea tu tabla',
    description:
      'Sube el archivo con tus inscripciones y Assigna detecta automáticamente las columnas. Mapea cada columna a los atributos de tu proyecto en segundos, sin configuración manual.',
    iconBg: 'bg-feature-3-bg',
    iconColor: 'text-feature-3',
  },
  {
    number: '02',
    icon: MapPin,
    title: 'Agrega las zonas de tu proyecto',
    description:
      'Define las zonas con sus cupos y parámetros. Puedes agregar tantas zonas como necesites y ajustar los cupos en cualquier momento antes de la asignación.',
    iconBg: 'bg-feature-1-bg',
    iconColor: 'text-feature-1',
  },
  {
    number: '03',
    icon: SlidersHorizontal,
    title: 'Define los criterios de ordenamiento',
    description:
      'Configura las prioridades y restricciones propias de tu voluntariado: equilibrio de género, diversidad de carreras, preferencias de zona, orden de llegada y más.',
    iconBg: 'bg-feature-2-bg',
    iconColor: 'text-feature-2',
  },
  {
    number: '04',
    icon: Zap,
    title: 'Ordena a los voluntarios automáticamente',
    description:
      'Con un clic, Assigna distribuye a todos los voluntarios respetando tus criterios. Puedes ajustar manualmente cualquier asignación y exportar el resultado final.',
    iconBg: 'bg-feature-4-bg',
    iconColor: 'text-feature-4',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">
            Cómo funciona
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            De tu Excel a la asignación final en cuatro pasos
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            Un flujo simple y guiado para que cualquier organizador pueda coordinar a sus
            voluntarios sin fricción ni hojas de cálculo.
          </p>
        </div>

        {/* Desktop: horizontal steps */}
        <div className="hidden md:grid md:grid-cols-4 gap-0 relative">
          {/* Connector line */}
          <div
            className="absolute top-[2.75rem] left-[12.5%] right-[12.5%] h-px bg-border"
            aria-hidden="true"
          />

          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center px-4 relative">
              {/* Icon bubble */}
              <div className={`relative z-10 mb-6 size-[3.25rem] rounded-full ${step.iconBg} flex items-center justify-center ring-4 ring-background`}>
                <step.icon className={`size-5 ${step.iconColor}`} strokeWidth={1.75} />
              </div>

              {/* Step number badge */}
              <span className={`text-[0.65rem] font-bold tracking-widest uppercase mb-2 ${step.iconColor} opacity-70`}>
                Paso {step.number}
              </span>

              <h3 className="font-semibold text-foreground mb-2 leading-snug">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden flex flex-col gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-4">
              {/* Left: icon + line */}
              <div className="flex flex-col items-center">
                <div className={`size-11 rounded-full ${step.iconBg} flex items-center justify-center shrink-0`}>
                  <step.icon className={`size-4 ${step.iconColor}`} strokeWidth={1.75} />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border my-2" aria-hidden="true" />
                )}
              </div>

              {/* Right: content */}
              <div className="pb-10">
                <span className={`text-[0.65rem] font-bold tracking-widest uppercase ${step.iconColor} opacity-70`}>
                  Paso {step.number}
                </span>
                <h3 className="font-semibold text-foreground mt-0.5 mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
