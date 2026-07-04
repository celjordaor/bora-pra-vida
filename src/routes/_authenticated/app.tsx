import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useActivities } from '@/hooks/useActivities'
import { StatusColumn } from '@/components/board/StatusColumn'
import { ActivityModal } from '@/components/board/ActivityModal'
import { QuickAddBar } from '@/components/board/QuickAddBar'
import { useConfirm } from '@/components/ui/ConfirmDialogProvider'
import { toast } from '@/lib/toast'
import { isOfflineError } from '@/lib/offline-sync'
import { deleteActivity } from '@/lib/activities'
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
  const confirmDialog = useConfirm()

  function openCreate() {
    setEditingActivity(null)
    setModalOpen(true)
  }

  function openEdit(activity: Activity) {
    setEditingActivity(activity)
    setModalOpen(true)
  }

  async function handleSwipeDelete(activity: Activity) {
    const ok = await confirmDialog({
      title: 'Excluir atividade',
      message: `Tem certeza que quer excluir "${activity.title}"? Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return

    try {
      await deleteActivity(activity.id)
      toast.success('Atividade excluída.')
      refresh()
    } catch (err) {
      if (isOfflineError(err)) {
        toast.info('Sem conexão — a exclusão será sincronizada quando o sinal voltar.')
        return
      }
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
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
              onDeleteActivity={handleSwipeDelete}
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
