'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Assigna</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer">
            Características
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer">
            Cómo funciona
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/home">Entrar a la demo</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-1">
            <Link href="#features" className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" onClick={() => setIsOpen(false)}>
              Características
            </Link>
            <Link href="#how-it-works" className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" onClick={() => setIsOpen(false)}>
              Cómo funciona
            </Link>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button asChild className="w-full">
              <Link href="/home" onClick={() => setIsOpen(false)}>Entrar a la demo</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
