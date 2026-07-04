import { NavLinks } from './NavLinks'

export function Sidebar() {
  return (
    <aside className="w-64 bg-navy-950 text-white p-6 hidden md:flex md:flex-col gap-1">
      <h1 className="text-xl font-semibold mb-6">Bora pra Vida</h1>
      <NavLinks />
    </aside>
  )
}

