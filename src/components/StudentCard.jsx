import { Pencil, X } from 'lucide-react'
import { Button } from './ui/button'

export default function StudentCard({ student, onClick, onDelete, onEdit }) {
  return (
    <div 
      className="group relative rounded-2xl bg-card p-5 border border-border/40 transition-all hover:bg-muted/5 shadow-sm overflow-hidden cursor-pointer"
      onClick={() => onClick(student)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{student.name}</h3>
          <div className={`h-1.5 w-1.5 rounded-full ${student.status === 'active' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100"
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
