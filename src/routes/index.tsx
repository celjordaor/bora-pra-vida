import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    navigate({ to: session ? '/app' : '/auth', replace: true })
  }, [loading, session, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-navy-600">
      Carregando…
    </div>
  )
}
