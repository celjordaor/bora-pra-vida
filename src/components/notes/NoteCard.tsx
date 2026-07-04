import type { QuickNote } from '@/types/note'

interface Props {
  note: QuickNote
  onConvert: () => void
  onDelete: () => void
}

export function NoteCard({ note, onConvert, onDelete }: Props) {
  return (
    <div className="bg-sticky rounded-lg p-4 shadow-sm flex flex-col gap-3 min-h-[140px]">
      <p className="text-sm text-gray-800 whitespace-pre-wrap flex-1">{note.content}</p>
      <div className="flex items-center justify-between">
        <button
          onClick={onConvert}
          title="Converter em tarefa"
          className="text-navy-700 hover:text-navy-950 transition-colors"
        >
          ✅ <span className="text-xs align-middle">Converter</span>
        </button>
        <button
          onClick={onDelete}
          title="Excluir nota"
          className="text-gray-500 hover:text-red-600 transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
