import { MapPin, Users, Activity, BarChart2 } from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'Asignación por zonas',
    description: 'Define las zonas de tu proyecto y asigna voluntarios automáticamente según cupos, preferencias y criterios definidos',
    iconBg: 'bg-feature-1-bg',
    iconColor: 'text-feature-1',
  },
  {
    icon: Users,
    title: 'Gestión centralizada en tiempo real',
    description: 'Administra voluntarios, monitorea el estado de las asignaciones y revisa la información de cada inscrito desde un solo lugar.',
    iconBg: 'bg-feature-2-bg',
    iconColor: 'text-feature-2',
  },
  {
    icon: Activity,
    title: 'Importación desde Excel/CSV',
    description: 'Carga el Excel o CSV con las inscripciones de tu proyecto y Assigna crea automáticamente la tabla de voluntarios con sus columnas, lista para comenzar la asignación.',
    iconBg: 'bg-feature-3-bg',
    iconColor: 'text-feature-3',
  },
  {
    icon: BarChart2,
    title: 'Asignación oficial automatizada',
    description: 'Define el flujo de asignación oficial de tu proyecto y deja que Assigna registre automáticamente a los voluntarios asignados, evitando ingresarlos uno por uno en otras plataformas.',
    iconBg: 'bg-feature-4-bg',
    iconColor: 'text-feature-4',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">
            Características
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Todo lo que necesitas para gestionar voluntarios de forma eficiente
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            Diseñado para organizaciones que buscan optimizar el proceso de inscripcion, automatizar la distribución de voluntarios por zonas y mejorar la eficiencia operativa durante todo el proceso.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div className={`mb-4 size-12 rounded-full ${feature.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className={`size-5 ${feature.iconColor}`} strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
