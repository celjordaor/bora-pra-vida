import { Link } from '@tanstack/react-router'

export function Sidebar() {
  return (
    <aside className="w-64 bg-navy-950 text-white p-6 hidden md:flex md:flex-col gap-1">
      <h1 className="text-xl font-semibold mb-6">Bora pra Vida</h1>

      <nav className="flex flex-col gap-1 text-sm">
        <Link
          to="/app"
          activeProps={{ className: 'bg-navy-800' }}
          className="rounded-lg px-3 py-2 hover:bg-navy-800 transition-colors"
        >
          Hoje
        </Link>
        <Link
          to="/compras"
          activeProps={{ className: 'bg-navy-800' }}
          className="rounded-lg px-3 py-2 hover:bg-navy-800 transition-colors"
        >
          Compras
        </Link>
        <Link
          to="/notas"
          activeProps={{ className: 'bg-navy-800' }}
          className="rounded-lg px-3 py-2 hover:bg-navy-800 transition-colors"
        >
          Notas
        </Link>
        <Link
          to="/configuracoes"
          activeProps={{ className: 'bg-navy-800' }}
          className="rounded-lg px-3 py-2 hover:bg-navy-800 transition-colors"
        >
          Configurações
        </Link>
      </nav>
    </aside>
  )
}
