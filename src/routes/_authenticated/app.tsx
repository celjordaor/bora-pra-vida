import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/_authenticated/app')({
  component: DashboardPage,
})

function DashboardPage() {
  const { session } = useAuth()

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-navy-950 mb-1">Hoje</h2>
      <p className="text-gray-600 mb-6">
        Logado como{' '}
        <span className="font-medium">{session?.user.email}</span>
      </p>

      <div className="bg-white rounded-xl ring-1 ring-black/5 p-6">
        <p className="text-gray-500">
          Nenhuma atividade ainda. O board de tarefas chega na Fase 2 🚧
        </p>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-6 text-sm text-navy-600 hover:text-navy-950 underline"
      >
        Sair
      </button>
    </div>
  )
}
