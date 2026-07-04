import { useState } from 'react'
import type { Activity, ActivityPriority, Space, Subtask } from '@/types/activity'
import { todayISO, tomorrowISO } from '@/lib/date'
import {
  createActivity,
  updateActivity,
  deleteActivity,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
} from '@/lib/activities'
import { useConfirm } from '@/components/ui/ConfirmDialogProvider'
import { toast } from '@/lib/toast'

interface Props {
  activity: Activity | null
  spaces: Space[]
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
}

function chipButtonClass(active: boolean) {
  return `text-xs rounded-full px-3 py-1 border transition-colors ${
    active
      ? 'bg-navy-600 text-white border-navy-600'
      : 'border-gray-200 text-gray-600 hover:border-navy-600'
  }`
}

export function ActivityModal({ activity, spaces, onClose, onSaved, onDeleted }: Props) {
  const isEditing = !!activity
  const confirmDialog = useConfirm()

  const [title, setTitle] = useState(activity?.title ?? '')
  const [description, setDescription] = useState(activity?.description ?? '')
  const [spaceId, setSpaceId] = useState(activity?.space_id ?? spaces[0]?.id ?? '')
  const [priority, setPriority] = useState<ActivityPriority>(
    activity?.priority ?? 'medium'
  )
  const [dueDate, setDueDate] = useState(activity?.due_date ?? '')
  const [dueTime, setDueTime] = useState(activity?.due_time?.slice(0, 5) ?? '')
  const [subtasks, setSubtasks] = useState<Subtask[]>(activity?.subtasks ?? [])
  const [newSubtask, setNewSubtask] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!title.trim()) {
      setError('Dá um título pra atividade.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      space_id: spaceId || null,
      priority,
      due_date: dueDate || null,
      due_time: dueDate && dueTime ? dueTime : null,
    }

    try {
      if (isEditing) {
        await updateActivity(activity!.id, payload)
        toast.success('Atividade atualizada.')
      } else {
        const created = await createActivity(payload)
        for (const [i, s] of subtasks.entries()) {
          await addSubtask(created.id, s.title, i, s.done)
        }
        toast.success('Atividade criada.')
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!activity) return
    const ok = await confirmDialog({
      title: 'Excluir atividade',
      message: `Tem certeza que quer excluir "${activity.title}"? Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return

    setSaving(true)
    try {
      await deleteActivity(activity.id)
      toast.success('Atividade excluída.')
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
      setSaving(false)
    }
  }

  async function handleAddSubtask() {
    const trimmed = newSubtask.trim()
    if (!trimmed) return
    setNewSubtask('')

    if (isEditing) {
      try {
        const created = await addSubtask(activity!.id, trimmed, subtasks.length)
        setSubtasks((prev) => [...prev, created as Subtask])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao adicionar subtarefa')
      }
    } else {
      // atividade ainda não existe: guarda localmente, é salvo junto no handleSave
      setSubtasks((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          activity_id: '',
          title: trimmed,
          done: false,
          sort_order: prev.length,
        },
      ])
    }
  }

  async function handleToggleSubtask(s: Subtask) {
    setSubtasks((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x))
    )
    if (isEditing) {
      try {
        await toggleSubtask(s.id, !s.done)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar subtarefa')
      }
    }
  }

  async function handleDeleteSubtask(s: Subtask) {
    setSubtasks((prev) => prev.filter((x) => x.id !== s.id))
    if (isEditing && !s.id.startsWith('temp-')) {
      try {
        await deleteSubtask(s.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir subtarefa')
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-navy-950 mb-4">
          {isEditing ? 'Editar atividade' : 'Nova atividade'}
        </h3>

        <div className="flex flex-col gap-4">
          <input
            autoFocus
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-navy-600"
          />

          <textarea
            placeholder="Descrição (opcional)"
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-navy-600 resize-none"
          />

          <div className="flex gap-3">
            <label className="flex-1 text-sm text-gray-600 flex flex-col gap-1">
              Espaço
              <select
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex-1 text-sm text-gray-600 flex flex-col gap-1">
              Prioridade
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActivityPriority)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </label>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Data</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setDueDate(todayISO())}
                className={chipButtonClass(dueDate === todayISO())}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setDueDate(tomorrowISO())}
                className={chipButtonClass(dueDate === tomorrowISO())}
              >
                Amanhã
              </button>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
              />
              {dueDate && (
                <>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDueDate('')
                      setDueTime('')
                    }}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    limpar
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Subtarefas</p>
            <div className="flex flex-col gap-1 mb-2">
              {subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => handleToggleSubtask(s)}
                    className="accent-navy-600"
                  />
                  <span
                    className={
                      s.done ? 'line-through text-gray-400 flex-1' : 'flex-1'
                    }
                  >
                    {s.title}
                  </span>
                  <button
                    onClick={() => handleDeleteSubtask(s)}
                    className="text-gray-300 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                placeholder="Adicionar subtarefa…"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-navy-600"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="text-sm text-navy-600 hover:text-navy-950"
              >
                Adicionar
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            {isEditing ? (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="text-sm text-red-600 hover:underline disabled:opacity-60"
              >
                Excluir
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-navy-950 px-3 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-navy-600 hover:bg-navy-950 transition-colors text-white text-sm rounded-lg px-4 py-2 font-medium disabled:opacity-60"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
