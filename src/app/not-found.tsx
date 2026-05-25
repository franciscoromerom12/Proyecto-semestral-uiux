import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-lg font-semibold text-foreground">Página no encontrada</p>
        <p className="text-sm text-muted-foreground">La página que buscas no existe o fue removida.</p>
        <Button asChild>
          <Link href="/home">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
