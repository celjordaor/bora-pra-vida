import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/Sidebar'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: '/auth' })
    }
  }, [loading, session, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-navy-600">
        Carregando…
      </div>
    )
  }

  if (!session) {
    // Evita mostrar conteúdo protegido por um instante enquanto redireciona
    return null
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
