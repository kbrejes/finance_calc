import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Wallet, CheckCircle2, CircleDot } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { formatNum } from '../lib/financeUtils'

export default function CalendarModal({ 
  open, 
  onOpenChange, 
  studentName, 
  attendanceDates = [], 
  payments = [],
  avgLessonPrice = 0,
  onUpdateAttendance,
  onUpdatePayments 
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('attendance') // 'attendance' or 'payments'
  const [markedDates, setMarkedDates] = useState(new Set())
  const [paymentMap, setPaymentMap] = useState({})

  useEffect(() => {
    setMarkedDates(new Set(attendanceDates))
  }, [attendanceDates])

  useEffect(() => {
    const map = {}
    payments.forEach(p => { map[p.date] = p.amount })
    setPaymentMap(map)
  }, [payments])

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const formatDate = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const toggleAttendance = (day) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    const newMarked = new Set(markedDates)
    if (newMarked.has(dateStr)) {
      newMarked.delete(dateStr)
    } else {
      newMarked.add(dateStr)
    }
    onUpdateAttendance(Array.from(newMarked))
  }

  const handlePaymentClick = (day) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    const currentAmount = paymentMap[dateStr] || 0
    const val = prompt(`Enter payment amount for ${dateStr}:`, currentAmount)
    
    if (val !== null) {
      const amount = parseFloat(val) || 0
      const newPayments = payments.filter(p => p.date !== dateStr)
      if (amount > 0) {
        newPayments.push({ date: dateStr, amount })
      }
      onUpdatePayments(newPayments)
    }
  }

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const rows = []
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))

  // Calculation for Ledger Footer
  const totalCost = (attendanceDates || []).length * avgLessonPrice
  const totalPaid = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
  const balance = totalPaid - totalCost

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>

        <div className="p-6 pb-0">
          <DialogHeader className="mb-4">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl font-black tracking-tight text-foreground/90 uppercase">{studentName}</DialogTitle>
              <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Student Ledger & Tracking</div>
            </div>
          </DialogHeader>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-muted/20 rounded-xl border border-border/40 mb-6">
            <button 
              onClick={() => setViewMode('attendance')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'attendance' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Attendance
            </button>
            <button 
              onClick={() => setViewMode('payments')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'payments' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
            >
              <Wallet className="h-3 w-3" />
              Payments
            </button>
          </div>

          <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between px-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-muted rounded-xl transition-all">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-xs font-black text-foreground/80 uppercase tracking-widest">{monthName}</span>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-muted rounded-xl transition-all">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-[9px] font-black text-muted-foreground/20">
                  {day}
                </div>
              ))}
              {rows.map((week, weekIdx) =>
                week.map((day, dayIdx) => {
                  if (!day) return <div key={`${weekIdx}-${dayIdx}`} className="h-10 w-10" />
                  
                  const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                  const isMarked = markedDates.has(dateStr)
                  const paymentAmount = paymentMap[dateStr]
                  
                  const today = new Date()
                  today.setHours(0,0,0,0)
                  const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  const isFuture = checkDate > today
                  const isToday = checkDate.getTime() === today.getTime()
                  
                  return (
                    <button
                      key={`${weekIdx}-${dayIdx}`}
                      onClick={() => !isFuture && (viewMode === 'attendance' ? toggleAttendance(day) : handlePaymentClick(day))}
                      disabled={isFuture}
                      className={`h-10 w-10 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                        isFuture ? 'text-muted-foreground/10 cursor-not-allowed' :
                        viewMode === 'attendance' ? (
                          isMarked ? 'bg-primary text-primary-foreground shadow-lg scale-105' :
                          isToday ? 'border-2 border-primary/40 bg-primary/5' : 'border border-border/20 text-muted-foreground/60 hover:border-border/60'
                        ) : (
                          paymentAmount ? 'bg-emerald-500 text-white shadow-lg scale-105 shadow-emerald-500/20' :
                          isToday ? 'border-2 border-emerald-500/40 bg-emerald-500/5' : 'border border-border/20 text-muted-foreground/60 hover:border-emerald-500/40'
                        )
                      }`}
                    >
                      <span>{day}</span>
                      {paymentAmount && viewMode === 'attendance' && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 border border-card" />
                      )}
                      {viewMode === 'payments' && paymentAmount > 0 && (
                        <div className="text-[7px] font-black absolute bottom-1 truncate max-w-full px-1">
                          ฿{formatNum(paymentAmount)}
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
