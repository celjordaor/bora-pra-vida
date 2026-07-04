import { useCallback, useEffect, useState } from 'react'
import {
  fetchActivities,
  updateActivityStatus,
  generateNextOccurrence,
} from '@/lib/activities'
import { fetchSpaces } from '@/lib/spaces'
import { toast } from '@/lib/toast'
import type { Activity, ActivityStatus, Space } from '@/types/activity'

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [a, s] = await Promise.all([fetchActivities(), fetchSpaces()])
      setActivities(a)
      setSpaces(s)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function changeStatus(id: string, status: ActivityStatus) {
    const activity = activities.find((a) => a.id === id) ?? null
    const previous = activities
    // atualização otimista: já move o card na tela antes da resposta do servidor
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    try {
      await updateActivityStatus(id, status)

      if (status === 'done' && activity) {
        const created = await generateNextOccurrence(activity)
        if (created) {
          toast.success('Próxima ocorrência criada automaticamente.')
          refresh()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao mover atividade')
      setActivities(previous)
    }
  }

  return { activities, spaces, loading, error, refresh, changeStatus }
}
