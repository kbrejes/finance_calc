import { Pencil, X } from 'lucide-react'
import { Button } from './ui/button'
import { getCalculatedStudentMetrics, formatNum } from '../lib/financeUtils'

export default function StudentCard({ student, onCalendar, onDelete, onEdit }) {
  const metrics = getCalculatedStudentMetrics(student)

  return (
    <div 
      className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 cursor-pointer shadow-sm overflow-hidden"
      onClick={onCalendar}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground tracking-tight">{student.name}</h3>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-muted/20 border border-border/50">
              <div className="h-1 w-1 rounded-full bg-primary/60 animate-pulse" />
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Act</span>
            </div>
          </div>
          <div className="text-sm font-black text-muted-foreground/80 tracking-tighter">
            ฿{formatNum(metrics.hasData ? metrics.monthlyProjection : 0)}<span className="text-[10px] font-bold text-muted-foreground/40 ml-0.5">/MO</span>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 -mt-1 -mr-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(student)
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-danger transition-all opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(student.id)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Split Widget Stats */}
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border/50 bg-muted/5">
        <div className="p-2.5 border-r border-b border-border/30 hover:bg-muted/10 transition-colors">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5">Rate</div>
          <div className="text-xs font-bold text-foreground/80">฿{formatNum(student.price)}</div>
        </div>
        <div className="p-2.5 border-b border-border/30 hover:bg-muted/10 transition-colors">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5">Freq</div>
          <div className="text-xs font-bold text-foreground/80">
            {metrics.hasData ? `${Math.round(metrics.avgDays)}d` : '—'}
          </div>
        </div>
        <div className="p-2.5 border-r border-border/30 hover:bg-muted/10 transition-colors">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5">Attend</div>
          <div className="text-xs font-bold text-foreground/80">
            {metrics.hasData ? `${metrics.lessonsPerMonth.toFixed(1)}` : '—'}
          </div>
        </div>
        <div className="p-2.5 hover:bg-muted/10 transition-colors">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5">Daily</div>
          <div className="text-xs font-bold text-foreground/80">
            {metrics.hasData ? `฿${formatNum(metrics.dailyIncome)}` : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
