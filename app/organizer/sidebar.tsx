'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  QrCode,
  ArrowLeft
} from 'lucide-react'
import type { Profile } from '@/lib/types'

interface OrganizerSidebarProps {
  profile: Profile
}

const navItems = [
  { href: '/organizer', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/organizer/events', icon: Calendar, label: 'Mis Eventos' },
  { href: '/organizer/orders', icon: Ticket, label: 'Ordenes' },
  { href: '/organizer/scanner', icon: QrCode, label: 'Escaner QR' },
  { href: '/organizer/settings', icon: Settings, label: 'Configuracion' },
]

export function OrganizerSidebar({ profile }: OrganizerSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Ticket className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">
            Event<span className="text-primary">Access</span>
          </span>
        </Link>
        <Button asChild size="sm" variant="outline" className="w-full gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>

      {/* Create Event Button */}
      <div className="p-4">
        <Button asChild className="w-full glow-primary">
          <Link href="/organizer/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/organizer' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'O'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{profile.full_name || 'Organizador'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-destructive mt-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesion
        </Button>
      </div>
    </aside>
  )
}
