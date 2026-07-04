import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  isPushSupported,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
} from '@/lib/push'
import {
  fetchNotificationPrefs,
  updateNotificationPrefs,
  type NotificationPrefs,
} from '@/lib/notification-prefs'
import { toast } from '@/lib/toast'
import { ShoppingCategoriesManager } from '@/components/settings/ShoppingCategoriesManager'

export const Route = createFileRoute('/_authenticated/configuracoes')({
  component: SettingsPage,
})

function SettingsPage() {
  const [supported, setSupported] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [loadingSub, setLoadingSub] = useState(false)
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null)
  const [loadingPrefs, setLoadingPrefs] = useState(true)

  useEffect(() => {
    setSupported(isPushSupported())
    getExistingSubscription().then((sub) => setSubscribed(!!sub))
    fetchNotificationPrefs()
      .then(setPrefs)
      .finally(() => setLoadingPrefs(false))
  }, [])

  async function handleSubscribe() {
    setLoadingSub(true)
    try {
      await subscribeToPush()
      setSubscribed(true)
      toast.success('Notificações ativadas neste dispositivo.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao ativar notificações')
    } finally {
      setLoadingSub(false)
    }
  }

  async function handleUnsubscribe() {
    setLoadingSub(true)
    try {
      await unsubscribeFromPush()
      setSubscribed(false)
      toast.success('Notificações desativadas neste dispositivo.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao desativar notificações')
    } finally {
      setLoadingSub(false)
    }
  }

  async function handleTestPush() {
    try {
      const result = await sendTestPush()
      if (result?.sent > 0) {
        toast.success('Notificação de teste enviada — deve chegar em alguns segundos.')
      } else {
        toast.error('Nenhuma inscrição encontrada. Tente ativar de novo.')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao enviar notificação de teste'
      )
    }
  }

  async function handlePrefChange(patch: Partial<NotificationPrefs>) {
    if (!prefs) return
    const previous = prefs
    setPrefs({ ...prefs, ...patch })
    try {
      await updateNotificationPrefs(patch)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar preferência')
      setPrefs(previous)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="rounded-xl bg-gradient-to-br from-navy-950 to-navy-600 text-white p-5 mb-6">
        <h2 className="text-xl font-semibold">⚙️ Configurações</h2>
        <p className="text-navy-200 text-sm mt-1">
          Notificações, categorias de compras e preferências do app.
        </p>
      </div>

      <div className="bg-white rounded-xl ring-1 ring-black/5 p-6 mb-6">
        <h3 className="font-medium text-navy-950 mb-2">🔔 Notificações push</h3>

        {!supported ? (
          <p className="text-sm text-gray-500">
            Seu navegador não suporta notificações push.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {subscribed
                ? 'Notificações ativadas neste dispositivo.'
                : 'Ative pra receber lembretes de tarefas neste dispositivo.'}
            </p>
            <div className="flex gap-3 flex-wrap items-center">
              {!subscribed ? (
                <button
                  onClick={handleSubscribe}
                  disabled={loadingSub}
                  className="bg-navy-600 hover:bg-navy-950 transition-colors text-white text-sm rounded-lg px-4 py-2 font-medium disabled:opacity-60"
                >
                  {loadingSub ? 'Ativando…' : 'Ativar notificações'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleTestPush}
                    className="text-sm text-navy-600 hover:text-navy-950 underline"
                  >
                    Enviar notificação de teste
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={loadingSub}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    Desativar neste dispositivo
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {subscribed && !loadingPrefs && prefs && (
        <div className="bg-white rounded-xl ring-1 ring-black/5 p-6 flex flex-col gap-4 mb-6">
          <h3 className="font-medium text-navy-950">Preferências de lembrete</h3>

          <label className="flex items-center justify-between text-sm gap-4">
            <span>⏰ Lembrete no horário da tarefa</span>
            <input
              type="checkbox"
              checked={prefs.task_reminders_enabled}
              onChange={(e) =>
                handlePrefChange({ task_reminders_enabled: e.target.checked })
              }
              className="accent-navy-600 h-4 w-4 shrink-0"
            />
          </label>

          <label className="flex items-center justify-between text-sm gap-4">
            <span>☀️ Resumo matinal</span>
            <input
              type="checkbox"
              checked={prefs.morning_summary_enabled}
              onChange={(e) =>
                handlePrefChange({ morning_summary_enabled: e.target.checked })
              }
              className="accent-navy-600 h-4 w-4 shrink-0"
            />
          </label>

          <label className="flex items-center justify-between text-sm gap-4">
            <span>🌙 Lembrete de fim de dia</span>
            <input
              type="checkbox"
              checked={prefs.end_of_day_enabled}
              onChange={(e) => handlePrefChange({ end_of_day_enabled: e.target.checked })}
              className="accent-navy-600 h-4 w-4 shrink-0"
            />
          </label>

          {prefs.morning_summary_enabled && (
            <label className="flex items-center justify-between text-sm gap-4">
              <span>Horário do resumo matinal</span>
              <input
                type="number"
                min={0}
                max={23}
                value={prefs.send_hour}
                onChange={(e) => handlePrefChange({ send_hour: Number(e.target.value) })}
                className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-sm"
              />
            </label>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl ring-1 ring-black/5 p-6">
        <h3 className="font-medium text-navy-950 mb-1">🏷️ Categorias de compras</h3>
        <p className="text-xs text-gray-500 mb-3">
          Crie, renomeie, mude a cor ou desative categorias — os itens da
          lista de compras usam elas pra se agrupar automaticamente.
        </p>
        <ShoppingCategoriesManager />
      </div>
    </div>
  )
}
