// Edge Function: push-reminders
// Chamada pelo pg_cron a cada 5 minutos (veja o SQL de agendamento no
// README da Fase 7, parte 2). NÃO é chamada por usuários — por isso o
// deploy é feito com --no-verify-jwt e a proteção é o header x-cron-secret.
//
// Deploy: supabase functions deploy push-reminders --no-verify-jwt

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

webpush.setVapidDetails(
  'mailto:contato@borapravida.com.br',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function sendToUser(userId: string, payload: Record<string, unknown>) {
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return

  const json = JSON.stringify(payload)
  const results = await Promise.allSettled(
    subs.map((sub: any) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        json
      )
    )
  )

  for (const [i, result] of results.entries()) {
    if (result.status === 'rejected') {
      const statusCode = (result.reason as any)?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('id', subs[i].id)
      }
    }
  }
}

/** "Agora" convertido pro fuso horário informado (ex.: 'America/Sao_Paulo'). */
function nowInTimeZone(timeZone: string): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone }))
}

Deno.serve(async (req) => {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: prefsRows } = await admin
    .from('notification_prefs')
    .select(
      'user_id, task_reminders_enabled, morning_summary_enabled, send_hour, last_morning_summary_date'
    )

  const { data: profiles } = await admin.from('profiles').select('id, timezone')
  const timezoneByUser = new Map(
    (profiles ?? []).map((p: any) => [p.id, p.timezone || 'America/Sao_Paulo'])
  )

  const prefsByUser = new Map((prefsRows ?? []).map((p: any) => [p.user_id, p]))

  // --------------------------------------------------------------
  // 1) Lembrete no horário da tarefa (janela de tolerância: 10 minutos,
  //    pra cobrir possíveis atrasos do próprio cron)
  // --------------------------------------------------------------
  const { data: dueActivities } = await admin
    .from('activities')
    .select('id, user_id, title, due_date, due_time, status, reminder_sent_at')
    .not('due_time', 'is', null)
    .neq('status', 'done')
    .is('reminder_sent_at', null)

  for (const activity of dueActivities ?? []) {
    const prefs = prefsByUser.get(activity.user_id)
    if (!prefs?.task_reminders_enabled) continue

    const tz = timezoneByUser.get(activity.user_id) ?? 'America/Sao_Paulo'
    const nowLocal = nowInTimeZone(tz)
    const todayLocalISO = nowLocal.toISOString().slice(0, 10)
    if (activity.due_date !== todayLocalISO) continue

    const [dueHour, dueMinute] = activity.due_time.slice(0, 5).split(':').map(Number)
    const dueMinutesTotal = dueHour * 60 + dueMinute
    const nowMinutesTotal = nowLocal.getHours() * 60 + nowLocal.getMinutes()
    const minutesLate = nowMinutesTotal - dueMinutesTotal

    if (minutesLate >= 0 && minutesLate < 10) {
      await sendToUser(activity.user_id, {
        title: `⏰ ${activity.title}`,
        body: 'Está na hora dessa atividade.',
        url: '/app',
      })
      await admin
        .from('activities')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', activity.id)
    }
  }

  // --------------------------------------------------------------
  // 2) Resumo matinal (uma vez por dia, no horário configurado)
  // --------------------------------------------------------------
  for (const prefs of prefsRows ?? []) {
    if (!prefs.morning_summary_enabled) continue

    const tz = timezoneByUser.get(prefs.user_id) ?? 'America/Sao_Paulo'
    const nowLocal = nowInTimeZone(tz)
    const todayLocalISO = nowLocal.toISOString().slice(0, 10)

    if (prefs.last_morning_summary_date === todayLocalISO) continue
    if (nowLocal.getHours() !== prefs.send_hour) continue

    const { count: activitiesToday } = await admin
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', prefs.user_id)
      .eq('due_date', todayLocalISO)
      .neq('status', 'done')

    const { count: pendingShopping } = await admin
      .from('shopping_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', prefs.user_id)
      .eq('checked', false)

    await sendToUser(prefs.user_id, {
      title: 'Bom dia! ☀️',
      body: `${activitiesToday ?? 0} atividade(s) hoje, ${pendingShopping ?? 0} item(ns) pendente(s) nas compras.`,
      url: '/app',
    })

    await admin
      .from('notification_prefs')
      .update({ last_morning_summary_date: todayLocalISO })
      .eq('user_id', prefs.user_id)
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
