'use client'

import { useRouter } from 'next/navigation'
import type { InscripcionEntity } from '@/lib/domain/inscripciones/types'
import type { AtributoEntity } from '@/lib/domain/atributos/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Dashboard } from '@/components/features/volunteers/Dashboard'
import { ZoneManager } from '@/components/features/zones/ZoneManager'
import { ZoneView } from '@/components/features/zones/ZoneView'
import { FileUpload } from '@/components/features/volunteers/FileUpload'
import { VolunteerTable } from '@/components/features/volunteers/VolunteerTable'
import { WaitlistView } from '@/components/features/volunteers/WaitlistView'
import { Separator } from '@/components/ui/separator'

interface Props {
  inscripcion: InscripcionEntity
  atributos: AtributoEntity[]
}

export function InscripcionDashboard({ inscripcion, atributos }: Props) {
  const router = useRouter()

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
            <Dashboard inscripcionId={inscripcion.id} />
          </TabsContent>

          <TabsContent value="zonas">
            <div className="space-y-8">
              <ZoneView inscripcionId={inscripcion.id} atributos={atributos} />
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Separator className="flex-1" />
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Gestionar Zonas</span>
                  <Separator className="flex-1" />
                </div>
                <ZoneManager inscripcionId={inscripcion.id} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voluntarios">
            <VolunteerTable inscripcionId={inscripcion.id} atributos={atributos} />
          </TabsContent>

          <TabsContent value="importar">
            <FileUpload inscripcionId={inscripcion.id} atributos={atributos} />
          </TabsContent>

          <TabsContent value="espera">
            <WaitlistView inscripcionId={inscripcion.id} atributos={atributos} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
