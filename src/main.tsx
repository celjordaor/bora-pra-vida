import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from '@/lib/auth-context'
import { ConfirmProvider } from '@/components/ui/ConfirmDialogProvider'
import { AppToaster } from '@/components/ui/AppToaster'
import './index.css'

// O arquivo routeTree.gen.ts é gerado automaticamente pelo plugin do
// TanStack Router na primeira vez que você rodar `npm run dev` ou
// `npm run build`. Não precisa criá-lo manualmente.
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <AuthProvider>
        <ConfirmProvider>
          <RouterProvider router={router} />
          <AppToaster />
        </ConfirmProvider>
      </AuthProvider>
    </StrictMode>
  )
}
