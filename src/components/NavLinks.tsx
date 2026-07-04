import { Link } from '@tanstack/react-router'

interface Props {
  onNavigate?: () => void
}

const LINKS = [
  { to: '/app', label: 'Hoje' },
  { to: '/compras', label: 'Compras' },
  { to: '/notas', label: 'Notas' },
  { to: '/configuracoes', label: 'Configurações' },
] as const

export function NavLinks({ onNavigate }: Props) {
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          activeProps={{ className: 'bg-navy-800' }}
          className="rounded-lg px-3 py-2 hover:bg-navy-800 transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
