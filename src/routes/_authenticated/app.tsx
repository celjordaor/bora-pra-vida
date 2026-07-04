import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useActivities } from '@/hooks/useActivities'
import { StatusColumn } from '@/components/board/StatusColumn'
import { ActivityModal } from '@/components/board/ActivityModal'
import { QuickAddBar } from '@/components/board/QuickAddBar'
import type { Activity, ActivityStatus } from '@/types/activity'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/_authenticated/app')({
  component: DashboardPage,
})

const COLUMNS: { status: ActivityStatus; title: string }[] = [
  { status: 'todo', title: 'A fazer' },
  { status: 'doing', title: 'Fazendo' },
  { status: 'done', title: 'Feito' },
]

function DashboardPage() {
  const { session } = useAuth()
  const { activities, spaces, loading, error, refresh, changeStatus, quickCreate } =
    useActivities()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  function openCreate() {
    setEditingActivity(null)
    setModalOpen(true)
  }

  function openEdit(activity: Activity) {
    setEditingActivity(activity)
    setModalOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-navy-950">Hoje</h2>
          <p className="text-gray-500 text-sm">{session?.user.email}</p>
        </div>
        <button
          onClick={openCreate}
          className="text-sm text-navy-600 hover:text-navy-950 underline shrink-0"
        >
          Formulário completo (subtarefas, repetição…)
        </button>
      </div>

      <QuickAddBar onCreate={quickCreate} />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Carregando…</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <StatusColumn
              key={col.status}
              title={col.title}
              status={col.status}
              activities={activities.filter((a) => a.status === col.status)}
              onCardClick={openEdit}
              onStatusChange={changeStatus}
              onAddClick={openCreate}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ActivityModal
          activity={editingActivity}
          spaces={spaces}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            refresh()
          }}
          onDeleted={() => {
            setModalOpen(false)
            refresh()
          }}
        />
      )}

      <button
        onClick={() => supabase.auth.signOut()}
        className="mt-8 text-sm text-navy-600 hover:text-navy-950 underline"
      >
        Sair
      </button>
    </div>
  )
}
