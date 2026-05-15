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
    { label: 'Balance', value: `฿${formatNum(metrics.balance)}`, icon: Wallet },
    { label: 'Total Paid', value: `฿${formatNum(metrics.totalPaid)}`, icon: TrendingUp },
    { label: 'Delivered', value: `฿${formatNum(metrics.totalCost)}`, icon: BookOpen },
    { label: 'Projection', value: `฿${formatNum(metrics.monthlyProjection)}`, icon: Activity },
    { label: 'Frequency', value: metrics.hasData ? `${metrics.avgDays.toFixed(1)} Days` : '—', icon: Clock },
    { label: 'Daily Yield', value: metrics.hasData ? `฿${formatNum(metrics.dailyIncome)}` : '—', icon: TrendingUp },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 z-50">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground/90 uppercase">{student.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {statItems.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/5 border border-border/20 flex flex-col gap-3">
                <div className="p-1.5 rounded-lg bg-muted/20 w-fit">
                  <item.icon className="h-3 w-3 text-muted-foreground/40" />
                </div>
                <div>
                  <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-sm font-black text-muted-foreground">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
