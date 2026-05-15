import { Pencil, X, BarChart3, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { getCalculatedStudentMetrics, formatNum } from '../lib/financeUtils'

const STATUS_CONFIG = {
  active: { label: 'Act', dot: 'bg-success' },
  paused: { label: 'Psd', dot: 'bg-muted-foreground' },
  finished: { label: 'Fin', dot: 'bg-danger' },
}

export default function StudentCard({ student, onCalendar, onDelete, onEdit, onStats }) {
  const metrics = getCalculatedStudentMetrics(student)
  const status = STATUS_CONFIG[student.status || 'active']

  return (
    <div 
      className="group relative rounded-2xl bg-card p-5 border border-border/40 transition-all hover:bg-muted/5 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{student.name}</h3>
              <div className={`h-1.5 w-1.5 rounded-full ${status.dot} ${student.status === 'active' ? 'animate-pulse' : ''}`} />
            </div>
            <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">฿{formatNum(student.price)} / Lesson</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
            onClick={(e) => {
              e.stopPropagation()
              onStats(student)
            }}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:bg-slate-500/10 hover:text-slate-500 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              onCalendar(student)
            }}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <div className="w-[1px] h-4 bg-border/40 mx-1" />
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
