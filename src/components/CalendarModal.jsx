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
    const daysList = []
    const totalDays = daysInMonth(year, month)
    const offset = firstDayOfMonth(year, month)

    for (let i = 0; i < offset; i++) daysList.push(null)
    for (let d = 1; d <= totalDays; d++) daysList.push(d)

    const rows = []
    for (let i = 0; i < daysList.length; i += 7) {
      rows.push(daysList.slice(i, i + 7))
    }

    return rows.map((week, weekIdx) =>
      week.map((day, dayIdx) => {
        const dateStr = day ? formatDate(year, month, day) : ''
        const isAttended = day ? attendanceDates.includes(dateStr) : false
        const paymentAmount = day ? paymentMap[dateStr] : 0
        const isCurrentlySelected = false // Could implement day selection later if needed
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(year, month, day)
        checkDate.setHours(0, 0, 0, 0)
        const isFuture = day && checkDate > today
        const isToday = day && checkDate.getTime() === today.getTime()

        return (
          <button
            key={`${weekIdx}-${dayIdx}`}
            onClick={() => day && !isFuture && handleDayClick(day)}
            disabled={!day || isFuture}
            className={`relative h-10 w-10 mx-auto rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
              !day
                ? 'bg-transparent border-transparent'
                : isFuture
                ? 'text-muted-foreground/20 cursor-not-allowed'
                : isAttended && isToday
                ? 'bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#020617] text-white ring-2 ring-primary/50 shadow-[0_0_15px_rgba(129,140,248,0.4)] border border-primary/50 z-10'
                : isAttended
                ? 'bg-gradient-to-br from-[#475569] via-[#334155] to-[#0F172A] text-white shadow-sm border border-slate-600/50'
                : isCurrentlySelected
                ? 'border-2 border-primary bg-primary/10 text-foreground'
                : isToday
                ? 'border-2 border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)] bg-muted/50 text-foreground'
                : 'border border-border/40 text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground'
            }`}
          >
            {day && (
              <span className={isAttended ? 'text-[10px] font-bold leading-none' : 'text-xs font-bold'}>{day}</span>
            )}
            {isAttended && <Check className="h-2 w-2 text-white mt-0.5 opacity-80" />}
            {paymentAmount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white shadow-sm">
                $
              </span>
            )}
          </button>
        )
      })
    )
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
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border bg-card/95 backdrop-blur-xl shadow-2xl max-h-[90vh] flex flex-col">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 z-50 text-white">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        <div className="p-8 pb-4 shrink-0">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tight text-white uppercase">{student.name}</DialogTitle>
          </DialogHeader>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-muted/30 rounded-2xl gap-1">
            <button
              onClick={() => setMode('attendance')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'attendance' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <CalendarIcon className="h-3 w-3" />
              Attendance
            </button>
            <button
              onClick={() => setMode('payments')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'payments' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <DollarSign className="h-3 w-3" />
              Payments
            </button>
            <button
              onClick={() => setMode('stats')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'stats' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
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
                  <div key={i} className="p-4 rounded-2xl bg-muted/10 border border-border flex flex-col gap-2">
                    <div className="text-[8px] font-black text-white/50 uppercase tracking-widest">{item.label}</div>
                    <div className="text-sm font-black text-white">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <History className="h-3 w-3" />
                    Corrections
                  </div>
                  {!isAdjusting && (
                    <button onClick={() => setIsAdjusting(true)} className="text-[9px] font-black uppercase text-primary hover:underline transition-colors flex items-center gap-1">
                      <Plus className="h-2.5 w-2.5" />
                      New
                    </button>
                  )}
                </div>
                {isAdjusting ? (
                  <form onSubmit={handleAddAdjustment} className="space-y-3">
                    <div className="flex gap-2">
                      <input type="number" step="0.01" placeholder="Amount" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} className="flex-1 bg-muted/20 border border-border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primary/50" autoFocus />
                      <button type="submit" disabled={!adjAmount} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase">Apply</button>
                      <button type="button" onClick={() => setIsAdjusting(false)} className="px-4 py-2 bg-muted rounded-xl text-[10px] font-black uppercase text-white">Cancel</button>
                    </div>
                    <input type="text" placeholder="Reason..." value={adjComment} onChange={(e) => setAdjComment(e.target.value)} className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-white/60 focus:outline-none focus:border-primary/50" />
                  </form>
                ) : (
                  <div className="space-y-2">
                    {!(student.adjustments || []).length ? (
                      <div className="text-[10px] text-white/40 font-bold italic py-8 text-center border border-dashed border-border rounded-xl">No adjustments recorded</div>
                    ) : (
                      [...(student.adjustments || [])].reverse().map((adj) => (
                        <div key={adj.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border group hover:border-white/20 transition-all">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-white">{adj.amount >= 0 ? '+' : ''}฿{formatNum(adj.amount)}</span>
                              <span className="text-[8px] font-bold text-white/30">{adj.date}</span>
                            </div>
                            <div className="text-[9px] font-bold text-white/60">{adj.comment}</div>
                          </div>
                          <button onClick={() => removeAdjustment(adj.id)} className="p-1.5 hover:bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
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
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-muted rounded-xl transition-all">
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
                <div className="text-xs font-black uppercase tracking-widest text-white">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-muted rounded-xl transition-all">
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-[8px] font-black text-center text-white/40 uppercase tracking-widest">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <span>Legend</span>
                  <span>{mode === 'attendance' ? 'Attendance Tracking' : 'Income Tracking'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                    <span className="text-[9px] font-black text-white uppercase">Lesson</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-black text-white uppercase">Payment</span>
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
