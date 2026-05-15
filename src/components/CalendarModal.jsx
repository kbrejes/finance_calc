import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import * as DialogPrimitive from "@radix-ui/react-dialog"

export default function CalendarModal({ open, onOpenChange, studentName, attendanceDates, onUpdateAttendance }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [markedDates, setMarkedDates] = useState(new Set())

  useEffect(() => {
    if (attendanceDates) {
      setMarkedDates(new Set(attendanceDates))
    }
  }, [attendanceDates])

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const toggleDate = (day) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    const newMarked = new Set(markedDates)
    if (newMarked.has(dateStr)) {
      newMarked.delete(dateStr)
    } else {
      newMarked.add(dateStr)
    }
    const updatedDates = Array.from(newMarked)
    setMarkedDates(newMarked)
    onUpdateAttendance(updatedDates) // Auto-save
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const rows = []
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-6 border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90">{studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <span className="text-sm font-bold text-foreground/80 tracking-wide">{monthName}</span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-[10px] font-black text-muted-foreground/30">
                {day}
              </div>
            ))}
            {rows.map((week, weekIdx) =>
              week.map((day, dayIdx) => {
                const dateStr = day ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), day) : ''
                const isMarked = day && markedDates.has(dateStr)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                checkDate.setHours(0, 0, 0, 0)
                const isFuture = day && checkDate > today
                
                return (
                  <button
                    key={`${weekIdx}-${dayIdx}`}
                    onClick={() => day && !isFuture && toggleDate(day)}
                    disabled={!day || isFuture}
                    className={`h-9 w-9 rounded-lg text-xs font-bold transition-all duration-200 ${
                      !day
                        ? 'bg-transparent border-transparent'
                        : isFuture
                        ? 'text-muted-foreground/20 cursor-not-allowed'
                        : isMarked
                        ? 'bg-gradient-to-br from-[#475569] via-[#334155] to-[#0F172A] text-white shadow-[0_0_15px_rgba(51,65,85,0.4)] border border-slate-600/50'
                        : 'border border-border/40 text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground'
                    }`}
                  >
                    {day}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
