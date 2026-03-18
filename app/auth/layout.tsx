import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 w-fit group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <Ticket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Event<span className="text-primary">Access</span>
            </span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-muted-foreground">
          <p>
            Al continuar, aceptas nuestros{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terminos y Condiciones
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Politica de Privacidad
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-chart-2/20">
        {/* Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-lg mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-balance">
            Tu entrada al mejor{' '}
            <span className="gradient-text">entretenimiento</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Descubre miles de eventos, compra tus tickets de forma segura y 
            accede con tu codigo QR unico.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '10K+', label: 'Eventos' },
              { value: '500K+', label: 'Usuarios' },
              { value: '50+', label: 'Ciudades' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-chart-2/10 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  )
}
