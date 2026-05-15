import { Pencil, X } from 'lucide-react'
import { Button } from './ui/button'
import { getCalculatedStudentMetrics, formatNum } from '../lib/financeUtils'

const STATUS_CONFIG = {
  active: { label: 'Act', dot: 'bg-success' },
  paused: { label: 'Psd', dot: 'bg-muted-foreground' },
  finished: { label: 'Fin', dot: 'bg-danger' },
}

export default function StudentCard({ student, onCalendar, onDelete, onEdit }) {
  const metrics = getCalculatedStudentMetrics(student)
  const status = STATUS_CONFIG[student.status || 'active']

  return (
    <div 
      className="group relative rounded-xl bg-card p-4 transition-all hover:bg-muted/5 cursor-pointer shadow-sm overflow-hidden"
      onClick={onCalendar}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground tracking-tight">{student.name}</h3>
            <div className={`px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${metrics.balance >= 0 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
              {metrics.balance >= 0 ? '+' : ''}฿{formatNum(metrics.balance)}
            </div>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-muted/20 border border-border/50">
              <div className={`h-1 w-1 rounded-full ${status.dot} ${student.status === 'active' ? 'animate-pulse' : ''}`} />
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{status.label}</span>
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

      {/* Key Metrics: Daily, LTV, Rate */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/5 p-1">
        <div className="p-2.5">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5">Rate</div>
          <div className="text-xs font-bold text-foreground/80">฿{formatNum(student.price)}</div>
        </div>
        <div className="p-2.5 border-x border-border/10">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5">Daily</div>
          <div className="text-xs font-bold text-foreground/80">
            {metrics.hasData ? `฿${formatNum(metrics.dailyIncome)}` : '—'}
          </div>
        </div>
        <div className="p-2.5">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-0.5">LTV</div>
          <div className="text-xs font-black text-primary/80">
            ฿{formatNum(metrics.ltv)}
          </div>
        </div>
      </div>

      {/* Hover Info Popover */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-card/95 backdrop-blur-md border-t border-border/40 p-3 shadow-2xl z-10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[7px] uppercase tracking-widest text-muted-foreground/50 font-bold">Total Paid</div>
            <div className="text-[10px] font-black text-emerald-500">฿{formatNum(metrics.totalPaid)}</div>
          </div>
          <div>
            <div className="text-[7px] uppercase tracking-widest text-muted-foreground/50 font-bold">Lessons Cost</div>
            <div className="text-[10px] font-black text-rose-500">฿{formatNum(metrics.totalCost)}</div>
          </div>
          <div>
            <div className="text-[7px] uppercase tracking-widest text-muted-foreground/50 font-bold">Attendance</div>
            <div className="text-[10px] font-bold text-foreground/70">{(student.attendanceDates || []).length} lessons</div>
          </div>
          <div>
            <div className="text-[7px] uppercase tracking-widest text-muted-foreground/50 font-bold">Status</div>
            <div className="text-[10px] font-bold text-foreground/70 capitalize">{student.status || 'active'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
