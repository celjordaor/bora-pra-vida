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
        {note.converted_to_activity_id ? (
          <span className="text-xs text-navy-600">✓ Convertida</span>
        ) : (
          <button
            onClick={onConvert}
            className="text-xs text-navy-600 hover:text-navy-950 underline"
          >
            Converter em tarefa
          </button>
        )}
        <button onClick={onDelete} className="text-xs text-gray-500 hover:text-red-600">
          Excluir
        </button>
      </div>
    </div>
  )
}
