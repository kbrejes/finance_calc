import { X, TrendingUp, Wallet, BookOpen, Clock, Activity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { getCalculatedStudentMetrics, formatNum } from '../lib/financeUtils'

export default function StudentStatsModal({ open, onOpenChange, student }) {
  if (!student) return null
  const metrics = getCalculatedStudentMetrics(student)

  const statItems = [
    { label: 'Current Balance', value: `฿${formatNum(metrics.balance)}`, sub: 'Prepaid Wallet', icon: Wallet, color: metrics.balance >= 0 ? 'text-emerald-500' : 'text-rose-500' },
    { label: 'Total Paid', value: `฿${formatNum(metrics.totalPaid)}`, sub: 'Lifetime Earnings', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Lessons Delivered', value: `฿${formatNum(metrics.totalCost)}`, sub: `${(student.attendanceDates || []).length} Sessions`, icon: BookOpen, color: 'text-rose-500' },
    { label: 'Monthly Projection', value: `฿${formatNum(metrics.monthlyProjection)}`, sub: 'Current Momentum', icon: Activity, color: 'text-primary' },
    { label: 'Average Frequency', value: metrics.hasData ? `${metrics.avgDays.toFixed(1)} Days` : '—', sub: 'Between Lessons', icon: Clock, color: 'text-muted-foreground' },
    { label: 'Daily Yield', value: metrics.hasData ? `฿${formatNum(metrics.dailyIncome)}` : '—', sub: 'Per Calendar Day', icon: TrendingUp, color: 'text-muted-foreground' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 z-50">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        <div className="p-8 pb-4">
          <DialogHeader className="mb-8">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground/90 uppercase">{student.name}</DialogTitle>
              <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Financial Intelligence Report</div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {statItems.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/5 border border-border/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-muted/20">
                    <item.icon className={`h-3 w-3 ${item.color}`} />
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-0.5">{item.label}</div>
                  <div className={`text-sm font-black ${item.color}`}>{item.value}</div>
                  <div className="text-[8px] font-bold text-muted-foreground/30 uppercase mt-1">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 pt-4">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
            <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Status Report</div>
            <p className="text-[10px] leading-relaxed text-muted-foreground/70 font-medium italic">
              {metrics.balance >= 0 
                ? `Student has a healthy surplus. They are prepaid for approximately ${Math.floor(metrics.balance / student.price)} upcoming lessons.`
                : `Student has an outstanding balance of ฿${formatNum(Math.abs(metrics.balance))}. They currently owe for ${Math.ceil(Math.abs(metrics.balance) / student.price)} delivered sessions.`
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
