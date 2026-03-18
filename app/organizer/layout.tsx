import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizerSidebar } from './sidebar'

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/organizer')
  }

  // Check if user is organizer or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'organizer' && profile.role !== 'admin')) {
    redirect('/?error=not_authorized')
  }

  return (
    <div className="min-h-screen flex">
      <OrganizerSidebar profile={profile} />
      <main className="flex-1 ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
