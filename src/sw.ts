/// <reference lib="webworker" />
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
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
    plugins: [
      // Sem isso, o Workbox cacheia QUALQUER resposta, incluindo erros
      // (401, 500...) — e depois passaria a servir esse erro como se fosse
      // um dado válido sempre que a rede demorasse mais que o timeout.
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 }),
    ],
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
// Navegação (abrir/trocar de rota, ex.: /compras, /notas): como este é um
// SPA, todas as rotas são a mesma index.html — o React Router decide o
// que mostrar no cliente. Tenta a rede primeiro (pra pegar deploys novos);
// se falhar (offline, ou uma rota que nunca foi visitada antes), cai
// SEMPRE pro index.html pré-cacheado, nunca deixando a navegação falhar.
// ------------------------------------------------------------------
const navigationFallback = createHandlerBoundToURL('/index.html')
const navigationWithNetworkFirst = new NetworkFirst({
  cacheName: 'pages',
  networkTimeoutSeconds: 4,
})

registerRoute(
  new NavigationRoute(async (params) => {
    try {
      return await navigationWithNetworkFirst.handle(params)
    } catch {
      return navigationFallback(params)
    }
  })
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
