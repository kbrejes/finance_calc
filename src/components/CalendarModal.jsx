import { useState, useEffect } from 'react'
import { 
  X, ChevronLeft, ChevronRight, Check, DollarSign, 
  BarChart3, Calendar as CalendarIcon, Wallet, 
  TrendingUp, BookOpen, Clock, Activity, Plus, History, Trash2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { getCalculatedStudentMetrics, formatNum } from '../lib/financeUtils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CalendarModal({ 
  open, 
  onOpenChange, 
  student,
  onUpdateAttendance, 
  onUpdatePayments,
  onUpdateAdjustments 
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mode, setMode] = useState('attendance') // 'attendance' | 'payments' | 'stats'
  const [paymentMap, setPaymentMap] = useState({})
  
  // Stats specific state
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [adjAmount, setAdjAmount] = useState('')
  const [adjComment, setAdjComment] = useState('')

  if (!student) return null

  const attendanceDates = student.attendanceDates || []
  const payments = student.payments || []
  const metrics = getCalculatedStudentMetrics(student)

  useEffect(() => {
    const map = {}
    payments.forEach(p => { map[p.date] = p.amount })
    setPaymentMap(map)
  }, [payments])

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const formatDate = (y, m, d) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const handleDayClick = (day) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    if (mode === 'attendance') {
      const newDates = attendanceDates.includes(dateStr)
        ? attendanceDates.filter(d => d !== dateStr)
        : [...attendanceDates, dateStr]
      onUpdateAttendance(newDates)
    } else if (mode === 'payments') {
      const currentAmount = paymentMap[dateStr] || 0
      const val = prompt(`Enter payment for ${dateStr}:`, currentAmount)
      if (val !== null) {
        const amount = parseFloat(val.replace(/[^\d.-]/g, '')) || 0
        const newPayments = payments.filter(p => p.date !== dateStr)
        if (amount > 0) newPayments.push({ date: dateStr, amount })
        onUpdatePayments(newPayments)
      }
    }
  }

  const handleAddAdjustment = (e) => {
    e.preventDefault()
    const amount = parseFloat(adjAmount)
    if (isNaN(amount)) return
    const newAdjustment = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount,
      comment: adjComment || 'Manual adjustment'
    }
    onUpdateAdjustments([...(student.adjustments || []), newAdjustment])
    setAdjAmount('')
    setAdjComment('')
    setIsAdjusting(false)
  }

  const removeAdjustment = (id) => {
    onUpdateAdjustments((student.adjustments || []).filter(a => a.id !== id))
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = []
    const totalDays = daysInMonth(year, month)
    const offset = firstDayOfMonth(year, month)

    for (let i = 0; i < offset; i++) days.push(<div key={`empty-${i}`} />)

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = formatDate(year, month, d)
      const isAttended = attendanceDates.includes(dateStr)
      const paymentAmount = paymentMap[dateStr]

      days.push(
        <button
          key={d}
          onClick={() => handleDayClick(d)}
          className={`
            aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all border
            ${isAttended ? 'bg-primary/5 border-primary/20' : 'bg-muted/5 border-transparent hover:border-border/40'}
          `}
        >
          <span className={`text-[10px] font-bold ${isAttended ? 'text-primary' : 'text-muted-foreground/40'}`}>{d}</span>
          {isAttended && <Check className="h-2 w-2 text-primary mt-0.5" />}
          {paymentAmount > 0 && (
            <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 scale-[0.7] origin-top-right">
              <DollarSign className="h-2 w-2 text-emerald-500" />
              <span className="text-[8px] font-black text-emerald-500">฿{formatNum(paymentAmount)}</span>
            </div>
          )}
        </button>
      )
    }
    return days
  }

  const statItems = [
    { label: 'Balance', value: `฿${formatNum(metrics.balance)}`, icon: Wallet },
    { label: 'Total Paid', value: `฿${formatNum(metrics.totalPaid)}`, icon: TrendingUp },
    { label: 'Delivered', value: `฿${formatNum(metrics.totalCost)}`, icon: BookOpen },
    { label: 'Adjustments', value: `฿${formatNum(metrics.totalAdjustments)}`, icon: History },
    { label: 'Projection', value: `฿${formatNum(metrics.monthlyProjection)}`, icon: Activity },
    { label: 'Frequency', value: metrics.hasData ? `${metrics.avgDays.toFixed(1)} Days` : '—', icon: Clock },
    { label: 'Daily Yield', value: metrics.hasData ? `฿${formatNum(metrics.dailyIncome)}` : '—', icon: TrendingUp },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl max-h-[90vh] flex flex-col">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 z-50">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        <div className="p-8 pb-4 shrink-0">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground/90 uppercase">{student.name}</DialogTitle>
          </DialogHeader>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-muted/20 rounded-2xl gap-1">
            <button
              onClick={() => setMode('attendance')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'attendance' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
            >
              <CalendarIcon className="h-3 w-3" />
              Attendance
            </button>
            <button
              onClick={() => setMode('payments')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'payments' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
            >
              <DollarSign className="h-3 w-3" />
              Payments
            </button>
            <button
              onClick={() => setMode('stats')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'stats' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
            >
              <BarChart3 className="h-3 w-3" />
              Stats
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {mode === 'stats' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-3">
                {statItems.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/5 border border-border/20 flex flex-col gap-2">
                    <div className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">{item.label}</div>
                    <div className="text-sm font-black text-muted-foreground">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Adjustments Section (reused from StatsModal) */}
              <div className="space-y-4 pt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                    <History className="h-3 w-3" />
                    Corrections
                  </div>
                  {!isAdjusting && (
                    <button onClick={() => setIsAdjusting(true)} className="text-[9px] font-black uppercase text-primary/60 hover:text-primary transition-colors flex items-center gap-1">
                      <Plus className="h-2.5 w-2.5" />
                      New
                    </button>
                  )}
                </div>
                {isAdjusting ? (
                  <form onSubmit={handleAddAdjustment} className="space-y-3">
                    <div className="flex gap-2">
                      <input type="number" step="0.01" placeholder="Amount" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} className="flex-1 bg-muted/10 border border-border/20 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none" autoFocus />
                      <button type="submit" disabled={!adjAmount} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase">Apply</button>
                      <button type="button" onClick={() => setIsAdjusting(false)} className="px-4 py-2 bg-muted/20 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                    </div>
                    <input type="text" placeholder="Reason..." value={adjComment} onChange={(e) => setAdjComment(e.target.value)} className="w-full bg-muted/10 border border-border/20 rounded-xl px-3 py-2 text-[10px] font-bold text-muted-foreground focus:outline-none" />
                  </form>
                ) : (
                  <div className="space-y-2">
                    {!(student.adjustments || []).length ? (
                      <div className="text-[10px] text-muted-foreground/30 font-bold italic py-6 text-center border border-dashed border-border/20 rounded-xl">No adjustments</div>
                    ) : (
                      [...(student.adjustments || [])].reverse().map((adj) => (
                        <div key={adj.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/10 group">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-muted-foreground">{adj.amount >= 0 ? '+' : ''}฿{formatNum(adj.amount)}</span>
                              <span className="text-[8px] font-bold text-muted-foreground/20">{adj.date}</span>
                            </div>
                            <div className="text-[9px] font-bold text-muted-foreground/40">{adj.comment}</div>
                          </div>
                          <button onClick={() => removeAdjustment(adj.id)} className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-muted/20 rounded-xl transition-all">
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="text-xs font-black uppercase tracking-widest text-foreground/80">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-muted/20 rounded-xl transition-all">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-[8px] font-black text-center text-muted-foreground/30 uppercase tracking-widest">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-border/20">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                  <span>Legend</span>
                  <span>{mode === 'attendance' ? 'Attendance Tracking' : 'Income Tracking'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[9px] font-black text-foreground/60 uppercase">Lesson</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black text-foreground/60 uppercase">Payment</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
