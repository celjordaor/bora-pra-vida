import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Provider global do diálogo de confirmação. Monte uma vez perto da raiz do
 * app (veja src/main.tsx). Componentes filhos usam o hook `useConfirm()`.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<(value: boolean) => void>()

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  function handleClose(result: boolean) {
    setOptions(null)
    resolveRef.current?.(result)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100]"
          onClick={() => handleClose(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {options.title && (
              <h3 className="text-lg font-semibold text-navy-950 mb-2">
                {options.title}
              </h3>
            )}
            <p className="text-sm text-gray-600 mb-6">{options.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleClose(false)}
                className="text-sm text-gray-500 hover:text-navy-950 px-3 py-2"
              >
                {options.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                autoFocus
                onClick={() => handleClose(true)}
                className={`text-sm text-white rounded-lg px-4 py-2 font-medium transition-colors ${
                  options.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-navy-600 hover:bg-navy-950'
                }`}
              >
                {options.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

/**
 * Substitui window.confirm(). Uso:
 *
 *   const confirm = useConfirm()
 *   const ok = await confirm({ message: 'Excluir isso?', variant: 'danger' })
 *   if (!ok) return
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm precisa ser usado dentro de <ConfirmProvider>')
  }
  return ctx
}
