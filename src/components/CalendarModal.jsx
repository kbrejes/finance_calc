import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'

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
    setMarkedDates(newMarked)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleSave = () => {
    onUpdateAttendance(Array.from(markedDates))
    onOpenChange(false)
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

  const attendanceCount = markedDates.size
  const avgLessonPrice = 700 // Default, will be passed from parent

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Attendance — {studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">{monthName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground">
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
                    className={`h-8 rounded text-xs font-medium transition-colors ${
                      !day
                        ? 'text-transparent'
                        : isFuture
                        ? 'text-muted-foreground/30 cursor-not-allowed'
                        : isMarked
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border text-foreground hover:bg-input'
                    }`}
                  >
                    {day}
                  </button>
                )
              })
            )}
          </div>

          {/* Stats */}
          <div className="rounded-lg bg-input p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lessons this month:</span>
              <span className="font-semibold">{attendanceCount}</span>
            </div>
            <div className="flex justify-between text-primary">
              <span className="text-muted-foreground">Est. income:</span>
              <span className="font-mono">฿{(attendanceCount * avgLessonPrice).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" variant="default" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
