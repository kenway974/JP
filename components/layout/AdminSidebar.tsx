'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, Star, FileText, ArrowLeft, Menu, X, SlidersHorizontal, Image as ImageIcon } from 'lucide-react'
import { LogoutButton } from './LogoutButton'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/leads', icon: Users, label: 'Leads' },
  { href: '/admin/slots', icon: Calendar, label: 'Créneaux' },
  { href: '/admin/realisations', icon: ImageIcon, label: 'Réalisations' },
  { href: '/admin/blog', icon: FileText, label: 'Blog' },
  { href: '/admin/avis', icon: Star, label: 'Avis' },
  { href: '/admin/estimation', icon: SlidersHorizontal, label: 'Estimateur' },
]

export function AdminSidebar({ companyShortName }: { companyShortName: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-brand-navy text-white px-4 py-3">
        <span className="font-bold text-sm">{companyShortName} — Administration</span>
        <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 md:w-56 bg-brand-navy text-white flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">{companyShortName}</div>
            <div className="text-xs text-slate-400">Administration</div>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === href ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 space-y-1 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
