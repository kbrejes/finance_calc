import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'

export default function StudentCard({ student, onCalendar, onDelete }) {
  const attendanceCount = student.attendanceDates?.length || 0
  const totalIncome = attendanceCount * student.price

  return (
    <div 
      onClick={() => onCalendar()}
      className="rounded-lg border border-border bg-input p-4 space-y-4 cursor-pointer transition-colors hover:bg-input/80"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-foreground">{student.name}</h4>
          <p className="text-xs text-muted-foreground">Lesson: ฿{student.price}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(student.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded bg-background px-3 py-2">
          <div className="text-muted-foreground text-xs">Lessons</div>
          <div className="font-semibold text-muted-foreground">{attendanceCount}</div>
        </div>
        <div className="rounded bg-background px-3 py-2">
          <div className="text-muted-foreground text-xs">Est. Income</div>
          <div className="font-mono font-semibold text-muted-foreground">฿{totalIncome.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
