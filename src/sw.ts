/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { Queue } from 'workbox-background-sync'

declare let self: ServiceWorkerGlobalScope

// ------------------------------------------------------------------
// Precache do "app shell" (JS/CSS/HTML do build). A lista é injetada
// automaticamente pelo vite-plugin-pwa no momento do build — não mexer.
// ------------------------------------------------------------------
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

function isSupabaseRest(url: URL) {
  return url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/')
}

// ------------------------------------------------------------------
// Leituras (GET) na API do Supabase: tenta a rede primeiro (dados
// atualizados); se não responder rápido ou estiver offline, cai pro
// cache — assim a última lista de compras/atividades carregada continua
// disponível sem internet.
// ------------------------------------------------------------------
registerRoute(
  ({ url, request }) => isSupabaseRest(url) && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'supabase-data',
    networkTimeoutSeconds: 4,
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 })],
  })
)

// ------------------------------------------------------------------
// Escritas (POST/PATCH/DELETE): se a rede falhar, a requisição entra
// numa fila (guardada em IndexedDB pelo próprio Workbox) e é reenviada
// automaticamente quando a conexão voltar — mesmo que o app esteja
// fechado nesse meio-tempo, em navegadores com suporte a Background Sync.
// ------------------------------------------------------------------
const mutationQueue = new Queue('bora-pra-vida-mutations-queue', {
  maxRetentionTime: 24 * 60, // minutos (24h)
})

async function networkOnlyWithQueue({ request }: { request: Request }) {
  try {
    return await fetch(request.clone())
  } catch (error) {
    await mutationQueue.pushRequest({ request })
    throw error
  }
}

for (const method of ['POST', 'PATCH', 'DELETE'] as const) {
  registerRoute(({ url }) => isSupabaseRest(url), networkOnlyWithQueue, method)
}

// ------------------------------------------------------------------
// Fallback de navegação: pedir uma página estando offline serve o
// index.html cacheado — o React Router cuida de renderizar a rota certa.
// ------------------------------------------------------------------
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages', networkTimeoutSeconds: 4 })
)

// ------------------------------------------------------------------
// Permite que a página peça pra tentar reenviar a fila agora mesmo
// (usado em src/lib/offline-sync.ts assim que a conexão volta), sem
// depender só do Background Sync nativo — que o Safari/iOS não suporta.
// ------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SYNC_NOW') {
    event.waitUntil(mutationQueue.replayRequests())
  }
})

self.skipWaiting()
