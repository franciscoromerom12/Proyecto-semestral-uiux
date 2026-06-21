'use client'

import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Dashboard } from '@/components/features/volunteers/Dashboard'
import { ZoneManager } from '@/components/features/zones/ZoneManager'
import { ZoneView } from '@/components/features/zones/ZoneView'
import { FileUpload } from '@/components/features/volunteers/FileUpload'
import { CorrerListaEspera } from '@/components/features/volunteers/CorrerListaEspera'
import { VolunteerTable } from '@/components/features/volunteers/VolunteerTable'
import { WaitlistView } from '@/components/features/volunteers/WaitlistView'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useMockStore } from '@/components/providers/MockStoreProvider'

interface Props {
  inscripcionId: string
}

export function InscripcionDashboard({ inscripcionId }: Props) {
  const router = useRouter()
  const { inscripciones, atributos } = useMockStore()

  const inscripcion = inscripciones.find(i => i.id === inscripcionId)
  if (!inscripcion) notFound()

  const attrs = atributos[inscripcionId] ?? []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/home')} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-card-foreground">{inscripcion.titulo}</h1>
            {inscripcion.descripcion && (
              <p className="text-sm text-muted-foreground mt-0.5">{inscripcion.descripcion}</p>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Vista General</TabsTrigger>
            <TabsTrigger value="zonas">Zonas</TabsTrigger>
            <TabsTrigger value="voluntarios">Voluntarios</TabsTrigger>
            <TabsTrigger value="importar">Importar</TabsTrigger>
            <TabsTrigger value="espera">Lista de Espera</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Dashboard inscripcionId={inscripcionId} atributos={attrs} />
          </TabsContent>

          <TabsContent value="zonas">
            <div className="space-y-8">
              <ZoneView inscripcionId={inscripcionId} atributos={attrs} />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Separator className="flex-1" />
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Gestionar Zonas</span>
                  <Separator className="flex-1" />
                </div>
                <ZoneManager inscripcionId={inscripcionId} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voluntarios">
            <VolunteerTable inscripcionId={inscripcionId} atributos={attrs} />
          </TabsContent>

          <TabsContent value="importar">
            <Tabs defaultValue="archivo">
              <TabsList className="mb-4">
                <TabsTrigger value="archivo">Importar Excel</TabsTrigger>
                <TabsTrigger value="lista-espera">Correr lista de espera</TabsTrigger>
              </TabsList>
              <TabsContent value="archivo">
                <FileUpload inscripcionId={inscripcionId} atributos={attrs} />
              </TabsContent>
              <TabsContent value="lista-espera">
                <CorrerListaEspera inscripcionId={inscripcionId} atributos={attrs} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="espera">
            <WaitlistView inscripcionId={inscripcionId} atributos={attrs} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
