import { Toaster } from 'sonner'

/**
 * Monte uma vez perto da raiz do app (veja src/main.tsx).
 * Use src/lib/toast.ts para disparar as notificações.
 */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily:
            'Inter, ui-sans-serif, system-ui, sans-serif',
          borderRadius: '0.75rem',
        },
      }}
    />
  )
}
