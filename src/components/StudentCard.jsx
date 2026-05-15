import { Pencil, X } from 'lucide-react'
import { Button } from './ui/button'

export default function StudentCard({ student, onClick, onDelete, onEdit }) {
  return (
    <div 
      className="group relative rounded-2xl bg-card p-5 border border-border transition-all hover:bg-muted/20 hover:border-white/20 shadow-lg overflow-hidden cursor-pointer active:scale-[0.98]"
      onClick={() => onClick(student)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-black text-white uppercase tracking-tight">{student.name}</h3>
          <div className={`h-2 w-2 rounded-full ${student.status === 'active' ? 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-white/20'}`} />
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl text-white/40 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(student)
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl text-white/40 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(student.id)
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
