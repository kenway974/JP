import type { Metadata } from 'next'
import { COMPANY_SHORT_NAME } from '@/lib/config'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export const metadata: Metadata = {
  title: `Administration | ${COMPANY_SHORT_NAME}`,
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <AdminSidebar companyShortName={COMPANY_SHORT_NAME} />
      <main className="p-4 md:flex-1 md:p-8 overflow-auto min-w-0">{children}</main>
    </div>
  )
}
