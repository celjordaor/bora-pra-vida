import { useState } from 'react'
import { NavLinks } from './NavLinks'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <header className="bg-navy-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-lg font-semibold">Bora pra Vida</h1>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="p-1 -mr-1 text-2xl leading-none"
        >
          ☰
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-navy-950 text-white p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
