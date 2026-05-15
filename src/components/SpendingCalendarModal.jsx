import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

export default function SpendingCalendarModal({
  open,
  onOpenChange,
  itemName,
  category,
  isEssential,
  purchaseDates,
  pricePerUnit,
  units,
  onUpdatePurchaseDates,
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [markedDates, setMarkedDates] = useState(new Map())
  
  // Cost Dialog State
  const [costDialogOpen, setCostDialogOpen] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState(null)
  const [costInput, setCostInput] = useState('')

  useEffect(() => {
    if (purchaseDates) {
      const dateMap = new Map()
      purchaseDates.forEach(entry => {
        if (typeof entry === 'string') {
          dateMap.set(entry, pricePerUnit * units)
        } else if (entry.date) {
          dateMap.set(entry.date, entry.cost || pricePerUnit * units)
        }
      })
      setMarkedDates(dateMap)
    }
  }, [purchaseDates, open, pricePerUnit, units])

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handleDayClick = (day) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    const existingCost = markedDates.get(dateStr)
    
    setSelectedDateStr(dateStr)
    setCostInput(String(existingCost !== undefined ? existingCost : pricePerUnit * units))
    setCostDialogOpen(true)
  }

  const handleSaveCost = () => {
    const newMarked = new Map(markedDates)
    newMarked.set(selectedDateStr, parseFloat(costInput) || 0)
    setMarkedDates(newMarked)
    setCostDialogOpen(false)
  }

  const handleDeletePurchase = () => {
    const newMarked = new Map(markedDates)
    newMarked.delete(selectedDateStr)
    setMarkedDates(newMarked)
    setCostDialogOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleFinalSave = () => {
    const purchaseDatesArray = Array.from(markedDates.entries()).map(([date, cost]) => ({
      date,
      cost,
    }))
    onUpdatePurchaseDates(purchaseDatesArray)
    onOpenChange(false)
  }

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const purchaseCount = markedDates.size
  const totalCost = Array.from(markedDates.values()).reduce((sum, cost) => sum + cost, 0)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>{itemName}</DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {category}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${isEssential ? 'border border-border text-muted-foreground' : 'bg-warning text-white'}`}>
                  {isEssential ? 'Essential' : 'Optional'}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold text-sm">{monthName}</div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-muted-foreground uppercase pb-1">
                  {day}
                </div>
              ))}

              {days.map((day, idx) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const checkDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null
                if (checkDate) checkDate.setHours(0, 0, 0, 0)
                
                const isFuture = checkDate && checkDate > today
                const dateStr = day ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), day) : ''
                const isMarked = day && markedDates.has(dateStr)
                
                return (
                  <button
                    key={idx}
                    onClick={() => day && !isFuture && handleDayClick(day)}
                    disabled={!day || isFuture}
                    className={`
                      aspect-square text-sm font-medium rounded-md transition-all
                      flex items-center justify-center
                      ${!day ? 'invisible' : ''}
                      ${isFuture ? 'opacity-20 cursor-not-allowed' : ''}
                      ${isMarked && !isFuture ? 'bg-[#334155] text-white shadow-[0_0_15px_rgba(51,65,85,0.4)] border border-slate-600/30' : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Focused Cost Entry Dialog (The Pop-up) */}
      <Dialog open={costDialogOpen} onOpenChange={setCostDialogOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>{markedDates.has(selectedDateStr) ? 'Edit Purchase' : 'Add Purchase'}</DialogTitle>
            <DialogDescription className="text-xs font-mono">
              {selectedDateStr}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cost-input">Cost (฿)</Label>
              <Input
                id="cost-input"
                type="number"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveCost()}
              />
            </div>
          </div>

          <DialogFooter className="flex-row sm:justify-between items-center gap-2">
            <div>
              {markedDates.has(selectedDateStr) && (
                <Button variant="ghost" size="icon" className="text-danger hover:bg-danger/10" onClick={handleDeletePurchase}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCostDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveCost}>
                OK
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
