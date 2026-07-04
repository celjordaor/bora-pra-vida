/**
 * Registra os listeners de reconexão: quando a internet volta, pede pro
 * service worker tentar reenviar a fila de escritas pendentes, e depois
 * avisa o resto do app (via evento customizado) pra recarregar os dados.
 */
export function registerOfflineSync() {
  function handleOnline() {
    navigator.serviceWorker?.controller?.postMessage({ type: 'SYNC_NOW' })

    // Dá um tempinho pro service worker reenviar as requisições pendentes
    // antes de pedir pros hooks recarregarem os dados do servidor.
    setTimeout(() => {
      window.dispatchEvent(new Event('bora-pra-vida:sync'))
    }, 2000)
  }

  window.addEventListener('online', handleOnline)

  // Se já estiver online ao carregar (ex.: tinha itens pendentes de uma
  // sessão offline anterior), tenta sincronizar uma vez de cara.
  if (navigator.onLine) handleOnline()
}

/**
 * Verdadeiro quando o erro veio de estar sem internet (em vez de um erro
 * "de verdade", tipo permissão negada ou dado inválido). Usado pra decidir
 * se mostramos "vai sincronizar sozinho" em vez de desfazer a ação na tela.
 */
export function isOfflineError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  return err instanceof TypeError && /fetch|network/i.test(err.message)
}
