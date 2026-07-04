interface Props {
  name: string
  color: string
  icon?: string | null
}

export function CategoryPill({ name, color, icon }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 shrink-0"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {icon && <span>{icon}</span>}
      {name}
    </span>
  )
}
