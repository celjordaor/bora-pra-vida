import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking')

  useEffect(() => {
    // Chamada simples só para confirmar que as chaves do Supabase estão
    // configuradas corretamente. Não depende de nenhuma tabela existir ainda.
    supabase.auth.getSession().then(({ error }) => {
      setStatus(error ? 'error' : 'ok')
    })
  }, [])

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-navy-950 text-white p-6 hidden md:flex md:flex-col gap-4">
        <h1 className="text-xl font-semibold">Bora pra Vida</h1>
        <p className="text-navy-200 text-sm">Fase 0 — Fundação técnica</p>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-xl bg-white rounded-xl ring-1 ring-black/5 p-6">
          <h2 className="text-lg font-semibold text-navy-950 mb-2">
            Scaffold funcionando 🎉
          </h2>
          <p className="text-gray-600 mb-4">
            Este é o esqueleto inicial do Bora pra Vida: Vite + React 19 +
            TanStack Router + Tailwind v4, com a paleta Slate Navy já
            configurada e o cliente Supabase pronto para uso.
          </p>

          <div className="text-sm">
            <span className="font-medium text-navy-950">Status Supabase: </span>
            {status === 'checking' && (
              <span className="text-navy-600">verificando…</span>
            )}
            {status === 'ok' && (
              <span className="inline-flex items-center rounded-full bg-green-100 text-positive px-2 py-0.5">
                conectado
              </span>
            )}
            {status === 'error' && (
              <span className="text-red-600">
                falha — confira o .env.local (veja README.md)
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
